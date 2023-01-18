
require('dotenv').config();
const Uploader = require('../lib/upload');
const path = require('path');
const expect = require('chai').expect;
const { parseTwitterHandle, getTwitterHandle } = require('../lib/socialMedia');

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
      expect(getTwitterHandle(socialMediaLinksFixture)).to.equal('@cj_clippy')
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
      expect(parseTwitterHandle('https://www.twitter.com/intent/follow?screen_name=ironmouse')).to.equal(expectedHandle);
      expect(parseTwitterHandle('https://twitter.com/ironmouse?s=09')).to.equal(expectedHandle);
      expect(parseTwitterHandle('https://twitter.com/2AM_mocha')).to.equal('@2AM_mocha');
    })
    it('should strip out query parameters that streamers might have put there', function () {
      const expectedHandle = '@kaiourachu';
      expect(parseTwitterHandle('https://twitter.com/intent/user?screen_name=kaiourachu')).to.equal(expectedHandle);
    })
  })
  describe('upload', async function () {
    xit('should return a yt video ID', async function () {
      this.timeout(1000*60*10)
      const uploader = new Uploader()
      const id = await uploader.upload({ channel: 'ironmouse', videoFile: testVideo, date: testDate });
      expect(id).to.match(/[a-zA-Z0-9_-]/);
    });
  })
  describe('generateVideoDescription', function () {
    this.timeout(60*1000)
    it('should tag the vtuber\'s YT channel, if there is a yt channel in the data.', async function () {
      const uploader = new Uploader();
      const output = await uploader.generateVideoDescription('apricot', socialMediaLinks);
      console.log(output)
      expect(output).to.match(/https:\/\/www\.youtube\.com\/c\/ApricottheLichVS \n/)
      expect(output).to.match(/@Apricot the Lich \n/)
      expect(output).to.match(/@Apricot the Lich Twitch Archive \n/)
      expect(output).to.match(/  \* https:\/\/twitch.tv\/apricot/)
    })
  })

})