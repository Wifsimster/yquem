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

## Usage\*

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

#### run([path])

Look for recent files from `path`, try to grab subtitles from filename, returns a Promise when done.

##### path

Type: `string`

The path to the directory you want to scan.
