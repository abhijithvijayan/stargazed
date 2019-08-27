#!/usr/bin/env node

const meow = require('meow');
const stargazed = require('./');

const cli = meow(
	`
		Usage: stargazed [OPTIONS]

			GitHub stargazed

			Creating your own Awesome List of GitHub Stars!

			example:  stargazed --username abhijithvijayan --sort > README.md

		Options:
			-u, --username TEXT    GitHub username
			-t, --token TEXT       GitHub token
			-s, --sort             sort by language
			-r, --repo TEXT  			 repository name
			-m, --message TEXT     commit message
			-v, --version          Show the version and exit.
			-h, --help             Show this message and exit.
	`,
	{
		flags: {
			boolean: ['sort', 'version', 'help'],
			string: ['username', 'token', 'repo', 'message'],
			alias: {
				u: 'username',
				t: 'token',
				s: 'sort',
				r: 'repo',
				m: 'message',
				v: 'version',
				h: 'help',
			},
		},
	}
);

stargazed(cli.flags);
