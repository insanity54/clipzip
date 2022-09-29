const { openBrowser, closeBrowser, $, goto, link, near, scrollDown } = require('taiko');
const logger = require('./logger');

function getTwitterHandle (socialMediaLinks) {
    let output = ''
    const twitterRegex = /twitter/;
    for (const link of socialMediaLinks) {
        if (twitterRegex.test(link)) {
            output = parseTwitterHandle(link)
        }
    }
    return output;
}

function parseTwitterHandle (txt) {
    if (typeof txt === 'undefined') throw new Error('parseTwitterHandle requires a string, but it got undefined which is unsupported')
    const urlRegex = /twitter.com\/(.*=)?(.*)/;
    const match = urlRegex.exec(txt);
    const username = (match === null) ? txt : match[2];
    return username.includes('@') ? username : `@${username}`;
}

// get the vtuber's twitter
async function getTwitterProfile (channel) {
    throw new Error('NOT IMPLEMENTED @todo implement');
}

// scrape twitch to get vTuber data
async function getVtuberData (channel, isDev = false) {
    logger.info(`getVtuberData channel:${channel}, isDev:${isDev}`)

    if (typeof channel === 'undefined') throw new error('channel passed to getVtuberData() was undefined');
    let socialMediaLinks = [];
    let displayName = '';
    try {
        logger.info(`opening browser`)
        // await openBrowser({ headless: (isDev) ? false : true });
        await openBrowser({ headless: false });
        logger.info(`going to twitch.tv/${channel}/about`);
        await goto(`twitch.tv/${channel}/about`, { navigationTimeout: 1000*60*5 });
        logger.info('scrolling down')
        await scrollDown();
        await $('.social-media-link').exists();

        let labels = await $('div.social-media-link a p.social-media-link-overflow').elements();

        for await (const label of labels) {
            const href = await link(near(label)).attribute('href');
            const text = await label.text();
            // only add unique links
            if (!socialMediaLinks.includes(href)) {
                socialMediaLinks.push(href);
            }
        }
        displayName = await $('h1.tw-title').text();
    } catch (error) {
        logger.error(`error while getting vtuber data: ${error}`);
    } finally {
        await closeBrowser();
    }
    let data = {
        socialMediaLinks, displayName
    }
    logger.info(`got the following vtuberData: \n${JSON.stringify(data, 0, 2)}`)
    return data
}

module.exports = {
    getVtuberData,
    getTwitterHandle,
    parseTwitterHandle,
    getTwitterProfile
}