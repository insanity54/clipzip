
const { ApiClient } = require('twitch')
const { ClientCredentialsAuthProvider } = require('twitch-auth');
const { DateTime } = require("luxon");
const path = require('path');
const YoutubeDlWrap = require("youtube-dl-wrap")
const ytdl = new YoutubeDlWrap();
const fsp = require('fs').promises;
const logger = require('./logger');

const fetch = require('node-fetch')
const cheerio = require('cheerio')
const execa = require('execa');

class Download {
  constructor (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET) {
    if (typeof TWITCH_CLIENT_ID === 'undefined') throw new Error('TWITCH_CLIENT_ID is undefined');
    if (typeof TWITCH_CLIENT_SECRET === 'undefined') throw new Error('TWITCH_CLIENT_SECRET is undefined');
    this.authProvider = new ClientCredentialsAuthProvider(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);
    this.apiClient = new ApiClient({ authProvider: this.authProvider });
    this.downloadVideos = this.downloadVideos.bind(this);
  }


  async downloadVideo(clipInfo, downloadPath) {
    if (typeof clipInfo === 'undefined') throw new Error('clipInfo is undefined, but it must be defined');
    if (typeof downloadPath === 'undefined') throw new Error('downloadPath is undefined, but it must be defined');
    // @TODO - WORKAROUND FOR BROKEN YTDL. See https://github.com/ytdl-org/youtube-dl/issues/29136
    const { id, url, thumbnailUrl } = clipInfo;
    
    // logger.info(`clipInfo thumbnailUrl is ${th}`)
    // const html = await fetch(url).then(res => res.text());
    // const $ = cheerio.load(html);
    // const thumbnailUrl = $('meta[property="og:image"]').attr('content');
    // logger.info(`parse complete! thumbnailUrl is ${thumbnailUrl}`)
    // if (thumbnailUrl === 'https://static-cdn.jtvnw.net/ttv-static-metadata/twitch_logo3.jpg') {
    //   const msg = 'twitch scrape was blocked'
    //   logger.error(msg)
    //   throw new Error(msg)
    // }

    const workaroundUrl = thumbnailUrl.replace(/-preview.*/, '.mp4')

    logger.info(`replacing ${url} with ${workaroundUrl}`);

    logger.info(`Downloading ${workaroundUrl} to ${downloadPath}`);
    // return ytdl.execPromise([workaroundUrl, "-f", "best", "-o", downloadPath]); // @TODO rename this to downloadPath when the above issue is fixed in ytdl
    return execa('wget', [
      '-O', downloadPath,
      workaroundUrl,
    ]) 
    // @TODO End of workaround
  }

  // use the twitch API to get a filtered list of clip urls
  async getClips (userId, startDate, endDate) {

    logger.info(`getClisp() channel ${userId} with startDate:${startDate} and endDate:${endDate}`);
    if (typeof userId === 'undefined') throw new Error('userId passed to getClips must be defined, but it was undefined');
    if (typeof startDate === 'undefined' || typeof endDate === 'undefined') throw new Error('{String} startDate and endDate must be supplied to getClips. one of them was undefined.');

    const filter = {
      startDate: DateTime.fromISO(startDate).toISO(),
      endDate: DateTime.fromISO(endDate).toISO()
    };

    const result = await this.apiClient.helix.clips.getClipsForBroadcasterPaginated(userId, filter);

    const res = [];
    for await (const video of result) {
      const clipInfo = {
        broadcasterDisplayName: video.broadcasterDisplayName,
        broadcasterId: video.broadcasterId,
        creationDate: video.creationDate,
        creatorDisplayName: video.creatorDisplayName,
        creatorId: video.creatorId,
        embedUrl: video.embedUrl,
        gameId: video.gameId,
        id: video.id,
        language: video.language,
        thumbnailUrl: video.thumbnailUrl,
        title: video.title,
        url: video.url,
        videoId: video.videoId,
        views: video.views
      };
      res.push(clipInfo);
    }

    if (res.length < 10) throw new Error(`There were not at least 10 clips for Twitch user ${userId} between ${startDate} and ${endDate}`);
    return res;
  }

  getOutputPath (broadcasterName, startDate, endDate) {
    if (typeof broadcasterName === 'undefined') throw new Error('broadcasterName must be defined!')
    if (typeof startDate === 'undefined') throw new Error('startDate must be defined!')
    if (typeof endDate === 'undefined') throw new Error('endDate must be defined!')
    logger.info(`broadcasterName:${broadcasterName}, startDate:${startDate}, endDate:${endDate}`)
    return path.join(__dirname, '..', 'data', broadcasterName, `${startDate}_${endDate}`);
  }

  async prepareDownloadPath (twitchChannel, startDate, endDate, clipInfo) {
    const { broadcasterName, id } = clipInfo;
    const fileName = `${id}.mp4`;
    const folderPath = this.getOutputPath(twitchChannel, startDate, endDate);
    const downloadPath = path.join(folderPath, fileName);
    logger.info(`Preparing download path for ${twitchChannel}, ${id}, ${fileName}, ${folderPath}, ${downloadPath} at ${folderPath}`)
    await fsp.mkdir(folderPath, { recursive: true });
    return downloadPath;
  }

  getManifestPath (broadcasterDisplayName, startDate, endDate) {
    const outputPath = this.getOutputPath(broadcasterDisplayName, startDate, endDate);
    return path.join(outputPath, 'clipInfo.json');
  }

  async writeManifestFile (clipInfo, manifestFilePath) {
    return fsp.writeFile(manifestFilePath, JSON.stringify(clipInfo, 0, 2), { data: 'utf-8' });
  }

  async downloadVideos (args) {
    const { endDate, startDate, twitchChannel } = args;
    const user = await this.apiClient.helix.users.getUserByName(twitchChannel);
    const userData = user._data;
    const { id, display_name: displayName } = userData;
    const clips = await this.getClips(id, startDate, endDate);
    const tenMostWatchedClips = clips.sort((c) => c.views).slice(0, 10);
    if (tenMostWatchedClips.length < 1) {
      logger.error(`clips:${clips}`);
      throw new Error('there was a problem getting the ten most watched clips.')
    }
    // @TODO !!!! there is a case where tenMostWatchedClips is an empty array!!!!1
    const clipFilePaths = [];
    for await (const clipInfo of tenMostWatchedClips) {
      const downloadPath = await this.prepareDownloadPath(twitchChannel, startDate, endDate, clipInfo);
      await this.downloadVideo(clipInfo, downloadPath);
    }
    logger.info(`Downloads complete.`);

    const manifestFilePath = this.getManifestPath(twitchChannel, startDate, endDate);
    logger.info(`writing manifest file to ${manifestFilePath}`);
    await this.writeManifestFile(tenMostWatchedClips, manifestFilePath);
    logger.info(`manifest written to ${manifestFilePath}`);
    return manifestFilePath;
  }
}





module.exports = Download;