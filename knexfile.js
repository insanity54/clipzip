
require('dotenv').config();
const envImport = require('@grimtech/envimport');

module.exports = {
    development: {
      client: 'sqlite3',
      connection: { filename: './data/clipzip.sqlite' },
      seeds: {
          directory: './seeds/'
      }
    }
}