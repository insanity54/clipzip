#!/usr/bin/env node


require('dotenv').config()

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { ApiClient } = require('twitch')
const { ClientCredentialsAuthProvider } = require('twitch-auth')
const { DateTime } = require('luxon')
const YoutubeDlWrap = require("youtube-dl-wrap")
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')
const Promise = require('bluebird')
const editly = require('editly')
const ffprobe = require('ffprobe')
const globby = require('globby')
const Download = require('./lib/download');
const envImport = require('@grimtech/envimport');


const clientId = envImport('TWITCH_CLIENT_ID');
const clientSecret = envImport('TWITCH_CLIENT_SECRET');
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret)
const apiClient = new ApiClient({ authProvider });
const youtubeDlWrap = new YoutubeDlWrap();
const rootOutputDir = path.join(__dirname, 'output');

const dl = new Download(apiClient);

const combineCommandBuilder = (yargs) => {
  return yargs
    .option('directory', {
      alias: 'd',
      describe: 'Directory containing clip video files',
      nargs: 1
    });
}

const downloadCommandBuilder = (yargs) => {
  return yargs
    .option('twitch-channel', {
      alias: 'tv',
      describe: 'The twitch channel for which to download clips',
      nargs: 1,
      required: true
    })
    .option('end-date', {
      alias: 'ed',
      describe: 'Filter for the last elligible day a clip was created.',
      nargs: 1,
      example: '2021-03-31',
      required: true
    })
    .option('start-date', {
      alias: 'sd',
      describe: 'Filter for the first ellibible day a clip was created.',
      nargs: 1,
      example: '2021-03-01',
      required: true
    })
}

const uploadCommandBuilder = (yargs) => {
  return yargs
    .option('youtube-channel', {
      alias: 'yt',
      describe: 'The youtube channel to upload the video to',
      nargs: 1
    })
}



const arguments = yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command('download', 'Download clips from Twitch channel', downloadCommandBuilder, dl.downloadVideos)
  .command('combine', 'Combine clips together to make a compilation video', combineCommandBuilder , combineClips)
  .command('upload', 'Upload the compilation video to youtube', uploadCommandBuilder , uploadCompilation)
  .demandCommand()
  .argv



function uploadCompilation(argv) {

}




async function getVideoProbe (fileName) {
  console.log(`getting video probe ${fileName}`);
  let info = await ffprobe(fileName, { path: 'ffprobe' })
  let videoStream = info.streams.find((s) => s.codec_type === 'video')
  let juice = {
    fps: videoStream.r_frame_rate.split('/')[0],
    width: videoStream.width,
    height: videoStream.height
  }
  return juice
}

async function getEditlySpec (fileNames, fps, width, height, clips) {
  let spec = {
    defaults: {
      layer: { 
        fontPath: path.resolve(__dirname, 'assets', 'Recursive', 'static', 'Recursive-SemiBold.ttf'),
      },
      transition: {
        duration: 0.5,
        name: 'InvertedPageCurl'
      },
    },
    width,
    height,
    fps,
    keepSourceAudio: true,
    outPath: path.join(rootOutputDir, `${DateTime.now().toMillis()}.mp4`),
    allowRemoteRequests: false,
    clips
  }
  return spec
}

function configureEditlyLayer (clipInfo, fileName) {
  // see https://github.com/mifi/editly/tree/master/examples for reference
  const { creationDate, creatorDisplayName, title, views } = clipInfo;
  return {
    layers: [
      {
        type: 'video',
        path: fileName
      },
      {
        type: 'subtitle',
        text: `${title} \nClipped by ${creatorDisplayName} \n${views} views`,
        duration: 4
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


async function combineClips (argv) {
  const { directory } = argv;
  const manifestFile = path.resolve(directory, 'clipInfo.json');
  const manifest = require(manifestFile);
  // const manifest = require(manifestFile).slice(0, 2); // only use 2 videos (for testing)
  const relativeFileNames = manifest.map((m) => `${m.id}.mp4`);
  const fileNames = relativeFileNames.map((rfn) => path.resolve(directory, rfn));
  console.log('filenames')
  console.log(fileNames)
  console.log(fileNames[0])

  let { fps, width, height } = await getVideoProbe(fileNames[0]);
  let clipsSpecification = manifest.map((clipInfo) => configureEditlyLayer(clipInfo, getClipAbsoluteFileName(directory, clipInfo)));


  let videoParams = await getEditlySpec(fileNames, fps, width, height, clipsSpecification)
  // console.log(JSON.stringify(videoParams, 0, 4))
  await editly(videoParams)
}



// async function main(arguments) {

//   console.log(`Downloading clips from channel:${arguments.channel} for targetYear:${targetYear}, targetMonth:${targetMonth} into the folder ${path.join(dataDir, channelName, targetYear, targetMonth)}`)

//   await fsp.mkdir(path.join(dataDir, channelName, targetYear, targetMonth), { recursive: true })
//   let user = await apiClient.helix.users.getUserByName(arguments.channel)
//   let clips = await getClips(apiClient, user._data.id, startDate, endDate);

// }

// main(arguments)
// (async function clipzip() {
//   await combineClips()
// })()

