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
  * libxi-dev
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

### Daemon

    npm run start

#### Configuration

See ./data/jobs.json


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

Schedule is defined via crontab as follows

```

0 11 1 * * /home/chris/Documents/clipzip/cronhelper.sh projektmelody
0 17 1 * * /home/chris/Documents/clipzip/cronhelper.sh maia
0 11 2 * * /home/chris/Documents/clipzip/cronhelper.sh miyunebun
0 17 2 * * /home/chris/Documents/clipzip/cronhelper.sh pokeypokums
0 11 3 * * /home/chris/Documents/clipzip/cronhelper.sh zentreya
0 17 3 * * /home/chris/Documents/clipzip/cronhelper.sh hibikikanon
0 11 4 * * /home/chris/Documents/clipzip/cronhelper.sh kuzuryuio
0 17 4 * * /home/chris/Documents/clipzip/cronhelper.sh sushidog_art
0 11 5 * * /home/chris/Documents/clipzip/cronhelper.sh ohpaipansuu
0 11 6 * * /home/chris/Documents/clipzip/cronhelper.sh girl_dm_
0 11 7 * * /home/chris/Documents/clipzip/cronhelper.sh silvervale
0 17 7 * * /home/chris/Documents/clipzip/cronhelper.sh xiondenoir
0 11 8 * * /home/chris/Documents/clipzip/cronhelper.sh nyanners
0 17 8 * * /home/chris/Documents/clipzip/cronhelper.sh annytf
0 11 9 * * /home/chris/Documents/clipzip/cronhelper.sh snuffy
0 11 10 * * /home/chris/Documents/clipzip/cronhelper.sh miyu
0 17 10 * * /home/chris/Documents/clipzip/cronhelper.sh kairuichan
0 11 11 * * /home/chris/Documents/clipzip/cronhelper.sh bunny_gif
0 11 12 * * /home/chris/Documents/clipzip/cronhelper.sh ironmouse
0 11 13 * * /home/chris/Documents/clipzip/cronhelper.sh apricot
0 11 14 * * /home/chris/Documents/clipzip/cronhelper.sh natsumi_moe
0 11 15 * * /home/chris/Documents/clipzip/cronhelper.sh lumituber
0 11 16 * * /home/chris/Documents/clipzip/cronhelper.sh hikarustation
0 11 17 * * /home/chris/Documents/clipzip/cronhelper.sh yuikaichan
0 11 18 * * /home/chris/Documents/clipzip/cronhelper.sh harukakaribu
0 11 19 * * /home/chris/Documents/clipzip/cronhelper.sh momotexx
0 11 20 * * /home/chris/Documents/clipzip/cronhelper.sh rummybear420
0 11 21 * * /home/chris/Documents/clipzip/cronhelper.sh xpinky_purin
0 11 22 * * /home/chris/Documents/clipzip/cronhelper.sh hajime
0 11 23 * * /home/chris/Documents/clipzip/cronhelper.sh coqui_monster
0 11 24 * * /home/chris/Documents/clipzip/cronhelper.sh rummybear420
