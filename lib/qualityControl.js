const { openBrowser, closeBrowser, $, goto, link, near, scrollDown } = require('taiko');
const { getVtuberData, getTwitterHandle } = require('./socialMedia');
const logger = require('./logger')


const isDev = process.env.NODE_ENV === 'production' ? false : true;
console.log(`isDev:${isDev}`)

/**
 * # Quality Control
 * 
 * ## The problem
 * 
 * There are so many VTubers, and I only have so much compute time to render videos.
 * 
 * 
 * ## The solution
 * 
 * QC removes VTubers who don't meet a set of standards 3 months in a row.
 * A QC Strike is given if a standard is not met.
 * Strikes reset if QC runs with all standards met.
 * 
 * 
 * ### What are the conditions for a QC strike?
 * 
 *   * Vtubers with fewer than 10 clips (not enough clips for a compilation)
 *   * Inactive VTubers (hiatus, gratuated, retired, etc.)
 *   * Vtubers who clip themselves more than their audience does
 * 
 * 
 */
async function qualityControl (channel) {
    if (typeof channel === 'undefined') throw new Error('qualityControl requires a channel, but it was undefined');
    console.log('  [*] QUALITY CONTROL');

    const { socialMediaLinks, displayName } = await getVtuberData(channel, isDev);
    const twitterHandle = getTwitterHandle(vtuberData.socialMediaLinks);

    const profile = await getTwitterProfile(channel);

}


qualityControl('ironmouse');