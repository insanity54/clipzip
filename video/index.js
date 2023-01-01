
require('dotenv').config();
const execa = require('execa');
const { emailAdmin } = require('./lib/notifications');
const { DateTime, Duration } = require('luxon');
const path = require('path');
const executable = path.join(__dirname, 'clipzip.js');
const { combineClips } = require('./lib/combine');
const Uploader = require('./lib/upload');
const envImport = require('@grimtech/envimport');
const Download = require('./lib/download');
const { qualityControl } = require('./lib/qualityControl');;

const TWITCH_CLIENT_ID = envImport('TWITCH_CLIENT_ID');
const TWITCH_CLIENT_SECRET = envImport('TWITCH_CLIENT_SECRET');


// greets https://stackoverflow.com/a/962890/1004931
const shuffle = function (array) {
    var tmp, current, top = array.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    return array;
}


const execOptions = {
    cwd: __dirname,
    localDir: __dirname,
    preferLocal: true,
    stdio: 'inherit'
};

/**
 * This file is meant to be invoked once per day
 * by systemd or cron.
 * 
 * It finds the vtubers who's 
 *   * day of month is today,
 *   * is not blacklisted
 *   * has strikes less-than 3
 * 
 */

function getDates (nowISODate = DateTime.now().toISODate()) {
    const twoMonths = Duration.fromISO('P2M');
    const oneMonth = Duration.fromISO('P1M');
    const oneDay = Duration.fromISO('P1D');
    const monthBeforeLast = DateTime.fromISO(nowISODate).minus(twoMonths).toObject();
    const startDate = DateTime.fromObject({...monthBeforeLast, day: 1}).toISODate();
    const endDate = DateTime.fromISO(startDate).plus(oneMonth).minus(oneDay).toISODate();
    return {
        startDate,
        endDate
    }
}


async function createCompilation (channel) {
    console.log(`>> creatingCompilation for channel ${channel}`)

    let { startDate, endDate } = getDates();

    // Download the Twitch.tv channel's most viewed clips using the download module
    console.log('>> Downloading Started');

    const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
    await dl.downloadVideos({twitchChannel: channel, startDate, endDate});

    console.log('>> Downloading Finished');

    // Combine clips into one video file using the combine module
    console.log('>> Combining');
    const videoFile = await combineClips({
        directory: path.join(__dirname, 'data', channel, `${startDate}_${endDate}`),
        outputFileName: path.join(__dirname, 'output', `${channel}_${startDate}_${endDate}.mp4`)
    });

    // Upload the video file to youtube using the upload module.
    console.log('>> Uploading');
    const uploader = new Uploader();
    await uploader.upload({ channel, videoFile, date: startDate });
    console.log('>> Uploading Finished');
}


async function main () {
    const dom = new Date().getDate();
    const res = await execa('./clipzip.js', ['db', '--read', '--dom', dom])
    const vtuberData = JSON.parse(res.stdout);


    // the vtuber data is sorted by database ID, which means we are going to process the channel by clipzip seniority.
    // I don't want that, because there are days when I terminate clipzip because it's taking too long and using too much
    // internet bandwidth.
    // Instead, I want random sort, so it's not always the same channels getting clipped every month (unless they are paying me to guarantee a compilation every month)
    const todaysVtubers = shuffle(vtuberData);


    console.log(`todaysVtubers: ${JSON.stringify(todaysVtubers.map((v) => v.channel))}`)

    for (const vtuber of todaysVtubers) {
        const channel = vtuber['channel'];
        await dailyTask(channel);
    }
    
}



async function dailyTask (channel) {
    try {
        await createCompilation(channel);
        await qualityControl(channel);
        await emailAdmin(`${channel} compilation completed successfully.`);
    } catch (e) {
        // 1 strike if there are less than 10 clips
        // (this is to remove inactive channels)
        console.log(`  INDEX.JS CAN SEE THE FOLLOWING ERROR CODE--> ${e.code}`);
        if (e.code === 'LTTENCLIPS') incrementStrikes(channel);
        else {
            console.error(e);
            await emailAdmin(`${channel} error:${e} (${e.type})`);
        }
    }
}


async function incrementStrikes (channel) {
    const pRead = await execa('./clipzip.js', ['db', '--read', '--channel', channel]);
    
    const datum = JSON.parse(pRead.stdout)[0];
    let strikes = parseInt(datum.strikes);
    const id = parseInt(datum.id);

    const pWrite = await execa('./clipzip.js', ['db', '--update', '--id', id, '--strikes', strikes+=1]);
}

console.log(`NODE is version ${process.version}`);
main();
//console.log('IMA FAKE RUNNING!')
