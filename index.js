
require('dotenv').config();
const execa = require('execa');

/**
 * This file is meant to be invoked once per day
 * by systemd or cron.
 * 
 * It finds the vtubers who's 
 *   * day of month is today,
 *   * is not blacklisted
 *   * has strikes less-than 3
 * 
 */

async function main () {
    const dom = new Date().getDate();
    const res = await execa('./clipzip.js', ['db', '--read', '--dom', dom])
    const vtuberData = JSON.parse(res.stdout);

    for (let i = 0; i < vtuberData.length; i++) {
        await execa()
    }
    
    console.log(vtuberData);
}   


main();