# yquem

A JavaScript library which fetches subtitles for tv shows episodes from [Beta Series API](https://www.betaseries.com/api/).

This library works weel with [Medoc](https://github.com/Wifsimster/medoc).

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Wifsimster/yquem/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/yquem.svg)](https://badge.fury.io/js/yquem)
[![Install size](https://packagephobia.now.sh/badge?p=yquem)](https://packagephobia.now.sh/result?p=yquem)

## Features

- Detect recent episodes (default 2 day old) from a specific directory (filename must be `{show} - {season}x{episode}.{format}`);
- Download first subtitle found on Beta Series for this episode next to the episode file.

## Install

```
$ npm install yquem
```

## Usage

```js
const Yquem = require("yquem")

const yquem = new Yquem(`d:`)

yquem
  .run()
  .then(results => {
    console.log(results)
  })
  .catch(err => {
    console.error(err)
  })
```

## Documentation

### Instance methods

#### run()

Look for recent files from the specified directory, try to grab subtitles from filename, returns a Promise when done.

### Static methods

#### getRecentFilesFromDirectory([path], [fileAge])

Return a list of recent files from the specified directory.

- `path` `<string>` Directory to scan.
- `fileAge` `<string> | <number>` Number of days to consider a file to be recent.

#### hasSubtitle([file], { languages: 'en' })

Check if a subtitle file exist next to the episode file specified.

- `file` `<string>` Complete path of a episode file
- `options` `<object>` :
  - `languages` `<string | array>` List of [languages](https://fr.wikipedia.org/wiki/Liste_des_codes_ISO_639-1) to look for, default: `en`

#### getSubtile([file])

Search a subtitle onn Beta Series and download it next to the episode file specified.

- `file` `<string>` Complete path of a episode file

#### download([url])

Download file from a given `url`.

- `url` `<string>` URL as a string.

#### getSubtitles([show])

Get the list of subtitles found on Beta Series for an episode.

- `show` `<object>` :
  - `name` `<string>` Name of the show
  - `season` `<string> | <number>` Season number
  - `episode` `<string> | <number>` Episode number

#### getShowName([filename])

Extract show name from filename.

- `filename` `<string>` Episode filename, format : `Krypton - 1x01`.

#### getShowNumber([filename])

Extract season number and episode number from filename.

- `filename` `<string>` Episode filename, format : `Smallville - 6x08`.

#### getShow([name])

Get the show object from Beta Series API.

- `name` `<string>` Show name.

#### getEpisodeByShow([id], [episode])

Get the episode object from Beta Series API.

- `id` `<string | number>` Show identifier.
- `episode` `<string>` Episode description, format : `S01E01`.

#### writeFile([data], [destinationPath])

Write a new file to `destinationPath`.

- `data` `<buffer>` Date of the new file.
- `destinationPath` `<string>` Complete path of the new file.

#### buildEpisodeName([name], [season], [episode])

Return the formatted episode name, ie : `Final Space - 2x03`.

- `name` `<string>` Name of the show
- `season` `<string> | <number>` Season number
- `episode` `<string> | <number>` Episode number
