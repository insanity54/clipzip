// const { google } = require('googleapis');
const { DateTime } = require('luxon');
const path = require('path');
const fs = require('fs');
// const { OAuth2Client } = require('google-auth-library');
const http = require('http');
const url = require('url');
const destroyer = require('server-destroy');
const readline = require('readline');
const Youtube = require('youtube-api');
const execa = require('execa');
const fsp = fs.promises;


class Uploader {
    constructor (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET) {
        this.YOUTUBE_CLIENT_SECRET = YOUTUBE_CLIENT_SECRET;
        this.YOUTUBE_CLIENT_ID = YOUTUBE_CLIENT_ID;
        return this;
    }

    
    generateVideoDescription (channel, data) {
        let lines = [];
        lines.push(`Check out ${channel}!`);
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'name' && value) {
                lines.push(`  * ${key}: ${data[key]}`);
            }
        }
        const out = lines.join(' \n');
        return out;
    }


    async upload (channel, videoFile, date, vtuberData) {

        if (typeof vtuberData === 'undefined') throw new Error('vtuberData passed to upload() was undefined')
        if (typeof date === 'undefined') throw new Error('date passed to upload() was undefined')
        if (typeof videoFile === 'undefined') throw new Error('videoFile passed to upload() was undefined')
        if (typeof channel === 'undefined') throw new Error('channel passed to upload() was undefined')

        // @todo assert existence of oauth2.keys.json

        const videoMetadata = {
            title: `10 Most Viewed ${channel} Clips ${DateTime.fromISO(date).toFormat('LLLL yyyy')}`,
            description: this.generateVideoDescription(channel, data),
            tags: ['vtuber'],
            privacyStatus: 'private',
            madeForKids: false,
            embeddable: true,
            publicStatsViewable: true,
            language: 'en'
        }
        const tmpMetaFile = `/tmp/video_metadata_${DateTime.now().toMillis()}.json`;
        fsp.writeFile(tmpMetaFile, JSON.stringify(videoMetadata), { encoding: 'utf-8' });

        return execa('youtubeuploader', ['-filename', videoFile, '-metaJSON', tmpMetaFile])
    }
}




module.exports = Uploader