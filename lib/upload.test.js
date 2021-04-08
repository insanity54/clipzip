
require('dotenv').config();
const Uploader = require('./upload');
const path = require('path');
const envImport = require('@grimtech/envimport');
const YOUTUBE_CLIENT_ID = envImport('YOUTUBE_CLIENT_ID');
const YOUTUBE_CLIENT_SECRET = envImport('YOUTUBE_CLIENT_SECRET');
const YOUTUBE_CHANNEL_ID = envImport('YOUTUBE_CHANNEL_ID');
const PORT = envImport('PORT');
const knex = require('knex')({
  client: 'postgres',
  connection: {
    host : envImport('DB_HOST'),
    user : envImport('DB_USER'),
    password : envImport('DB_PASS'),
    database : envImport('DB_NAME')
  }
});
const vtuberData = { 
  name: 'ironmouse', 
  youtube: 'https://www.youtube.com/channel/UChgPVLjqugDQpRLWvC7zzig', 
  twitter: 'https://twitter.com/ironmouse/', 
  discord: 'https://discord.com/invite/preciousfamily',
  tiktok: 'https://www.tiktok.com/@ironmouse?',
  patreon: 'https://www.patreon.com/ironmouse',
  twitch: 'https://www.twitch.tv/ironmouse', 
  sharkrobot: 'https://sharkrobot.com/collections/vshojo-store'
},

const testVideo = path.join(__dirname, '..', 'output', '1617382903868.mp4');
const testDate = '2021-02-01';
const videoIdRegex = /[\w\d-_]{11}/;

describe('uploader', () => {
  beforeEach(() => {
    uploader = new Uploader(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)
  })
    test('upload', async () => {
        const res = await uploader.upload('ironmouse', testVideo, testDate, vtuberData);
        console.log(res);
        expect(res).toHaveProperty('config');
        expect(res).toMatch(videoIdRegex);
    })
})