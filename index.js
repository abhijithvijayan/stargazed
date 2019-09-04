const ora = require('ora');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const ghGot = require('gh-got');
const chalk = require('chalk');
const { promisify } = require('util');
const unescape = require('lodash.unescape');
const isObject = require('validate.io-object');
const isString = require('validate.io-string-primitive');
const isBoolean = require('validate.io-boolean-primitive');

const pkg = require('./package.json');

const options = {};

const validate = _options => {
	if (!isObject(_options)) {
		return new TypeError(`invalid input argument. Options argument must be an object. Value: \`${_options}\`.`);
	}
	if (
		Object.prototype.hasOwnProperty.call(_options, 'username') ||
		Object.prototype.hasOwnProperty.call(_options, 'u')
	) {
		options.username = _options.username || _options.u;
		if (!isString(options.username)) {
			return new TypeError(`invalid option. Username must be a string primitive.`);
		}
	}
	if (
		Object.prototype.hasOwnProperty.call(_options, 'token') ||
		Object.prototype.hasOwnProperty.call(_options, 't')
	) {
		options.token = _options.token || _options.t;
		if (!isString(options.token)) {
			return new TypeError(`invalid option. Token must be a string primitive.`);
		}
	}
	if (Object.prototype.hasOwnProperty.call(_options, 'repo') || Object.prototype.hasOwnProperty.call(_options, 'r')) {
		options.repo = _options.repo || _options.r;
		if (!isString(options.repo)) {
			return new TypeError(`invalid option. Repo name must be a string primitive.`);
		}
	}
	if (
		Object.prototype.hasOwnProperty.call(_options, 'message') ||
		Object.prototype.hasOwnProperty.call(_options, 'm')
	) {
		options.message = _options.message || _options.m;
		if (!isString(options.message)) {
			return new TypeError(`invalid option. Commit message must be a string primitive.`);
		}
	}
	if (Object.prototype.hasOwnProperty.call(_options, 'sort') || Object.prototype.hasOwnProperty.call(_options, 's')) {
		options.sort = _options.sort || _options.s;
		if (!isBoolean(options.sort)) {
			return new TypeError(`invalid option. Sort option must be a boolean primitive.`);
		}
	}
	if (
		Object.prototype.hasOwnProperty.call(_options, 'version') ||
		Object.prototype.hasOwnProperty.call(_options, 'v')
	) {
		options.version = _options.version || _options.v;
		if (!isBoolean(options.version)) {
			return new TypeError(`invalid option. Version option must be a boolean primitive.`);
		}
	}
	return null;
};

/**
 *  Display Validation Errors
 */
const flashError = message => {
	console.error(chalk.bold.red(`✖ ${message}`));
	process.exit(1);
};

/**
 *  Escape symbol table
 */
const htmlEscapeTable = {
	'>': '&gt;',
	'<': '&lt;',
};

/**
 *  Replace special characters with escape code
 */
String.prototype.htmlEscape = function() {
	let escStr = this;
	Object.entries(htmlEscapeTable).map(([key, value]) => {
		return (escStr = escStr.replace(new RegExp(key, 'g'), value));
	});
	return escStr;
};

/**
 *  Read the template from markdown file
 */
const getReadmeTemplate = async () => {
	const spinner = ora('Loading README template').start();

	try {
		const template = await promisify(fs.readFile)(path.resolve(__dirname, './template.md'), 'utf8');
		spinner.succeed('README template loaded');
		return template;
	} catch (err) {
		spinner.fail('README template loading failed!');
		flashError(err);
	}
};

/**
 *  Render out readme content
 */
const buildReadmeContent = async context => {
	const template = await getReadmeTemplate();
	return ejs.render(template, {
		...context,
	});
};

/**
 *  Write content to README.md
 */
const writeReadmeContent = async readmeContent => {
	const spinner = ora('Creating README locally').start();

	try {
		await promisify(fs.writeFile)('README.md', unescape(readmeContent));
		spinner.succeed('README created locally');
	} catch (err) {
		spinner.fail('Failed to create README');
		flashError(err);
	}
	spinner.stop();
};

