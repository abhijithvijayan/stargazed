#!/usr/bin/env node

const meow = require('meow');
const stargazed = require('./');

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
			-v, --version          Show the version and exit with code 0

		Examples
			$ stargazed --username abhijithvijayan --token "GITHUB_TOKEN" --sort
    	$ stargazed -u "abhijithvijayan" -r "REPO_NAME" -t "GITHUB_TOKEN" -m "COMMIT_MESSAGE" -s
	`,
	{
		flags: {
			boolean: ['sort', 'version'],
			string: ['username', 'token', 'repo', 'message'],
			alias: {
				u: 'username',
				t: 'token',
				s: 'sort',
				r: 'repo',
				m: 'message',
				v: 'version',
			},
		},
	}
);

stargazed(cli.flags);
