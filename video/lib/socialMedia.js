const { click, button, openBrowser, closeBrowser, $, goto, link, near, scrollDown } = require('taiko');
const logger = require('./logger');
const debug = require('debug')('clipzip')

// greets https://stackoverflow.com/a/37704433/1004931
const youTubeRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

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
    const urlRegex = /twitter\.com\/(?:intent\/\w+\?screen_name=)?([\w@]+)/;
    const match = urlRegex.exec(txt);
    const username = (match === null) ? txt : match[1];
    return username.includes('@') ? username : `@${username}`;
}

// get the vtuber's twitter
async function getTwitterProfile (channel) {
    throw new Error('NOT IMPLEMENTED @todo implement');
}


async function getYouTubeChannelName (channel, isDev = false) {
    let name = '';

    try {
        debug(`  [*] opening browser`)
        await openBrowser({ headless: (isDev) ? false : true });

        
        debug(`  [*] going to channel ${channel}`)
        await goto(channel);

        debug('  [*] awaiting body')
        await $('body').exists();

        // POTENTIAL SNAG-- cookie acceptance screen
        // await waitFor(async () => !(await $("ACCEPT ALL").exists()))
        debug(`  [*] waiting for potential cookie prompt`)
        const isButton = await button('Accept all').exists()

        if (isButton) {
            debug(`  [*] clicking 'Accept all' button`)
            await click(button('Accept all'))
        }




        debug('  [*] awaiting meta property og:title')
        name = await $("meta[property='og\:title']").attribute("content");
    } catch (e) {
        console.error(`error during getYouTubeChannelName: ${e}`);
    } finally {
        await closeBrowser();
    }

    if (name === '') throw new Error('Problem while getting youtube channel name.');
    return name;
}

// scrape twitch to get vTuber data
async function getVtuberData (channel, isDev = false) {
    logger.info(`getVtuberData channel:${channel}, isDev:${isDev}`)

    if (typeof channel === 'undefined') throw new error('channel passed to getVtuberData() was undefined');
    let socialMediaLinks = [];
    let displayName = '';
    try {
        logger.info(`opening browser`)
        await openBrowser({ headless: (isDev) ? false : true });
        logger.info(`going to twitch.tv/${channel}/about`);
        await goto(`twitch.tv/${channel}/about`, { navigationTimeout: 1000*60*5 });
        logger.info('scrolling down')
        await scrollDown();
        await $('.social-media-link').exists();

        let labels = await $('div.social-media-link a').elements();

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

function isYtChannelLink (link) {
    if (link.includes('watch?')) return false; // addresses https://github.com/insanity54/clipzip/issues/8
    return youTubeRegex.test(link);
}

module.exports = {
    getVtuberData,
    getTwitterHandle,
    parseTwitterHandle,
    getTwitterProfile,
    getYouTubeChannelName,
    youTubeRegex,
    isYtChannelLink
}