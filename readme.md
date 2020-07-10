<h1 align="center">stargazed</h1>
<p align="center">Creating your own Awesome List of GitHub Stars!</p>
<p align="center">https://github.com/abhijithvijayan/awesome-stars</p>
<div align="center">
  <a href="https://www.npmjs.com/package/stargazed">
    <img src="https://img.shields.io/npm/v/stargazed" alt="NPM" />
  </a>
  <a href="https://travis-ci.com/abhijithvijayan/stargazed">
    <img src="https://travis-ci.com/abhijithvijayan/stargazed.svg?branch=main" alt="Travis Build" />
  </a>
  </a>
  <a href="https://david-dm.org/abhijithvijayan/stargazed">
    <img src="https://img.shields.io/david/abhijithvijayan/stargazed.svg?colorB=orange" alt="DEPENDENCIES" />
  </a>
  <a href="https://github.com/abhijithvijayan/stargazed/blob/main/license">
    <img src="https://img.shields.io/github/license/abhijithvijayan/stargazed.svg" alt="LICENSE" />
  </a>
  <a href="https://twitter.com/intent/tweet?text=Check%20out%20stargazed%21%20by%20%40_abhijithv%0A%0ACreating%20your%20own%20Awesome%20List%20of%20GitHub%20Stars%21%0Ahttps%3A%2F%2Fgithub.com%2Fabhijithvijayan%2Fstargazed%0A%0A%23github%20%23stars%20%23list%20%23markdown%20%23node%20%23cli">
     <img src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social" alt="TWEET" />
  </a>
</div>
<h3 align="center">🙋‍♂️ Made by <a href="https://twitter.com/_abhijithv">@abhijithvijayan</a></h3>
<p align="center">
  Donate:
  <a href="https://www.paypal.me/iamabhijithvijayan" target='_blank'><i><b>PayPal</b></i></a>,
  <a href="https://www.patreon.com/abhijithvijayan" target='_blank'><i><b>Patreon</b></i></a>
</p>
<p align="center">
  <a href='https://www.buymeacoffee.com/abhijithvijayan' target='_blank'>
    <img height='36' style='border:0px;height:36px;' src='https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/custom_images/orange_img.png' border='0' alt='Buy Me a Coffee' />
  </a>
</p>
<hr />

❤️ it? ⭐️ it on [GitHub](https://github.com/abhijithvijayan/stargazed/stargazers) or [Tweet](https://twitter.com/intent/tweet?text=Check%20out%20stargazed%21%20by%20%40_abhijithv%0A%0ACreating%20your%20own%20Awesome%20List%20of%20GitHub%20Stars%21%0Ahttps%3A%2F%2Fgithub.com%2Fabhijithvijayan%2Fstargazed%0A%0A%23github%20%23stars%20%23list%20%23markdown%20%23node%20%23cli) about it.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [FAQs](#faqs)
- [Issues](#issues)
  - [🐛 Bugs](#-bugs)
- [LICENSE](#license)

## Installation

Ensure you have [Node.js](https://nodejs.org) 10 or later installed. Then run the following:

```
npx stargazed [options]
```

## Usage

```
$ stargazed --help

  Creating your own Awesome List of GitHub Stars!

  Options
    -u, --username TEXT    GitHub username
    -t, --token TEXT       GitHub token
    -s, --sort             sort by language
    -r, --repository TEXT  repository name
    -m, --message TEXT     commit message
    -w, --workflow         Setup GitHub Actions for Daily AutoUpdate
    -v, --version          Show the version and exit with code 0

  Examples
    $ stargazed --username abhijithvijayan --token "GITHUB-TOKEN" --repository "awesome-stars"  --sort --workflow
    $ stargazed -u "abhijithvijayan" -r "awesome-stars" -t "GITHUB-TOKEN" -m "COMMIT_MESSAGE" -s
```

## Demo

- [abhijithvijayan/awesome-stars](https://github.com/abhijithvijayan/awesome-stars)

## FAQs

### Generate new token

Goto [Personal access tokens](https://github.com/settings/tokens)

### Why do I need a token

- For unauthenticated requests, the rate limit is 60 requests per
  hour.
  see [Rate Limiting](https://developer.github.com/v3/#rate-limiting)
- The token must be passed together when you want to automatically
  create the repository.

### How can I automate the process after initial run

##### Use `-w, --workflow` flag to set up GitHub workflow that updates the repo at 00:30 everyday

```
stargazed -u "abhijithvijayan" -r "awesome-stars" -t "GITHUB-TOKEN" -s -w
```

## Issues

_Looking to contribute? Look for the [Good First Issue](https://github.com/abhijithvijayan/stargazed/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22good+first+issue%22)
label._

[**See contribution guidelines**](CONTRIBUTING.md)

### 🐛 Bugs

Please file an issue [here](https://github.com/abhijithvijayan/stargazed/issues/new) for bugs, missing documentation, or unexpected behavior.

[**See Bugs**](https://github.com/abhijithvijayan/stargazed/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22type%3A+bug%22)

### Linting Config

- Shared Eslint & Prettier Configuration - [`@abhijithvijayan/eslint-config`](https://www.npmjs.com/package/@abhijithvijayan/eslint-config)

## License

MIT © [Abhijith Vijayan](https://abhijithvijayan.in)
