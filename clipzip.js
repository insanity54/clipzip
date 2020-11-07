require('dotenv').config()

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { ApiClient } = require('twitch')
const { ClientCredentialsAuthProvider } = require('twitch-auth')
const arguments = yargs(hideBin(process.argv)).argv
const { DateTime } = require('luxon')
const YoutubeDlWrap = require("youtube-dl-wrap");
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')
const Promise = require('bluebird')


if (typeof arguments.channel === 'undefined') throw new Error('must receive --channel argument')

const clientId = process.env.TWITCH_CLIENT_ID
const clientSecret = process.env.TWITCH_CLIENT_SECRET
const dataDir = path.join(__dirname, 'data')
const today = DateTime.local().startOf('day') // script is meant to run on first day of the month, but we want a datestamp from previous month
const endOfLastMonth = today.minus({ months: 1}).endOf('month')
const targetMonth = endOfLastMonth.month.toString()
const targetYear = endOfLastMonth.year.toString()

if (
  typeof clientId === 'undefined' ||
  typeof clientSecret === 'undefined'
) throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be defined in env!')

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret)
const apiClient = new ApiClient({ authProvider });
const youtubeDlWrap = new YoutubeDlWrap();

function getClipData(clip) {
  let { url, id } = clip._data
  let videoPath = path.join(dataDir, targetYear, targetMonth, `${id}.mp4`)
  return { url, id, videoPath }
}

async function downloadVideo(clip) {
  let { id, url, videoPath } = getClipData(clip)
  console.log(`Downloading ${id}`)
  return youtubeDlWrap.execPromise([url, "-f", "best", "-o", videoPath])
}

async function getClips (userId) {
  const request = apiClient.helix.clips.getClipsForBroadcasterPaginated(userId)
  let page
  let result = []
  while ((page = await request.getNext()).length) {
    result.push(...page)
  }
  return result
}


(async function main(arguments) {

  console.log(`Downloading clips from channel:${arguments.channel} for targetYear:${targetYear}, targetMonth:${targetMonth} into the folder ${path.join(dataDir, targetYear, targetMonth)}`)

  await fsp.mkdir(path.join(dataDir, targetYear, targetMonth), { recursive: true })
  let user = await apiClient.helix.users.getUserByName(arguments.channel)
  let clips = await getClips(user._data.id)

  let clipsFromLast30Days = clips.filter((clip) => {
    let clipDate = DateTime.fromISO(clip._data.created_at)
    return endOfLastMonth.hasSame(clipDate, 'month')
  })


  await Promise.mapSeries(clipsFromLast30Days, downloadVideo)

  let videoPaths = clipsFromLast30Days.map((clip) => {
    let { videoPath } = getClipData
    return videoPath
  })



})(arguments)
