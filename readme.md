# stargazed

[![Build Status](https://travis-ci.com/abhijithvijayan/stargazed.svg?branch=master)](https://travis-ci.com/abhijithvijayan/stargazed)
[![npm version](https://img.shields.io/npm/v/stargazed)](https://www.npmjs.com/package/stargazed)

> Creating your own Awesome List of GitHub Stars!

## Install

Ensure you have [Node.js](https://nodejs.org) 8 or later installed. Then run the following:

```
$ npm install --global stargazed
```

## Usage

```
$ stargazed --help

  Creating your own Awesome List of GitHub Stars!

  Options
    -u, --username TEXT    GitHub username
    -t, --token TEXT       GitHub token
    -s, --sort             sort by language
    -r, --repo TEXT  			 repository name
    -m, --message TEXT     commit message
    -v, --version          Show the version and exit with code 0

  Examples
    $ stargazed --username abhijithvijayan --token "GITHUB-TOKEN" --sort
```

## Demo

- [awesome-stars](https://github.com/abhijithvijayan/awesome-stars)

## FAQ

### Generate new token

Goto [Personal access tokens](https://github.com/settings/tokens)

### Why do I need a token?

- For unauthenticated requests, the rate limit is 60 requests per
  hour.
  see [Rate Limiting](https://developer.github.com/v3/#rate-limiting)
- The token must be passed together when you want to automatically
  create the repository.

## License

MIT © [Abhijith Vijayan](https://abhijithvijayan.in)
