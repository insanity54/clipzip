# clipzip

Generates a video composed of top twitch clips from a channel

## Usage

```
$ ./clipzip.js download --twitch-channel ironmouse --start-date 2021-03-01 --end-date 2021-03-31
$ ./clipzip.js combine --directory ./data/ironmouse/2021-03-01---2021-03-31/
```
`$ ./clipzip.js upload` is not yet implemented


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

for more details, see https://github.com/stackgl/headless-gl/issues/65


## Misc

### Generate transition video

$ ./clipzip.js upload // NOT YET IMPLEMENTED

### Youtube Video Description Template

```
Check out Ironmouse--

  * https://www.youtube.com/channel/UChgPVLjqugDQpRLWvC7zzig
  * https://www.twitch.tv/ironmouse​
  * https://twitter.com/ironmouse

#VShojo​ #Vtuber​ #Vstreamer
```