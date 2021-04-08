require('dotenv').config();
const envImport = require('@grimtech/envimport');
const express = require('express');
const app = express();
const YoutubeV3Strategy = require('passport-youtube-v3').Strategy
const passport = require('passport');
const PORT = envImport('PORT');
const YOUTUBE_CLIENT_SECRET = envImport('YOUTUBE_CLIENT_SECRET');
const YOUTUBE_CLIENT_ID = envImport('YOUTUBE_CLIENT_ID');
const { OAuth2Client } = require('google-auth-library');
const url = require('url');

let reqCount = 0;
const getRequestNumber = () => {
    return reqCount++;
}

const http = (knex) => {

    app.set('view engine', 'pug')
    app.set('views', './views');
    // app.use(passport.initialize());

    // passport.serializeUser(function(user, done) {
    //   done(null, user);
    // });

    // passport.deserializeUser(function(user, done) {
    //   done(null, user);
    // });

    // passport.use(new YoutubeV3Strategy({
    //         clientID: envImport('YOUTUBE_CLIENT_ID'),
    //         clientSecret: envImport('YOUTUBE_CLIENT_SECRET'),
    //         callbackURL: `http://localhost:${PORT}/auth/youtube/callback`,
    //         scope: [
    //             'https://www.googleapis.com/auth/youtube',
    //             'https://www.googleapis.com/auth/youtube.upload'
    //         ]
    //     },
    //     async function(accessToken, refreshToken, profile, done) {
    //         // console.log(`successful auth. profile: \n${JSON.stringify(profile, 0, 2)}`)
    //         // cache the accessToken so we can use it for subsequent API requests
    //         const { id: userId } = profile;
    //         try {
    //             await knex
    //                     .insert({ userId, accessToken, refreshToken })
    //                     .into('ytsessions');
    //         } catch (e) {
    //             return done(null, false, { message: JSON.stringify(e, 0, 2) });
    //         } finally {
    //             return done(null, userId);
    //         }
    //     }
    // ));

    // app.get('/auth/youtube', passport.authenticate('youtube'));

    // app.get(
    //     '/auth/youtube/callback',
    //     passport.authenticate('youtube', {
    //         successRedirect: '/',
    //         failureRedirect: '/login'
    //     })
    // );
    app.get('/auth/youtube/callback', async (req, res) => {
        console.log(`request number ${getRequestNumber()}`);

        try {
            // acquire the code from the querystring, and close the web server.
            const qs = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
            const code = qs.get('code');
            console.log(`Code is ${code}`);

            // Now that we have the code, use that to acquire tokens.
            // Pass along the generated code verifier that matches our code challenge.
            const oAuth2Client = new OAuth2Client({
                clientId: YOUTUBE_CLIENT_ID,
                clientSecret: YOUTUBE_CLIENT_SECRET,
                redirectUri:  `http://localhost:${PORT}/auth/youtube/callback`,
                forceRefreshOnFailure: true
            });

            const r = await oAuth2Client.getToken({code});
            console.log(r);
            const { tokens } = r;
            const { access_token, refresh_token, scope, token_type, expiry_date } = tokens;



            // Save token in db for later use
            const timestamp = knex.fn.now();
            await knex('ytsessions').insert({ 
                access_token,
                refresh_token,
                scope,
                token_type,
                expiry_date: expiry_date.toString(),
                updated_at: timestamp,
                created_at: timestamp
            });


            res.end('Authentication successful! Carry on.');
        } catch (e) {
            console.error(e);
            res.status(400).send('error')
        }


    });

    app.get('/auth/youtube', async (req, res) => {
        const oAuth2Client = new OAuth2Client(
            YOUTUBE_CLIENT_ID,
            YOUTUBE_CLIENT_SECRET,
            `http://localhost:${PORT}/auth/youtube/callback`
        );

        // Generate the url that will be used for the consent dialog.
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            prompt: 'consent',
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/youtube',
                'https://www.googleapis.com/auth/youtube.upload'
            ]
        });

        // Forward the user to the auth url
        res.redirect(authorizeUrl);
    })

    app.get('/', (req, res) => {
        res.render('index');
    })

    app.get('/login', (req, res) => {
        res.render('login');
    })


    app.listen(PORT, () => {
        console.log(`app listening on port ${PORT}`);
    })

    return app;

}

// async getAuthenticatedClient() {
//         // create an oAuth client to authorize the API call. Secrets are kept in a
//         // `keys.json` file, which should be downloaded from the Google Developers
//         // Console.
//         const oAuth2Client = new OAuth2Client(
//             envImport('YOUTUBE_CLIENT_ID'),
//             envImport('YOUTUBE_CLIENT_SECRET'),
//             `http://localhost:${PORT}/auth/youtube/callback`
//         );

//         // Generate a code_verifier and code_challenge
//         const codes = await oAuth2Client.generateCodeVerifierAsync();
//         console.log(codes);

//         // Generate the url that will be used for the consent dialog.
//         const authorizeUrl = oAuth2Client.generateAuthUrl({
//             access_type: 'offline',
//             scope: [
//                 'https://www.googleapis.com/auth/youtube',
//                 'https://www.googleapis.com/auth/youtube.upload'
//             ],
//             // When using `generateCodeVerifier`, make sure to use code_challenge_method 'S256'.
//             code_challenge_method: 'S256',
//             // Pass along the generated code challenge.
//             code_challenge: codes.codeChallenge,
//         });

//         // Open an http server to accept the oauth callback. In this simple example,
//         // the only request to our webserver is to /oauth2callback?code=<code>.
//         return new Promise((resolve, reject) => {
//         const server = http
//           .createServer(async (req, res) => {
//             try {
//               if (req.url.indexOf('/auth/youtube/callback') > -1) {
//                 // acquire the code from the querystring, and close the web server.
//                 const qs = new url.URL(req.url, `http://localhost:${PORT}`)
//                   .searchParams;
//                 const code = qs.get('code');
//                 console.log(`Code is ${code}`);
//                 res.end('Authentication successful! Please return to the console.');
//                 server.destroy();

//                 // Now that we have the code, use that to acquire tokens.
//                 // Pass along the generated code verifier that matches our code challenge.
//                 const r = await oAuth2Client.getToken({
//                   code,
//                   codeVerifier: codes.codeVerifier,
//                 });

//                 // Make sure to set the credentials on the OAuth2 client.
//                 oAuth2Client.setCredentials(r.tokens);
//                 console.info('Tokens acquired.');
//                 resolve(oAuth2Client);
//               }
//             } catch (e) {
//               reject(e);
//             }
//           })
//           .listen(PORT, () => {
//             // open the browser to the authorize url to start the workflow
//             opn(authorizeUrl, {wait: false}).then(cp => cp.unref());
//           });
//         destroyer(server);
//         });
//         }
//     }


module.exports = http;