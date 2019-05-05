# yquem

A JavaScript library which fetches subtitles for tv shows episodes from Beta Series.

This library works weel with [Medoc](https://github.com/Wifsimster/medoc).

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Wifsimster/yquem/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/yquem.svg)](https://badge.fury.io/js/yquem)

**Core Features**

- Detect recent episodes (default 1 day) from root directory, episodes filename must be `{show} - {season}x{epsiode}.{format}`;
- Download first subtitle found on Beta Series for this episode next to the episode file.

**Quick start**

```javascript
npm install yquem
```

```javascript
const Yquem = require("yquem")

const PATH_TO_SCAN = `z:`

// new Yquem(PATH_TO_SCAN, fileAge = 2)
const yquem = new Yquem(PATH_TO_SCAN)

// Return a promise
yquem.run()
```

That's all :)
