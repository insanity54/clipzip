
const execa = require('execa');
const schedule = require('node-schedule');
const { DateTime, Duration } = require('luxon');
const path = require('path');

const bindir = path.join(__dirname, '..');
const execOptions = {
    cwd: bindir,
    localDir: bindir,
    preferLocal: true
};
const executable = path.join(bindir, 'clipzip.js');


class Daemon {
    constructor (knex) {
        this.knex = knex;
        return this;
    }

    // schedule all download/combine/upload jobs
    async schedule () {
        const jobs = await this.knex('jobs').select('channel', 'schedule');
        console.log(jobs);
        for (const job of jobs) {
            const { schedule: scheduleDefinition, channel } = job;
            console.log(`⏲️ ${channel} scheduled for ${scheduleDefinition}`);
            schedule.scheduleJob(scheduleDefinition, this.run.bind(this, channel));
        }
        return this;
    }

    async run (channel) {
        let { startDate, endDate } = this.getDates();
        await this.download(channel, startDate, endDate);
        const fileName = await this.combine(channel, startDate, endDate);
        // if (typeof res.stderr === 'undefined') throw new Error(res.stderr);
        console.log('combine res--v')
        console.log(fileName);
        const { url } = await this.upload(channel, fileName, YOUTUBE_CHANNEL_ID, startDate);
        return this;
    }

    async combine (channel, startDate, endDate) {
        const directory = path.join(bindir, 'data', channel, `${startDate}_${endDate}`);
        console.log(`combining channel:${channel} at directory:${directory}`);
        let args = [
            'combine',
            '-d', directory
        ];
        const { stderr, stdout } = await execa(executable, args, execOptions);
        if (stderr) throw new Error(stderr);
        console.log(stdout);
        const fileName = stdout.match(/(?:\/[\w\d\w-_]+)+\.mp4$/);
        return fileName
    }

    async download (channel, startDate, endDate) {
        if (typeof channel === 'undefined') throw new Error('channel passed to download() was undefined')
        if (typeof startDate === 'undefined') throw new Error('startDate passed to download() was undefined')
        if (typeof endDate === 'undefined') throw new Error('endDate passed to download() was undefined')
        console.log(`downloading channel:${channel}`);
        let args = [
            'download',
            '--tv', channel,
            '--startDate', startDate,
            '--endDate', endDate
        ];
        await execa(executable, args, execOptions);
    }
    async upload (channel, videoFile, YOUTUBE_CHANNEL_ID, date) {
        const dRes = await this.knex('vtuberData').where({ name: channel }).limit(1);
        const vtuberData = dRes[0];
        console.log(`uploading channel:${channel} compilation to yt channel ${YOUTUBE_CHANNEL_ID}`);        
        await this.uploader.upload(channel, videoFile, date, vtuberData);
        console.log(`upload complete.`);
    }

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
