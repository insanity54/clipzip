
const os = require('os');
const path = require('path');


module.exports.dbpath = path.join(
    os.homedir(),
    '.local',
    'share',
    'clipzip',
    'clipzip.sqlite3'
);


module.exports.googleOauthScopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
]