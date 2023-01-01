/**
 * 
 * oauth.js
 * 
 * Logs us into google and stores auth data so we can later use the Youtube Data API to upload videos
 * 
 * 
 */


require('dotenv').config()
const express = require('express');
const { format: formatUrl } = require('url');
const fsp = require('fs/promises');
const open = require('open');
const execa = require('execa');
const { google } = require('googleapis');
const { dbpath, googleOauthScopes } = require('./constants')
const db = require('better-sqlite3')(dbpath);

const app = express()

const port = 8080;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
if (typeof GOOGLE_CLIENT_SECRET === 'undefined') throw new Error('GOOGLE_CLIENT_SECRET is undefined in env, but it must be defined.');
if (typeof GOOGLE_CLIENT_ID === 'undefined') throw new Error('GOOGLE_CLIENT_ID is undefined in env, but it must be defined.');


(async () => {


    (async function dbsetup() {
        const stmt = db.prepare('CREATE TABLE IF NOT EXISTS oauth (id INTEGER PRIMARY KEY AUTOINCREMENT, access_token STRING NOT NULL, refresh_token STRING NOT NULL, scope STRING NOT NULL, token_type STRING NOT NULL, expiry_date DATE NOT_NULL);')
        stmt.run()
    })()


    const redirect = 'http://localhost:8080/oauth/callback'

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirect
    );


    const loginUrl = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',

      // If you only need one scope you can pass it as a string
      scope: googleOauthScopes
    });

    open(loginUrl);


    app.get('/oauth/callback', async (req, res) => {
        const { code } = req.query
        let token


        try {
            if (typeof code === 'undefined') throw new Error('we did not receive an authorization code from goog')

            // This will provide an object with the access_token and refresh_token.
            // Save these somewhere safe so they can be used at a later time.
            const { tokens } = await oauth2Client.getToken(code)
            oauth2Client.setCredentials(tokens);

            const { access_token, refresh_token, scope, token_type, expiry_date } = tokens;

            // set tokens in db
            const statement = db.prepare('INSERT INTO oauth (access_token, refresh_token, scope, token_type, expiry_date) VALUES (?, ?, ?, ?, ?)');
            statement.run(access_token, refresh_token, scope, token_type, expiry_date)

            return res.redirect(`/done`)

        } catch (err) {
            console.log(err)
            console.log('Error! Redirecting to login')
            res.redirect('/')
        }
    })


    app.get('/done', (req, res) => {
        res.send('OK');
        process.exit();
    })
    app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
    })


})()