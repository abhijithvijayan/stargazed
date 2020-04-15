#!/usr/bin/env node

const cli = require('./cli');
const Spinner = require('./utils/spinner');
const { flashError } = require('./utils/message');
const { options, validate } = require('./utils/validate');
const { handleRepositoryActions, setUpWorkflow } = require('./utils/repo');
const { fetchUserStargazedRepos, parseStargazedList, buildReadmeContent, writeReadmeContent } = require('./stargazed');

(async () => {
	const err = validate(cli.flags);

	if (err) {
		flashError(err);
		return;
	}

	const { username, token = '', sort, repo, workflow } = options;

	let gitStatus = false;
	let cronJob = false;

	if (!username) {
		flashError('Error! username is a required field.');
		return;
	}

	if (repo) {
		if (!token) {
			flashError('Error: creating repository needs token. Set --token');
			return;
		}

		if (workflow) {
			cronJob = true;
		}

		gitStatus = true;
	}

	/**
	 *  Trim whitespaces
	 */
	if (typeof String.prototype.trim === 'undefined') {
		String.prototype.trim = function () {
			return String(this).replace(/^\s+|\s+$/g, '');
		};
	}

	const unordered = {};
	const ordered = {};

	const spinner = new Spinner('Fetching stargazed repositories...');
	spinner.start();

	// API Calling function
	const { list = [] } = await fetchUserStargazedRepos({ spinner });

	spinner.succeed(`Fetched ${Object.keys(list).length} stargazed items`);
	spinner.stop();

	/**
	 *  Parse and save object
	 */
	if (Array.isArray(list)) {
		await parseStargazedList({ list, unordered });
	}

	/**
	 *  Sort to Languages alphabetically
	 */
	if (sort) {
		Object.keys(unordered)
			.sort()
			.forEach(function (key) {
				ordered[key] = unordered[key];
			});
	}

	/**
	 *  Generate Language Index
	 */
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

	/**
	 *  Write Readme Content locally
	 */
	await writeReadmeContent(readmeContent);

	/**
	 *  Handles all the repo actions
	 */
	if (gitStatus) {
		await handleRepositoryActions({ readmeContent: unescape(readmeContent) });
	}

	/**
	 *  Setup GitHub Actions for Daily AutoUpdate
	 */
	if (cronJob) {
		await setUpWorkflow();
	}
})();
