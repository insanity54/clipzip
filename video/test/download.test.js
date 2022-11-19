require('dotenv').config();
const envImport = require('@grimtech/envimport');
const expect = require('chai').expect;

const TWITCH_CLIENT_ID = envImport('TWITCH_CLIENT_ID');
const TWITCH_CLIENT_SECRET = envImport('TWITCH_CLIENT_SECRET');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth')
const authProvider = new ClientCredentialsAuthProvider(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
const apiClient = new ApiClient({ authProvider });
const Download = require('../lib/download');
const { getEventListeners } = require('events');
const fsp = require('fs/promises');


const ironmouseId = '175831187';
const startDate = '2021-03-01';
const endDate = '2021-03-31';
const sampleClipInfo = {
    broadcasterDisplayName: 'ironmouse',
    broadcasterId: 'ironmouse',
    creationDate: '2021-03-17T01:17:31.000Z',
    creatorDisplayName: 'DavidGXonTwitch',
    creatorId: '566488094',
    embedUrl: 'https://clips.twitch.tv/embed?clip=ImpossibleNiceCamelTooSpicy-Z6z3PwNFGbNMxBPN',
    gameId: '509658',
    id: 'ImpossibleNiceCamelTooSpicy-Z6z3PwNFGbNMxBPN',
    language: 'en',
    thumbnailUrl: 'https://clips-media-assets2.twitch.tv/AT-cm%7C1094296486-preview-480x272.jpg',
    title: 'Hime Hajime mousepad??',
    url: 'https://clips.twitch.tv/ImpossibleNiceCamelTooSpicy-Z6z3PwNFGbNMxBPN',
    videoId: '952169985',
    views: 63
};


describe('download', function () {
    describe('downloadVideo', function () {
        it('should download a clip from twitch', async function () {
            this.timeout(1000*60);
            const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
            const testClipInfo = { url: 'https://clips.twitch.tv/EnthusiasticElatedPresidentWow-b9DX_bNJOed7NOiB' };
            const testDownloadPath = '/tmp/EnthusiasticElatedPresidentWow-b9DX_bNJOed7NOiB.mp4';
            const { filename } = await dl.downloadVideo(testClipInfo, testDownloadPath);
            expect(filename).to.include('EnthusiasticElatedPresidentWow-b9DX_bNJOed7NOiB');
        })

        it('should resolve with completionPercentage 100', async function () {
            this.timeout(1000*60*3);
            const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
            const testClipInfo = { url: 'https://clips.twitch.tv/EnthusiasticElatedPresidentWow-b9DX_bNJOed7NOiB' };
            const testDownloadPath = '/tmp/EnthusiasticElatedPresidentWow-b9DX_bNJOed7NOiB.mp4';
            const { filename, completionPercentage } = await dl.downloadVideo(testClipInfo, testDownloadPath);
            expect(completionPercentage).to.equal(100);
        })

        it('should retry when a downloaded clip is incomplete', async function () {
            this.timeout(1000*60*3);
            const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
            const url = 'https://www.twitch.tv/projektmelody/clip/SassyAggressiveLorisAMPEnergyCherry-Qmd0X2yoOmq3-YN1'
            const downloadPath = '/tmp/truncated-clip.mp4';
            try {
                await fsp.unlink(downloadPath);
            } catch (e) {
                console.log('we ok')
            }
            const filename = await dl.downloadVideo(url, downloadPath);

            // setTimeout(() => {
            //     // simulate bad network
            //     console.log('  [A] Aborting! (Simulating bad network.)');
            //     controller.abort();
            //     // console.log(controller.signal)
            //     // console.log(controller.signal.eventEmitter)
            // }, 15000);


            expect(filename).to.equal(downloadPath);
        })
    })
    describe('getClips', function () {
        it('idk', async function () {
            this.timeout(30000);
            const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
            const clips = await dl.getClips(ironmouseId, startDate, endDate);
            return expect(clips.length).to.be.greaterThan(1);
        })
    })
    describe('getOutputPath', function () {
        it('getOutputPath output', function () {
            const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
            const broadcasterDisplayName = 'ironmouse';
            const startDate = '2021-01-01';
            const endDate = '2021-01-31';
            const output = dl.getOutputPath(broadcasterDisplayName, startDate, endDate);
            expect(output).to.equal('/home/chris/Documents/clipzip/data/ironmouse/2021-01-01_2021-01-31')
        })
    })
    describe('prepareDownloadPath', function () {
        it('prepareDownloadPath output', async function () {
            const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
            const startDate = '2021-01-01';
            const endDate = '2021-01-31';
            const output = await dl.prepareDownloadPath(startDate, endDate, sampleClipInfo);
            expect(output).to.equal('/home/chris/Documents/clipzip/data/ironmouse/2021-01-01_2021-01-31/ImpossibleNiceCamelTooSpicy-Z6z3PwNFGbNMxBPN.mp4')
        })
    })
    describe('getManifestPath', function () {
        it('getManifestPath output', function () {
            const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
            const startDate = '2021-01-01';
            const endDate = '2021-01-31';
            const output = dl.getManifestPath('ironmouse', startDate, endDate);
            expect(output).to.equal('/home/chris/Documents/clipzip/data/ironmouse/2021-01-01_2021-01-31/clipInfo.json')
        })
    })
    describe('downloadVideos', function () {
        it('video downloading', async function () {
            this.timeout(1000*60*5);
            const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
            const args = { endDate, startDate, twitchChannel: sampleClipInfo.broadcasterDisplayName };
            const manifestFilePath = await dl.downloadVideos(args);
            expect(manifestFilePath).to.equal('/home/chris/Documents/clipzip/data/ironmouse/2021-03-01_2021-03-31/clipInfo.json')
        })
    })
})