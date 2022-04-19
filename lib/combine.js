

const { DateTime } = require('luxon')
const YoutubeDlWrap = require("youtube-dl-wrap")
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')
const Promise = require('bluebird')
const editly = require('editly')
const ffprobe = require('ffprobe')
const globby = require('globby')
const logger = require('./logger')




const rootOutputDir = path.join(__dirname, '..', 'output');

const outroClipSpecification = {
  layers: [
    {
      type: 'video',
      path: path.join(__dirname, '..', 'assets', 'outro.mp4')
    }
  ]
}

async function getEditlySpec (fileNames, fps, width, height, clips, outputFileName) {
  let spec = {
    defaults: {
      layer: { 
        fontPath: path.resolve(__dirname, '..', 'assets', 'Patua_One', 'PatuaOne-Regular.ttf')
      },
      transition: {
        duration: 0.2,
        name: 'directionalwipe'
      },
    },
    width,
    height,
    fps,
    keepSourceAudio: true,
    outPath: outputFileName,
    allowRemoteRequests: false,
    clips,
    // audioNorm: { enable: true, gaussSize: 91, maxGain: 100 }, // doesn't have an effect because we only have one audio stream at a time (editly limitation)
    verbose: true,
    fast: false // use this for testing
  }
  return spec
}

function configureEditlyLayer (clipDuration, clipInfo, fileName) {
  // see https://github.com/mifi/editly/tree/master/examples for reference
  const { creationDate, creatorDisplayName, title, views } = clipInfo;

  if (typeof clipDuration === 'undefined') {
    const msg = `the duration of ${fileName} must be >0, but it is undefined.`
    logger.error(msg)
    throw new Error(msg)
  }

  logger.info(`the duration is ${clipDuration}`);
  return {
    layers: [
      {
        type: 'video',
        path: fileName
      },
      {
        start: 0,
        stop: (clipDuration < 6) ? clipDuration : 6,
        type: 'subtitle',
        text: `${title} \nClipped by ${creatorDisplayName} on ${DateTime.fromISO(creationDate).toLocaleString(DateTime.DATE_FULL)}\n${views} views`
      },
    ]
  }
}

function getClipAbsoluteFileName (directory, clipInfo) {
  if (typeof directory === 'undefined' || typeof clipInfo === 'undefined') throw new Error('missing param!');
  const fn = `${clipInfo.id}.mp4`;
  const rfn = path.join(directory, fn);
  const afn = path.resolve(directory, rfn);
  return afn;
}



async function getVideoProbe (fileName) {
  let info = await ffprobe(fileName, { path: 'ffprobe' })
  let videoStream = info.streams.find((s) => s.codec_type === 'video')
  let juice = {
    fps: videoStream.r_frame_rate.split('/')[0],
    width: videoStream.width,
    height: videoStream.height,
    duration: videoStream.duration
  };
  return juice
}


async function combineClips (argv) {
  const { directory, outputFileName } = argv;
  if (typeof outputFileName === 'undefined') throw new Error('combineClips must have param.outputFileName but it was undefined')
  const manifestFile = path.resolve(directory, 'clipInfo.json');
  const manifest = require(manifestFile);
  // const manifest = require(manifestFile).slice(0, 2); // only use 2 videos (for testing)
  const relativeFileNames = manifest.map((m) => `${m.id}.mp4`);
  const fileNames = relativeFileNames.map((rfn) => path.resolve(directory, rfn));


  // Check to see if the video has already been generated.
  // To do this, we fs.stat outputFileName to see if the file exists
  // if the file exists, we skip generating a new video and simply return the filename.
  try {
    const stats = await fsp.stat(outputFileName);

    if (stats.birthtime) {
      logger.info(`The video file ${outputFileName} already exists so I am refusing to combineClips`)
      return outputFileName;
    }

  } catch (e) {
    // get the video size & framerate
    let probe = await getVideoProbe(fileNames[0]);
    let { fps, width, height } = probe;

    // create a editly specification
    let clipsSpecification = [];
    for await (clipInfo of manifest) {
      let clipFileName = getClipAbsoluteFileName(directory, clipInfo)
      let { duration } = await getVideoProbe(clipFileName);
      logger.info(`clipFileName:${clipFileName}, duration:${duration}`);
      let layer = configureEditlyLayer(duration, clipInfo, clipFileName)
      clipsSpecification.push(layer);
    };
    clipsSpecification.push(outroClipSpecification);

    let videoParams = await getEditlySpec(fileNames, fps, width, height, clipsSpecification, outputFileName);

    // use editly to generate the combined video
    await editly(videoParams);
    return outputFileName
  }
}

module.exports = {
  combineClips,
  getVideoProbe,
  getClipAbsoluteFileName,
  configureEditlyLayer,
  getEditlySpec
}