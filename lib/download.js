const { DateTime } = require("luxon");
const path = require('path');
const YoutubeDlWrap = require("youtube-dl-wrap")
const ytdl = new YoutubeDlWrap();
const fsp = require('fs').promises;

class Download {
  constructor (apiClient, dataDir) {
    if (typeof apiClient === 'undefined') throw new Error('apiClient passed to Download must be defined');
    this.apiClient = apiClient;
    this.downloadVideos = this.downloadVideos.bind(this)
  }


  async downloadVideo(clipInfo, downloadPath) {
    if (typeof clipInfo === 'undefined') throw new Error('clipInfo is undefined, but it must be defined');
    if (typeof downloadPath === 'undefined') throw new Error('downloadPath is undefined, but it must be defined');
    const { id, url } = clipInfo;
    console.log(`Downloading ${url} to ${downloadPath}`);
    return ytdl.execPromise([url, "-f", "best", "-o", downloadPath]);
  }


  async getClips (userId, startDate, endDate) {
    console.log('getClisp() channel ' + userId)
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
        broadcasterId: video.broadcasterDisplayName,
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
    return res;
  }

  getOutputPath (broadcasterDisplayName, startDate, endDate) {
    return path.join(__dirname, '..', 'data', broadcasterDisplayName, `${startDate}_${endDate}`);
  }

  async prepareDownloadPath (startDate, endDate, clipInfo) {
    const { broadcasterDisplayName, id } = clipInfo;
    const fileName = `${id}.mp4`;
    const folderPath = this.getOutputPath(broadcasterDisplayName, startDate, endDate);
    const downloadPath = path.join(folderPath, fileName);
    await fsp.mkdir(folderPath, { recursive: true })
    return downloadPath;
  }

  getManifestPath (broadcasterDisplayName, startDate, endDate) {
    const outputPath = this.getOutputPath(broadcasterDisplayName, startDate, endDate);
    return path.join(outputPath, 'clipInfo.json')
  }

  async writeManifestFile (clipInfo, manifestFilePath) {
    return fsp.writeFile(manifestFilePath, JSON.stringify(clipInfo, 0, 2), { data: 'utf-8' });
  }

  async downloadVideos (args) {
    const { endDate, startDate, twitchChannel } = args;
    const user = await this.apiClient.helix.users.getUserByName(twitchChannel);
    const id = user._data.id;
    const clips = await this.getClips(id, startDate, endDate);
    const tenMostWatchedClips = clips.sort((c) => c.views).slice(0, 10);
    const clipFilePaths = [];
    for await (const clipInfo of tenMostWatchedClips) {
      const downloadPath = await this.prepareDownloadPath(startDate, endDate, clipInfo);
      await this.downloadVideo(clipInfo, downloadPath);
    }
    console.log(`Downloads complete.`);

    const manifestFilePath = this.getManifestPath(twitchChannel, startDate, endDate);
    await this.writeManifestFile(tenMostWatchedClips, manifestFilePath);
    console.log(`manifest written to ${manifestFilePath}`);
  }



}





module.exports = Download;