# stargazed [![npm version](https://img.shields.io/npm/v/stargazed)](https://www.npmjs.com/package/stargazed) [![Build Status](https://travis-ci.com/abhijithvijayan/stargazed.svg?branch=master)](https://travis-ci.com/abhijithvijayan/stargazed) [![file structure: destiny](https://img.shields.io/badge/file%20structure-destiny-7a49ff?style=flat)](https://github.com/benawad/destiny)

> Creating your own Awesome List of GitHub Stars!
<h3>🙋‍♂️ Made by <a href="https://twitter.com/_abhijithv">@abhijithvijayan</a></h3>
<p>
  Donate:
  <a href="https://www.paypal.me/iamabhijithvijayan" target='_blank'><i><b>PayPal</b></i></a>,
  <a href="https://www.patreon.com/abhijithvijayan" target='_blank'><i><b>Patreon</b></i></a>
</p>
<p>
  <a href='https://www.buymeacoffee.com/abhijithvijayan' target='_blank'>
    <img height='36' style='border:0px;height:36px;' src='https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/custom_images/orange_img.png' border='0' alt='Buy Me a Coffee' />
  </a>
</p>
<hr />

## Install

Ensure you have [Node.js](https://nodejs.org) 10 or later installed. Then run the following:

```
npx stargazed --help
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

## FAQ

### Generate new token

Goto [Personal access tokens](https://github.com/settings/tokens)

### Why do I need a token

- For unauthenticated requests, the rate limit is 60 requests per
  hour.
  see [Rate Limiting](https://developer.github.com/v3/#rate-limiting)
- The token must be passed together when you want to automatically
  create the repository.

### How can I automate the process after initial run

##### 1. Sign up for GitHub actions beta

```
https://github.com/features/actions
```

#### 2. Use `-w, --workflow` flag to set up GitHub workflow that updates the repo at 00:30 everyday

```
stargazed -u "abhijithvijayan" -r "awesome-stars" -t "GITHUB-TOKEN" -s -w
```

## Contributing

Thanks for being willing to contribute! Kindly check the [contribution guidelines](CONTRIBUTING.md) for more details

## License

MIT © [Abhijith Vijayan](https://abhijithvijayan.in)
