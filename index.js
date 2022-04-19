
require('dotenv').config();
const envImport = require('@grimtech/envimport');
const Daemon = require('./lib/daemon');
const jobs = require('./data/jobs.json');


(async () => {
    const daemon = new Daemon(jobs);
    await daemon.schedule();
})();
