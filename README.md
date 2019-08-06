# yquem

A JavaScript library which fetches subtitles for tv shows episodes from [Beta Series API](https://www.betaseries.com/api/).

This library works weel with [Medoc](https://github.com/Wifsimster/medoc).

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Wifsimster/yquem/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/yquem.svg)](https://badge.fury.io/js/yquem)

## Features

- Detect recent episodes (default 1 day old) from a specific directory (filename must be `{show} - {season}x{epsiode}.{format}`);
- Download first subtitle found on Beta Series for this episode next to the episode file.

## Install

```
$ npm install yquem
```

## Usage

```js
const Yquem = require('yquem')

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

### Instance

#### run()

Look for recent files from `path`, try to grab subtitles from filename, returns a Promise when done.

### Static

#### download([url])

Download file from a given `url`.

- `url` `<string>` URL to request as a string.

#### downloadSubtitle([path], [show])

Download the first subtitle file found on Beta Series.

- `path` `<string>` The directory where to download the subtitle.
- `show` `<object>`
  - `name` `<string>` Name of the show
  - `season` `<string> | <number>` Season number
  - `episode` `<string> | <number>` Episode number
