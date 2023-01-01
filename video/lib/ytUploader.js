
    // Unfortunately... Youtube Data API is locked down to the point where private projects are not able to upload public videos
    // See https://stackoverflow.com/questions/64079139/using-youtube-data-api-makes-my-videos-private-on-upload
    // so.. the workaround is to continue to use my UI automation tool (closed source) to upload videos
    // async ytUploader (opts) {

    //     // curl --request POST \
    //     //   'https://youtube.googleapis.com/youtube/v3/videos?key=[YOUR_API_KEY]' \
    //     //   --header 'Authorization: Bearer [YOUR_ACCESS_TOKEN]' \
    //     //   --header 'Accept: application/json' \
    //     //   --header 'Content-Type: application/json' \
    //     //   --data '{}' \
    //     //   --compressed




    //     const statement = db.prepare('SELECT refresh_token FROM oauth ORDER BY expiry_date LIMIT 1;')
    //     const dbr = statement.get()
    //     console.log('  [*] BELOW HERE WE ARE SEEING THE REFRESH TOKEN WHICH WAS IN OUR DB')
    //     console.log(dbr.refresh_token)

    //     const youtube = google.youtube('v3');

    //     const oauth2Client = new google.auth.OAuth2(
    //         GOOGLE_CLIENT_ID,
    //         GOOGLE_CLIENT_SECRET
    //     );

    //     oauth2Client.setCredentials({
    //       refresh_token: dbr.refresh_token
    //     });

    //     google.options({ auth: oauth2Client });

    //     // Do the magic
    //     const res = await youtube.videos.insert({
    //         // Should auto-levels be applied to the upload.
    //         autoLevels: false,
    //         // Notify the channel subscribers about the new video. As default, the notification is enabled.
    //         notifySubscribers: true,

    //         // The *part* parameter serves two purposes in this operation. 
    //         // It identifies the properties that the write operation will set as well as 
    //         // the properties that the API response will include. 
    //         // Note that not all parts contain properties that can be set when inserting or updating a video. 
    //         // For example, the statistics object encapsulates statistics that YouTube calculates for a video and does not contain values that you can set or modify. 
    //         // If the parameter value specifies a part that does not contain mutable values, that part will still be included in the API response.
    //         part: ['snippet'],

    //         // Should stabilize be applied to the upload.
    //         stabilize: false,

    //         // Request body metadata
    //         requestBody: {
    //         // request body parameters
    //         // {
    //         //   "ageGating": {},
    //         //   "contentDetails": {},
    //         //   "etag": "my_etag",
    //         //   "fileDetails": {},
    //         //   "id": "my_id",
    //         //   "kind": "my_kind",
    //         //   "liveStreamingDetails": {},
    //         //   "localizations": {},
    //         //   "monetizationDetails": {},
    //         //   "player": {},
    //         //   "processingDetails": {},
    //         //   "projectDetails": {},
    //         //   "recordingDetails": {},
    //           "snippet": opts.videoMetadata.snippet,
    //         //   "statistics": {},
    //         //   "status": {},
    //         //   "suggestions": {},
    //         //   "topicDetails": {}
    //         // }
    //         },
    //         media: {
    //             mimeType: 'video/mp4',
    //             body: fs.createReadStream(opts.videoFile),
    //         },
    //     });

    //     // console.log(res.data);


    //     // const req = got.post()

    //     // options = {
    //     //     "title" : "Example title", # The video title
    //     //     "description" : "Example description", # The video description
    //     //     "tags" : ["tag1", "tag2", "tag3"],
    //     //     "categoryId" : "22",
    //     //     "privacyStatus" : "private", # Video privacy. Can either be "public", "private", or "unlisted"
    //     //     "kids" : False, # Specifies if the Video if for kids or not. Defaults to False.
    //     //     "thumbnailLink" : "https://cdn.havecamerawilltravel.com/photographer/files/2020/01/youtube-logo-new-1068x510.jpg" # Optional. Specifies video thumbnail.
    //     // }


    //     // const res = await got.post('https://youtube.googleapis.com/youtube/v3/videos', {
    //     //     body: JSON.stringify(opts.videoMetadata),
    //     //     media_body: opts.videoFile,
    //     //     headers: {
    //     //         'Authorization': `Bearer ${accessToken}`,
    //     //         'Content-Type': 'application/json',
    //     //         'Accept': 'application/json'
    //     //     }
    //     // })



    //     console.log(res)
    // }