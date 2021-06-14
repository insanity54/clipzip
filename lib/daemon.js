
const execa = require('execa');
const schedule = require('node-schedule');
const { DateTime, Duration } = require('luxon');
const path = require('path');
const logger = require('./logger')

const bindir = path.join(__dirname, '..');
const execOptions = {
    cwd: bindir,
    localDir: bindir,
    preferLocal: true,
    stdio: 'inherit'
};
const executable = path.join(bindir, 'clipzip.js');
const { combineClips } = require('./combine');
const Uploader = require('./upload');

class Daemon {
    constructor (jobs) {
        if (typeof jobs === 'undefined') throw new Error('jobs passed to Daemon() must be defined.')
        this.jobs = jobs;
        return this;
    }

    // schedule all download/combine/upload jobs
    async schedule () {
        for (const job of this.jobs) {
            const { schedule: scheduleDefinition, channel } = job;
            logger.info(`⏲️ ${channel} scheduled for ${scheduleDefinition}`);
            schedule.scheduleJob(scheduleDefinition, this.run.bind(this, channel));
        }
        return this;
    }

    async run (channel) {
        let { startDate, endDate } = this.getDates();

        // Download the Twitch.tv channel's most viewed clips using the download module
        await this.download(channel, startDate, endDate);

        // Combine clips into one video file using the combine module
        const videoFile = await combineClips({
            directory: path.join(bindir, 'data', channel, `${startDate}_${endDate}`),
            outputFileName: path.join(bindir, 'output', `${channel}_${startDate}_${endDate}.mp4`)
        });

        // Upload the video file to youtube using the upload module.
        const uploader = new Uploader()
        await uploader.upload({ channel, videoFile, date: startDate });
        return this;
    }

    // async combine (channel, startDate, endDate) {
    //     const directory = path.join(bindir, 'data', channel, `${startDate}_${endDate}`);
    //     logger.info(`combining channel:${channel} at directory:${directory}`);
    //     let args = [
    //         'combine',
    //         '-d', directory
    //     ];
    //     const { stderr, stdout } = await execa(executable, args, execOptions);
    //     if (stderr) throw new Error(stderr);
    //     logger.info(stdout);
    //     const fileName = stdout.match(/(?:\/[\w\d\w-_]+)+\.mp4$/);
    //     return fileName
    // }

    async download (channel, startDate, endDate) {
        if (typeof channel === 'undefined') throw new Error('channel passed to download() was undefined')
        if (typeof startDate === 'undefined') throw new Error('startDate passed to download() was undefined')
        if (typeof endDate === 'undefined') throw new Error('endDate passed to download() was undefined')
        logger.info(`downloading channel:${channel}`);
        let args = [
            'download',
            '--tv', channel,
            '--startDate', startDate,
            '--endDate', endDate
        ];
        await execa(executable, args, execOptions);
    }
    // async upload (channel, videoFile, date) {
    //     logger.info(`uploading ${channel} compilation to yt`);        
    //     await this.uploader.upload({channel, videoFile, date});
    //     logger.info(`upload complete.`);
    // }

    getDates (nowISODate = DateTime.now().toISODate()) {
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
}



module.exports = Daemon;
