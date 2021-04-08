#!/usr/bin/env node


require('dotenv').config()

const path = require('path');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const Download = require('./lib/download');
const { combineClips } = require('./lib/combine');
const Uploader = require('./lib/upload');
const envImport = require('@grimtech/envimport');
const NormalizeVolume = require('normalize-volume');

const TWITCH_CLIENT_ID = envImport('TWITCH_CLIENT_ID');
const TWITCH_CLIENT_SECRET = envImport('TWITCH_CLIENT_SECRET');

const YOUTUBE_CLIENT_ID = envImport('YOUTUBE_CLIENT_ID');
const YOUTUBE_CLIENT_SECRET = envImport('YOUTUBE_CLIENT_SECRET');



const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
const ul = new Uploader(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET);

const combineCommandBuilder = (yargs) => {
  return yargs
    .option('directory', {
      alias: 'd',
      describe: 'Directory containing clip video files',
      nargs: 1
    });
}

const downloadCommandBuilder = (yargs) => {
  return yargs
    .option('twitch-channel', {
      alias: 'tv',
      describe: 'The twitch channel for which to download clips',
      nargs: 1,
      required: true
    })
    .option('end-date', {
      alias: 'ed',
      describe: 'Filter for the last elligible day a clip was created.',
      nargs: 1,
      example: '2021-03-31',
      required: true
    })
    .option('start-date', {
      alias: 'sd',
      describe: 'Filter for the first ellibible day a clip was created.',
      nargs: 1,
      example: '2021-03-01',
      required: true
    })
}

const uploadCommandBuilder = (yargs) => {
  return yargs
    .option('youtube-channel', {
      alias: 'yt',
      describe: 'The youtube channel to upload the video to',
      nargs: 1
    })
}




const arguments = yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command('download', 'Download clips from Twitch channel', downloadCommandBuilder, dl.downloadVideos)
  .command('combine', 'Combine clips together to make a compilation video', combineCommandBuilder , combineClips)
  .command('upload', 'Upload the compilation video to youtube', uploadCommandBuilder , ul.upload)
  .demandCommand()
  .argv

