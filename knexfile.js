
require('dotenv').config();
const envImport = require('@grimtech/envimport');

module.exports = {
    development: {
      client: 'pg',
      connection: { user: envImport('DB_USER'), database: envImport('DB_NAME'), password: envImport('DB_PASS') },
      seeds: {
          directory: './seeds/'
      }
    }
}