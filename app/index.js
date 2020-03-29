#!/usr/bin/env node

const meow = require('meow');
const stargazed = require('./cli');

const cli = meow(
	`
		Usage
		  $ stargazed [OPTIONS]

		Options
			-u, --username TEXT    GitHub username
			-t, --token TEXT       GitHub token
			-s, --sort             sort by language
			-r, --repo TEXT	       repository name
			-m, --message TEXT     commit message
			-w, --workflow         Setup GitHub Actions for Daily AutoUpdate
			-v, --version          Show the version and exit with code 0

		Examples
			$ stargazed --username abhijithvijayan --token "GITHUB_TOKEN" --sort
			$ stargazed -u "abhijithvijayan" -r "awesome-stars" -t "GITHUB-TOKEN" -s -w
    	$ stargazed -u "abhijithvijayan" -r "REPO_NAME" -t "GITHUB_TOKEN" -m "COMMIT_MESSAGE" -s
	`,
	{
		flags: {
			version: {
				type: 'boolean',
				alias: 'v',
			},
			sort: {
				type: 'boolean',
				alias: 's',
			},
			workflow: {
				type: 'boolean',
				alias: ['w', 'a', 'action'],
			},
			username: {
				type: 'string',
				alias: ['u', 'user'],
			},
			token: {
				type: 'string',
				alias: 't',
			},
			repo: {
				type: 'string',
				alias: ['r', 'repository'],
			},
			message: {
				type: 'string',
				alias: 'm',
			},
		},
	}
);

stargazed(cli.flags);
