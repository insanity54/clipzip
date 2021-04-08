
require('dotenv').config();
const envImport = require('@grimtech/envimport');
const Daemon = require('./lib/daemon');
const knex = require('knex')({
  client: 'postgres',
  connection: {
    host : envImport('DB_HOST'),
    user : envImport('DB_USER'),
    password : envImport('DB_PASS'),
    database : envImport('DB_NAME')
  }
});


// const http = require('./lib/http')(knex);

(async () => {
    const daemon = new Daemon(knex);
    await daemon.schedule();
    // await daemon.schedule();
    // await daemon.run('ironmouse');
    // await daemon.upload('ironmouse', videoFile, YOUTUBE_CHANNEL_ID, date);
})();
// const daemon = new Daemon(envImport('JOBS')).run('ironmouse');
