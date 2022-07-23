
const os = require('os');
const path = require('path');


module.exports = {
    dbpath: path.join(
        os.homedir(),
        '.local',
        'share',
        'clipzip',
        'clipzip.sqlite3'
    )
}