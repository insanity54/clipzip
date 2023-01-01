require('dotenv').config();
const envImport = require('@grimtech/envimport');
const { DateTime } = require('luxon');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');
const fsp = fs.promises;
const { getTwitterHandle, parseTwitterHandle, getVtuberData, getYouTubeChannelName, isYtChannelLink } = require('./socialMedia');
const got = require('got');
const { dbpath, googleOauthScopes } = require('./constants')
const db = require('better-sqlite3')(dbpath)
const { google } = require('googleapis');
const debug = require('debug')('clipzip')

const { openBrowser, closeBrowser, $, goto, link, near, scrollDown } = require('taiko');
const ytUploader = require('/home/chris/Documents/youtube-uploader');
const logger = require('./logger');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
if (typeof GOOGLE_CLIENT_SECRET === 'undefined') throw new Error('GOOGLE_CLIENT_SECRET is undefined in env, but it must be defined.');
if (typeof GOOGLE_CLIENT_ID === 'undefined') throw new Error('GOOGLE_CLIENT_ID is undefined in env, but it must be defined.')

class Uploader {
    constructor () {
        this.upload = this.upload.bind(this);
        return this;
    }

    
    async generateVideoDescription (channel, socialMediaLinks) {
        let lines = [];
        lines.push(`Check out ${channel}!`);
        lines.push(`  * https://twitch.tv/${channel}`);

        let ytChannels = [];

        // add all hrefs to their own bulleted line
        // also, if the href is a yt channel link, keep track of it for later
        for (const href of socialMediaLinks) {
            if (isYtChannelLink(href)) {
                ytChannels.push(href);
            }
            lines.push(`  * ${href}`);
        }


        // use any yt channel links to tag the channel
        if (ytChannels.length > 0) {
            lines.push(''); // separate socials from YT channel tags
            for (const href of ytChannels) {
                const ytChannelName = await getYouTubeChannelName(href, debug.enabled);
                lines.push(`@${ytChannelName}`);
            }
        }

        const out = lines.join(' \n');
        return out;
    }




    async upload (args) {
        const { videoFile, channel, date } = args;

        if (typeof videoFile === 'undefined') throw new Error('videoFile passed to upload() was undefined')
        if (typeof channel === 'undefined') throw new Error('channel passed to upload() was undefined')
        if (typeof date === 'undefined') throw new Error('date passed to upload() was undefined')

        // get vtuber metadata from twitch

        console.log('>> [upload.js] channel getting metadata from twitch')
        const vtuberData = await getVtuberData(channel);

        logger.info('>> [upload.js] vtuberData is as follows.')
        logger.info(JSON.stringify(vtuberData, 0, 2));

        if (vtuberData.socialMediaLinks.length === 0) logger.warn(`vtuberData.socialMediaLinks was empty. This could be that the streamer hasn't filled out their profile (unlikely), or it can be that the script is not correctly scraping the streamer links from Twitch`)

        // assert existence of google API key file @todo future improvement https://github.com/insanity54/clipzip/issues/4
        // await fsp.stat(path.join(__dirname, '..', 'oauth2.keys.json'));

        const twitterHandle = getTwitterHandle(vtuberData.socialMediaLinks);
        const displayName = vtuberData.displayName === '' ? channel : vtuberData.displayName;
        const name = twitterHandle === '' ? channel : twitterHandle;

        console.log(`>> [upload.js] time to upload! twitterHandle:${twitterHandle}, displayName:${displayName}, name:${name}`);

        const description = await this.generateVideoDescription(channel, vtuberData.socialMediaLinks);

        // const videoMetadata = {
        //     title: `10 Most Viewed ${name} Clips ${DateTime.fromISO(date).toFormat('LLLL yyyy')}`,
        //     description: description,
        //     tags: ['vtuber'],
        //     privacyStatus: 'private',
        //     madeForKids: false,
        //     embeddable: true,
        //     publicStatsViewable: true,
        //     language: 'en'
        // };
        // const tmpMetaFile = `/tmp/video_metadata_${DateTime.now().toMillis()}.json`;
        // fsp.writeFile(tmpMetaFile, JSON.stringify(videoMetadata), { encoding: 'utf-8' });

        // return execa('youtubeuploader', ['-filename', videoFile, '-metaJSON', tmpMetaFile])

        return ytUploader({ 
            videoFile, 
            title: `10 Most Viewed ${name} Clips ${DateTime.fromISO(date).toFormat('LLLL yyyy')}`,
            description,
            userDataDir: '/home/chris/Documents/cj-sexy'
        });
    }
}




module.exports = Uploader