module.exports = async _options => {
	const err = validate(_options);

	if (err) {
		flashError(err);
		return;
	}

	const { username, token = '', sort, repo, message, version } = options;

	let gitStatus = false;

	if (version) {
		console.log(chalk.bold.green(pkg.version));
		return;
	}

	if (!username) {
		flashError('Error! username is a required field.');
		return;
	}

	if (repo) {
		if (!token) {
			flashError('Error: creating repository needs token. Set --token');
			return;
		}
		gitStatus = true;
	}

	/**
	 *  Trim whitespaces
	 */
	if (typeof String.prototype.trim === 'undefined') {
		String.prototype.trim = function() {
			return String(this).replace(/^\s+|\s+$/g, '');
		};
	}

	let page = 1;
	let list = [];
	const unordered = {};
	const ordered = {};

	const spinner = ora('Fetching stargazed repositories...').start();

	const loop = async () => {
		let response;
		const url = `users/${username}/starred?&per_page=100&page=${page}`;

		try {
			response = await ghGot(url, { token });
		} catch (err) {
			spinner.fail('Error occured while fetching data!');
			flashError(err);
			return;
		}

		const { body, headers } = response;

		// Concatenate to existing data
		list = list.concat(body);

		// GitHub returns `last` for the last page
		if (headers.link && headers.link.includes('next')) {
			page += 1;
			return loop();
		}

		spinner.succeed(`Fetched ${Object.keys(list).length} stargazed items`);
		spinner.stop();

		return { list };
	};

	// API Calling function
	({ list } = await loop());

	/**
	 *  Parse and save object
	 */
	if (Array.isArray(list)) {
		list.map(item => {
			let { name, description, html_url, language } = item;
			language = language || 'Others';
			description = description ? description.htmlEscape().replace('\n', '') : '';
			if (!(language in unordered)) {
				unordered[language] = [];
			}
			unordered[language].push([name, html_url, description.trim()]);
			return null;
		});
	}

	/**
	 *  Sort to Languages alphabetically
	 */
	if (sort) {
		Object.keys(unordered)
			.sort()
			.forEach(function(key) {
				ordered[key] = unordered[key];
			});
	}

	/**
	 *  Generate Language Index
	 */
	const languages = Object.keys(sort ? ordered : unordered);
	const readmeContent = await buildReadmeContent({ languages, username, stargazed: sort ? ordered : unordered });

	/**
	 *  Write Readme Content locally
	 */
	await writeReadmeContent(readmeContent);

	/**
	 *  Handle Repo actions
	 */
	if (gitStatus) {
		const repoSpinner = ora(`Checking if repository '${repo}' exists...`).start();

		let repoExists = false;
		let isRepoEmpty = false;
		let sha = null;
		const contentBuffer = await Buffer.from(unescape(readmeContent), 'utf8').toString('base64');

		/**
		 *  Get sha of README.md if it exist
		 */
		try {
			({
				body: { sha },
			} = await ghGot(`/repos/${username}/${repo}/contents/README.md`, { token }));

			// Set flag to avoid creating new repo
			repoExists = true;

			repoSpinner.info('Repository found!');
			repoSpinner.stop();
		} catch (err) {
			if (err.body) {
				/**
				 *  ToDo: Creation request Issue when GitHub returns `Not Found` after manually emptying repo
				 */
				if (err.body.message === 'This repository is empty.') {
					repoExists = true;
					isRepoEmpty = true;
				}
				// repoSpinner.fail(chalk.default(err.body.message));
			}
		}

		/**
		 *  Update README on the upstream repo
		 */
		if (sha && !isRepoEmpty) {
			try {
				repoSpinner.start('Updating repository...');
				// Update README.md
				await ghGot(`/repos/${username}/${repo}/contents/README.md`, {
					method: 'PUT',
					token,
					body: {
						message: 'update stars by stargazed',
						content: contentBuffer,
						sha,
					},
				});
				repoSpinner.succeed('Update to repository successful!');
			} catch (err) {
				repoSpinner.fail(chalk.default(err.body && err.body.message));
			}
			repoSpinner.stop();
		}

		if (!repoExists || isRepoEmpty) {
			/**
			 *  Create new Repository
			 */
			if (!repoExists) {
				repoSpinner.start('Creating new repository...');

				const repoDetails = {
					name: repo,
					description: 'A curated list of my GitHub stars by stargazed',
					homepage: 'https://github.com/abhijithvijayan/stargazed',
					private: false,
					has_projects: false,
					has_issues: false,
					has_wiki: false,
				};

				try {
					await ghGot('/user/repos', { method: 'POST', token, body: { ...repoDetails } });

					repoSpinner.succeed(`Repository '${repo}' created successfully`);
				} catch (err) {
					repoSpinner.fail(chalk.default(err.body && err.body.message));
				}
				repoSpinner.stop();
			}

			/**
			 *  Upload file if repo doesn't exist or is empty
			 */
			repoSpinner.start('Uploading README file...');

			try {
				// Create README.md
				await ghGot(`/repos/${username}/${repo}/contents/README.md`, {
					method: 'PUT',
					token,
					body: {
						message: 'initial commit from stargazed',
						content: contentBuffer,
					},
				});

				repoSpinner.succeed('README file uploaded successfully');
			} catch (err) {
				repoSpinner.fail(chalk.default(err.body && err.body.message));
			}
			repoSpinner.stop();
		}
	}
};
