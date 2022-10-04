
require('dotenv').config();
const Uploader = require('../lib/upload');
const path = require('path');
const envImport = require('@grimtech/envimport');
const YOUTUBE_CLIENT_ID = envImport('YOUTUBE_CLIENT_ID');
const YOUTUBE_CLIENT_SECRET = envImport('YOUTUBE_CLIENT_SECRET');
const PORT = envImport('PORT');
const expect = require('chai').expect;
const { parseTwitterHandle } = require('../lib/socialMedia');

const vtuberData = { 
  name: 'ironmouse', 
  youtube: 'https://www.youtube.com/channel/UChgPVLjqugDQpRLWvC7zzig', 
  twitter: 'https://twitter.com/ironmouse/', 
  discord: 'https://discord.com/invite/preciousfamily',
  tiktok: 'https://www.tiktok.com/@ironmouse?',
  patreon: 'https://www.patreon.com/ironmouse',
  twitch: 'https://www.twitch.tv/ironmouse', 
  sharkrobot: 'https://sharkrobot.com/collections/vshojo-store'
};

const socialMediaLinks = [
  'https://www.youtube.com/c/ApricottheLichVS',
  'https://twitter.com/LichVtuber',
  'https://www.youtube.com/c/ApricottheLichTwitchArchive'
];

const testVideo = path.join(__dirname, '..', 'output', '1617878726815.mp4');
const testDate = '2021-02-01';
const videoIdRegex = /[\w\d-_]{11}/;

describe('uploader', () => {

  describe('getTwitterHandle', function () {
    it('should return empty string if no twitter exists in the socialMediaLinks', function () {
      const socialMediaLinksFixture = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      ]
    })
    it('should accept an array of socialMediaLinks and return a twitter handle if it exists', function () {
      const socialMediaLinksFixture = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://ko-fi.com/cj_clippy',
        'https://twitter.com/cj_clippy'
      ]
      expect(Uploader.getTwitterHandle(socialMediaLinksFixture)).to.equal('@cj_clippy')
    })
  })
  describe('parseTwitterHandle', function () {
    it('should find a twitter @ handle in a URL of any variety', function () {
      const expectedHandle = '@ironmouse';
      expect(parseTwitterHandle('ironmouse')).to.equal(expectedHandle);
      expect(parseTwitterHandle('@ironmouse')).to.equal(expectedHandle);
      expect(parseTwitterHandle('https://twitter.com/ironmouse')).to.equal(expectedHandle);
      expect(parseTwitterHandle('https://twitter.com/@ironmouse')).to.equal(expectedHandle);
      expect(parseTwitterHandle('http://twitter.com/ironmouse')).to.equal(expectedHandle);
      expect(parseTwitterHandle('http://twitter.com/@ironmouse')).to.equal(expectedHandle);
      expect(parseTwitterHandle('twitter.com/@ironmouse')).to.equal(expectedHandle);
      expect(parseTwitterHandle('twitter.com/ironmouse')).to.equal(expectedHandle);
    })
    it('should strip out query parameters that streamers might have put there', function () {
      const expectedHandle = '@kaiourachu';
      expect(parseTwitterHandle('https://twitter.com/intent/user?screen_name=kaiourachu')).to.equal(expectedHandle);
    })
  })
  describe('upload', async function () {
    it('should return a yt video ID', async function () {
      this.timeout(1000*60*10)
      const uploader = new Uploader()
      const id = await uploader.upload({ channel: 'ironmouse', videoFile: testVideo, date: testDate });
      expect(id).to.match(/[a-zA-Z0-9_-]/);
    });
  })
  describe('generateVideoDescription', function () {
    this.timeout(30*1000)
    it('should tag the vtuber\'s YT channel, if there is a yt channel in the data.', async function () {
      const uploader = new Uploader();
      const output = await uploader.generateVideoDescription('apricot', socialMediaLinks);
      expect(output).to.match(/  \* @Apricot the Lich\n/);
      expect(output).to.match(/  \* @Apricot the Lich Twitch Archive\n/);
      expect(output).to.match(/  \* https:\/\/twitch.tv\/apricot/)
    })
  })
  describe('getVtuberData', function () {
    it('getVtuberData ironmouse', async function () {
      this.timeout(1000*60*2)
      const uploader = new Uploader()
      const data = await uploader.getVtuberData('ironmouse', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('ironmouse');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      expect(data.socialMediaLinks[0]).to.have.property('href');
      expect(data.socialMediaLinks[0]).to.have.property('text');
      setTimeout(() => { return }, 2000)
    })
    it('getVtuberData silvervale', async function () {
      this.timeout(1000*60*2)
      const uploader = new Uploader()
      const data = await uploader.getVtuberData('silvervale', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('Silvervale');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      expect(data.socialMediaLinks[0]).to.have.property('href');
      expect(data.socialMediaLinks[0]).to.have.property('text');
      expect(data.socialMediaLinks[0]).to.be.a('string');
      setTimeout(() => { return }, 2000)
    })
    it('getVtuberData kuzuryuio', async function () {
      this.timeout(1000*60*2)
      const uploader = new Uploader()
      const data = await uploader.getVtuberData('kuzuryuio', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('KuzuryuIo');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      expect(data.socialMediaLinks[0]).to.be.a('string');
      setTimeout(() => { return }, 2000)
    })
    it('getVtuberData apricot', async function () {
      this.timeout(1000*60*2)
      const uploader = new Uploader()
      const data = await uploader.getVtuberData('apricot', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('Apricot');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      expect(data.socialMediaLinks[0]).to.have.property('href');
      expect(data.socialMediaLinks[0]).to.have.property('text');
      expect(data.socialMediaLinks[0]).to.be.a('string');
      setTimeout(() => { return }, 2000)
    })
    it('getVtuberData zentreya', async function () {
      this.timeout(1000*60*2)
      const uploader = new Uploader()
      const data = await uploader.getVtuberData('zentreya', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('Zentreya');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      expect(data.socialMediaLinks[0]).to.be.a('string');
      setTimeout(() => { return }, 2000)
    })
  })
})