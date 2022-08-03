# clipzip

Generates a video composed of top twitch clips from a channel

## Dependencies

  * youtube-dl
  * xterm
  * ffmpeg
  * ffprobe
  * build-essential
  * libxi-dev
  * libglu1-mesa-dev
  * libglew-dev
  * pkg-config
  * libx11-dev
  * sqlite3
  * xserver-xorg-dev (maybe?)
  * libxext-dev (maybe?)

## Usage

### CLI

```
$ ./clipzip.js download --twitch-channel ironmouse --start-date 2021-03-01 --end-date 2021-03-31
$ ./clipzip.js combine --directory /home/chris/Documents/clipzip/data/ironmouse/2021-03-01_2021-03-31/
$ ./clipzip.js upload --videoFile /home/chris/Documents/clipzip/output/8412893481.mp4 --channel ironmouse --date 2021-03-01
```
(Absolute paths are required for the combine command)

### Daily run

    npm run start


## Troubleshooting

You may encounter the following error

```
node: symbol lookup error: /home/chris/Documents/clipzip/node_modules/gl/build/Release/webgl.node: undefined symbol: _Z15XextFindDisplayP15_XExtensionInfoP9_XDisplay
```

The trick is to get the `gl` module to compile on your machine, rather than using something that's prebuilt. Try the following.

```
cd ./node_modules/gl
node-gyp rebuild --verbose
```

or

`npm rebuild --build-from-source gl`


for more details, see https://github.com/stackgl/headless-gl/issues/65

## Upload Schedule

Compilation schedule is defined via sqlite. "dom" represents the day of month when the channel will be clipped

```
$ ./clipzip.js db --create --channel ironmouse
[
  {
    "id": 408,
    "channel": "ironmouse",
    "dom": 19,
    "strikes": 0,
    "blacklisted": 0,
    "note": "",
    "createdAt": "Fri Jul 22 2022 19:02:01 GMT-0700 (Pacific Daylight Time)",
    "updatedAt": "Fri Jul 22 2022 19:02:01 GMT-0700 (Pacific Daylight Time)"
  }
]
```
