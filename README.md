# limit-dirs

[![NPM](https://nodei.co/npm/limit-dirs.png)](https://nodei.co/npm/limit-dirs/)

[![Build status](https://travis-ci.org/martinlevesque/limit-dirs.svg?branch=master)](https://travis-ci.org/martinlevesque/limit-dirs)

Did you ever want to limit certain directories sizes dynamically? limit-dirs
allows you to do this in a convenient manner.

## LimitDirs Class Usage

### Install

```
npm install limit-dirs --save
```

### With fixed folders

First we can instantiate a LimitDirs:

```
const LimitDirs = require("limit-dirs");

const dirLimiter = new LimitDirs(
  {
    "forceDirs": [{
      "dir": "./test/repos-test/basic/",
      "limitMB": 5 / 1000
    }],
    "autoDiscoverNewSubDirs": false,
    //"intervalAutoScan": 3,
    "defaultLimitMB": 5 / 1000,
    "verbose": false
  });
```

and then launch it:

```
dirLimiter.launch();
```

## Command Line Interface

```
npm install -g limit-dirs
```

...



## License

ISC
