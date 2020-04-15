#!/usr/bin/env node

/**
 *  stargazed
 *
 *  @author   abhijithvijayan <abhijithvijayan.in>
 *  @license  MIT License
 */

const cli = require('./cli');
const Spinner = require('./utils/spinner');
const { flashError } = require('./utils/message');
const { options, validate } = require('./utils/validate');
const { handleRepositoryActions, setUpWorkflow } = require('./utils/repo');
const {
	writeReadmeContent,
	buildReadmeContent,
	generateStargazedList,
	fetchUserStargazedRepos,
} = require('./stargazed');

(async () => {
	const err = validate(cli.flags);

	if (err) {
		flashError(err);
		return;
	}

	const { username, token = '', sort, repo, workflow } = options;

	if (!username) {
		flashError('Error! username is a required field.');
		return;
	}

	let githubAction = false;
	let cronJob = false;

	if (repo) {
		if (!token) {
			flashError('Error: creating repository needs token. Set --token');
			return;
		}

		if (workflow) {
			cronJob = true;
		}

		githubAction = true;
	}

	// Trim whitespaces
	if (typeof String.prototype.trim === 'undefined') {
		String.prototype.trim = function () {
			return String(this).replace(/^\s+|\s+$/g, '');
		};
	}

	const spinner = new Spinner('Fetching stargazed repositories...');
	spinner.start();

	// get data from github api
	const { list = [] } = await fetchUserStargazedRepos({
		spinner,
		options,
	});

	spinner.succeed(`Fetched ${Object.keys(list).length} stargazed items`);
	spinner.stop();

	let unordered = {};
	const ordered = {};

	// Generate list
	if (Array.isArray(list)) {
		unordered = await generateStargazedList(list);
	}

	// Sort to Languages alphabetically
	if (sort) {
		Object.keys(unordered)
			.sort()
			.forEach(function (key) {
				ordered[key] = unordered[key];
			});
	}

	const languages = Object.keys(sort ? ordered : unordered);
	const readmeContent = await buildReadmeContent({
		// array of languages
		languages,
		// Total items count
		count: Object.keys(list).length,
		// Stargazed Repos
		stargazed: sort ? ordered : unordered,
		username,
		date: `${new Date().getDate()}--${new Date().getMonth() + 1}--${new Date().getFullYear()}`,
	});

	// Write Readme Content locally
	await writeReadmeContent(readmeContent);

	//  Handles all the repo actions
	if (githubAction) {
		await handleRepositoryActions({
			readmeContent: unescape(readmeContent),
			options,
		});
	}

	// Setup GitHub Actions for Daily AutoUpdate
	if (cronJob) {
		await setUpWorkflow(options);
	}
})();
