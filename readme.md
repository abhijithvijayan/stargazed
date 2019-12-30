# stargazed [![npm version](https://img.shields.io/npm/v/stargazed)](https://www.npmjs.com/package/stargazed) [![Build Status](https://travis-ci.com/abhijithvijayan/stargazed.svg?branch=master)](https://travis-ci.com/abhijithvijayan/stargazed)

> Creating your own Awesome List of GitHub Stars!

### 🙋‍♂️ Made by [@abhijithvijayan](https://twitter.com/_abhijithv)


## Install

Ensure you have [Node.js](https://nodejs.org) 8 or later installed. Then run the following:

```
$ npm install --global stargazed
```

If you don't want to install the CLI globally, you can use `npx` to run the CLI:

```
$ npx stargazed --help
```

## Usage

```
$ stargazed --help

  Creating your own Awesome List of GitHub Stars!

  Options
    -u, --username TEXT    GitHub username
    -t, --token TEXT       GitHub token
    -s, --sort             sort by language
    -r, --repo TEXT  	   repository name
    -m, --message TEXT     commit message
    -w, --workflow         Setup GitHub Actions for Daily AutoUpdate
    -v, --version          Show the version and exit with code 0

  Examples
    $ stargazed --username abhijithvijayan --token "GITHUB-TOKEN" --sort
    $ stargazed -u "abhijithvijayan" -r "awesome-stars" -t "GITHUB-TOKEN" -s -w
    $ stargazed -u "abhijithvijayan" -r "awesome-stars" -t "GITHUB-TOKEN" -m "COMMIT_MESSAGE" -s
```

## Demo

- [abhijithvijayan/awesome-stars](https://github.com/abhijithvijayan/awesome-stars)

## FAQ

### Generate new token

Goto [Personal access tokens](https://github.com/settings/tokens)

### Why do I need a token?

- For unauthenticated requests, the rate limit is 60 requests per
  hour.
  see [Rate Limiting](https://developer.github.com/v3/#rate-limiting)
- The token must be passed together when you want to automatically
  create the repository.

### How can I automate the process after initial run?

##### 1. Sign up for GitHub actions beta

```
https://github.com/features/actions
```

#### 2. Use `-w, --workflow` flag to set up GitHub workflow that updates the repo at 00:30 everyday.

```
$ stargazed -u "abhijithvijayan" -r "awesome-stars" -t "GITHUB-TOKEN" -s -w
```

## Contributing

Thanks for being willing to contribute! Kindly check the [contribution guidelines](CONTRIBUTING.md) for more details

## License

MIT © [Abhijith Vijayan](https://abhijithvijayan.in)
