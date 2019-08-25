#!/usr/bin/env node
'use strict';

const meow = require('meow');
const stargazed = require('.');

const cli = meow(`
		Usage: starred [OPTIONS]

			GitHub stargazed

			Creating your own Awesome List of GitHub Stars!

			example:     starred --username abhijithvijayan --sort > README.md

		Options:
			--username TEXT    GitHub username
			--token TEXT       GitHub token
			--sort             sort by language
			--repository TEXT  repository name
			--message TEXT     commit message
			--version          Show the version and exit.
			--help             Show this message and exit.
	`, {
		flags: {
		}
});

console.log(stargazed(cli.input[0] || 'unicorns'));
