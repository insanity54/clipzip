
const constants = require('./lib/constants');


module.exports = {
    development: {
      client: 'better-sqlite3',
      connection: { 
        filename: constants.dbpath 
      },
      seeds: {
          directory: './seeds/'
      },
      useNullAsDefault: true
}}