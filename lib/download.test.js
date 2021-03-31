require('dotenv').config();
const envImport = require('@grimtech/envimport');

const clientId = envImport('TWITCH_CLIENT_ID');
const clientSecret = envImport('TWITCH_CLIENT_SECRET');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth')
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });
const { getClips, downloadVideos, downloadVideo } = require('./download');

const ironmouseId = '175831187';
const startDate = '2021-03-01';
const endDate = '2021-03-31';

describe('download', () => {
    describe('getClips', () => {
        test('idk', async () => {
            const clips = await getClips(apiClient, ironmouseId, startDate, endDate);
            console.log(clips)
            return expect(clips.length).toBeGreaterThan(1);

        }, 30000)
    })
})