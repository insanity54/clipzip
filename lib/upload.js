require('dotenv').config();
const envImport = require('@grimtech/envimport');
const { DateTime } = require('luxon');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');
const fsp = fs.promises;
const { openBrowser, closeBrowser, $, goto, link, near, scrollDown } = require('taiko');
const ytUploader = require('/home/chris/Documents/youtube-uploader');
const logger = require('./logger')


class Uploader {
    constructor () {
        this.upload = this.upload.bind(this);
        return this;
    }

    
    generateVideoDescription (channel, socialMediaLinks) {
        let lines = [];
        lines.push(`Check out ${channel}!`);
        lines.push(`  * https://twitch.tv/${channel}`);
        for (const href of socialMediaLinks) {
            lines.push(`  * ${href}`);
        }
        const out = lines.join(' \n');
        return out;
    }

    static getTwitterHandle (socialMediaLinks) {
        let output = ''
        const twitterRegex = /twitter/;
        for (const link of socialMediaLinks) {
            if (twitterRegex.test(link)) {
                output = Uploader.parseTwitterHandle(link)
            }
        }
        return output;
    }

    static parseTwitterHandle (txt) {
        if (typeof txt === 'undefined') throw new Error('parseTwitterHandle requires a string, but it got undefined which is unsupported')
        const urlRegex = /twitter.com\/(.*)/;
        const match = urlRegex.exec(txt);
        const username = (match === null) ? txt : match[1];
        return username.includes('@') ? username : `@${username}`;
    }

    // scrape twitch to get vTuber data
    async getVtuberData (channel, isDev = false) {
        logger.info(`getVtuberData channel:${channel}, isDev:${isDev}`)

        if (typeof channel === 'undefined') throw new error('channel passed to getVtuberData() was undefined');
        let socialMediaLinks = [];
        let displayName = '';
        try {
            logger.info(`opening browser`)
            // await openBrowser({ headless: (isDev) ? false : true });
            await openBrowser({ headless: false });
            logger.info(`going to twitch.tv/${channel}/about`);
            await goto(`twitch.tv/${channel}/about`, { navigationTimeout: 1000*60*5 });
            logger.info('scrolling down')
            await scrollDown();
            await $('.social-media-link').exists();

            let labels = await $('div.social-media-link a p.social-media-link-overflow').elements();

            logger.info(`found the following social media links`)
            logger.info(JSON.stringify(labels, 0, 2))
            
            for await (const label of labels) {
                const href = await link(near(label)).attribute('href');
                const text = await label.text();
                // only add unique links
                if (!socialMediaLinks.includes(href)) {
                    socialMediaLinks.push(href);
                }
            }
            displayName = await $('h1.tw-title').text();
        } catch (error) {
            logger.error(`error while getting vtuber data: ${error}`);
        } finally {
            await closeBrowser();
        }
        let data = {
            socialMediaLinks, displayName
        }
        logger.info(`got the following vtuberData: \n${JSON.stringify(data, 0, 2)}`)
        return data
    }


    async upload (args) {
        const { videoFile, channel, date } = args;

        if (typeof videoFile === 'undefined') throw new Error('videoFile passed to upload() was undefined')
        if (typeof channel === 'undefined') throw new Error('channel passed to upload() was undefined')
        if (typeof date === 'undefined') throw new Error('date passed to upload() was undefined')

        // get vtuber metadata from twitch
        console.log('>> [upload.js] channel getting metadata from twitch')
        const vtuberData = await this.getVtuberData(channel);

        logger.info('>> [upload.js] vtuberData is as follows.')
        logger.info(JSON.stringify(vtuberData, 0, 2));

        if (vtuberData.socialMediaLinks.length === 0) logger.warn(`vtuberData.socialMediaLinks was empty. This could be that the streamer hasn't filled out their profile (unlikely), or it can be that the script is not correctly scraping the streamer links from Twitch`)

        // assert existence of google API key file
        await fsp.stat(path.join(__dirname, '..', 'oauth2.keys.json'));

        const twitterHandle = Uploader.getTwitterHandle(vtuberData.socialMediaLinks);
        const displayName = vtuberData.displayName === '' ? channel : vtuberData.displayName;
        const name = twitterHandle === '' ? channel : twitterHandle;

        console.log(`>> [upload.js] time to upload! twitterHandle:${twitterHandle}, displayName:${displayName}, name:${name}`)

        const videoMetadata = {
            title: `10 Most Viewed ${name} Clips ${DateTime.fromISO(date).toFormat('LLLL yyyy')}`,
            description: this.generateVideoDescription(channel, vtuberData.socialMediaLinks),
            tags: ['vtuber'],
            privacyStatus: 'private',
            madeForKids: false,
            embeddable: true,
            publicStatsViewable: true,
            language: 'en'
        }
        const tmpMetaFile = `/tmp/video_metadata_${DateTime.now().toMillis()}.json`;
        fsp.writeFile(tmpMetaFile, JSON.stringify(videoMetadata), { encoding: 'utf-8' });

        // return execa('youtubeuploader', ['-filename', videoFile, '-metaJSON', tmpMetaFile])
        return ytUploader({videoFile, title: videoMetadata.title, description: videoMetadata.description});
    }
}




module.exports = Uploader