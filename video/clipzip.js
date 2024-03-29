#!/usr/bin/env node


require('dotenv').config()

const path = require('path');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const Download = require('./lib/download');
const { combineClips } = require('./lib/combine');
const Uploader = require('./lib/upload');
const envImport = require('@grimtech/envimport');
const Database = require('./lib/database');

const TWITCH_CLIENT_ID = envImport('TWITCH_CLIENT_ID');
const TWITCH_CLIENT_SECRET = envImport('TWITCH_CLIENT_SECRET');

const Daemon = require('./lib/daemon')

const dl = new Download(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
const ul = new Uploader();
const db = new Database();

const combineCommandBuilder = (yargs) => {
  return yargs
    .option('directory', {
      required: true,
      alias: 'd',
      describe: 'Directory containing clip video files',
      nargs: 1
    })
    .option('outputFileName', {
      required: true,
      alias: 'o',
      nargs: 1,
      describe: 'The path & name of the created video'
    })
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
    .option('videoFile', {
      describe: 'the video file to upload',
      alias: 'v',
      nargs: 1,
      required: true
    })
    .option('channel', {
      describe: 'The twitch channel. Must exist in vtuberData',
      alias: 'c',
      nargs: 1,
      required: true
    })
    .option('date', {
      describe: 'The date of the upload',
      alias: 'd',
      nargs: 1,
      required: true
    })
}

const allCommandBuilder = (yargs) => {
  return yargs
    .option('channel', {
      describe: 'the channel to process',
      alias: 'c',
      nargs: 1,
      required: true
    })
}

const dbCommandBuilder = (yargs) => {
  return yargs
    .option('init', {
      describe: 'create the database on disk',
      nargs: 0,
      required: false
    })
    .option('create', {
      describe: 'add a new vtuber channel to the db',
      nargs: 0,
      required: false
    })
    .option('read', {
      describe: 'show the database contents',
      nargs: 0,
      required: false
    })
    .option('update', {
      describe: 'update a record in the database',
      nargs: 0,
      required: false
    })
    .option('delete', {
      describe: 'delete a record from the database',
      nargs: 0,
      required: false
    })
    .option('dom', {
      describe: 'the day of the month on which the vtuber is scheduled',
      alias: 'd',
      nargs: 1,
      required: false
    })
    .option('id', {
      describe: 'ID of the vtuber in the database',
      alias: 'i',
      nargs: 1,
      required: false
    })
    .option('strikes', {
      describe: 'strikes that the vtuber has',
      alias: 's',
      nargs: 1,
      required: false
    })
    .option('channel', {
      describe: 'the channel name',
      alias: 'c',
      nargs: 1,
      required: false
    })
    .option('blacklisted', {
      describe: 'whether or not the vtuber channel is blacklisted',
      nargs: 1,
      required: false
    })
    .option('note', {
      describe: 'a note to attach to the vtuber. useful to show why a vtuber was blacklisted',
      nargs: 1,
      required: false
    })
}


const allProcess = (yargs) => {
  const { channel } = yargs;
  const d = new Daemon({});
  d.run(channel);
}

const arguments = yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command('download', 'Download clips from Twitch channel', downloadCommandBuilder, dl.downloadVideos)
  .command('combine', 'Combine clips together to make a compilation video', combineCommandBuilder , combineClips)
  .command('upload', 'Upload the compilation video to youtube', uploadCommandBuilder , ul.upload)
  .command('db', 'Query the database for scheduled vtuber channels', dbCommandBuilder, db.handleCli.bind(db))
  .command('all', 'Download, Combine, then Upload', allCommandBuilder, allProcess)
  .demandCommand()
  .argv

