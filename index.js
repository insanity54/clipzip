#!/usr/bin/env node

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

const TWITCH_CLIENT_ID = envImport('TWITCH_CLIENT_ID');
const TWITCH_CLIENT_SECRET = envImport('TWITCH_CLIENT_SECRET');


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
    console.log('>> Combining')
    const videoFile = await combineClips({
        directory: path.join(__dirname, 'data', channel, `${startDate}_${endDate}`),
        outputFileName: path.join(__dirname, 'output', `${channel}_${startDate}_${endDate}.mp4`)
    });

    // Upload the video file to youtube using the upload module.
    console.log('>> Uploading');
    const uploader = new Uploader();
    await uploader.upload({ channel, videoFile, date: startDate });
    console.log('>> Uploading Finished')
}


async function main () {
    const dom = new Date().getDate();
    const res = await execa('./clipzip.js', ['db', '--read', '--dom', dom])
    const vtuberData = JSON.parse(res.stdout);

    const todaysVtubers = vtuberData;
    console.log(`todaysVtubers: ${JSON.stringify(todaysVtubers)}`)

    for (const vtuber of todaysVtubers) {
        const channel = vtuber['channel'];
        await dailyTask(channel);
    }
    
}


/**
 * # Quality Control
 * 
 * ## The problem
 * 
 * There are so many VTubers, and I only have so much compute time to render videos.
 * 
 * 
 * ## The solution
 * 
 * QC removes VTubers who don't meet a set of standards 3 months in a row.
 * A QC Strike is given if a standard is not met.
 * Strikes reset if QC runs with all standards met.
 * 
 * 
 * ### What are the conditions for a QC strike?
 * 
 *   * Vtubers with fewer than 10 clips (not enough clips for a compilation)
 *   * Inactive VTubers (hiatus, gratuated, retired, etc.)
 *   * Vtubers who clip themselves more than their audience does
 * 
 * 
 */
async function qualityControl (channel) {
    console.log('  [*] QUALITY CONTROL @todo implement');
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

main();
