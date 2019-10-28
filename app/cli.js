/**
 *  @author abhijithvijayan <abhijithvijayan.in>
 */
const ora = require('ora');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const ghGot = require('gh-got');
const chalk = require('chalk');
const { promisify } = require('util');
const unescape = require('lodash.unescape');

const pkg = require('../package.json');
const { flashError } = require('./utils/message');
const validateArguments = require('./utils/validate');

const options = {};

/**
 *  Escape symbol table
 */
const htmlEscapeTable = {
	'>': '&gt;',
	'<': '&lt;',
	'\n': '',
	'[|]': '\\|',
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

/**
 *  Read the workflow sample file
 */
const getWorkflowTemplate = async () => {
	const spinner = ora('Loading sample workflow file').start();

	try {
		const sample = await promisify(fs.readFile)(path.resolve(__dirname, './workflow_sample.yml'), 'utf8');
		spinner.succeed('workflow_sample.yml loaded');
		return sample;
	} catch (err) {
		spinner.fail('workflow_sample.yml loading failed!');
		flashError(err);
	}
};

/**
 *  Build the workflow.yml content
 */

const buildWorkflowContent = async (username, repo) => {
	// Read workflow_sample.yml
	let workflow = await getWorkflowTemplate();
	// Replace with user-defined values
	const mapObj = {
		'{{USERNAME}}': username,
		'{{REPO}}': repo,
	};
	workflow = workflow.replace(/{{USERNAME}}|{{REPO}}/gi, function(matched) {
		return `"${mapObj[matched]}"`;
	});
	return workflow;
};

// TODO: Refactor to reduce complexity

/**
 *  Core function
 */
const stargazed = async _options => {
	const err = validateArguments(_options);

	if (err) {
		flashError(err);
		return;
	}

	const { username, token = '', sort, repo, message, workflow, version } = options;

	let gitStatus = false;
	let cronJob = false;

	if (version) {
		console.log(chalk.default(pkg.version));
		// for tests
		return pkg.version;
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
		if (workflow) {
			cronJob = true;
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

	/**
	 *  Asynchronous API Call
	 */
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
			let {
				name,
				description,
				html_url,
				language,
				stargazers_count,
				owner: { login },
			} = item;
			language = language || 'Others';
			description = description ? description.htmlEscape() : '';
			if (!(language in unordered)) {
				unordered[language] = [];
			}
			// push item into array
			unordered[language].push([name, html_url, description.trim(), login, stargazers_count]);
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
	const readmeContent = await buildReadmeContent({
		// array of languages
		languages,
		// Total items count
		count: Object.keys(list).length,
		// Stargazed Repos
		stargazed: sort ? ordered : unordered,
		username,
		date: `${new Date().getDate()}--${new Date().getMonth()}--${new Date().getFullYear()}`,
	});

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
			} = await ghGot(`/repos/${username}/${repo}/contents/README.md`, {
				token,
			}));

			// Set flag to avoid creating new repo
			repoExists = true;

			repoSpinner.info('Repository found!');
			repoSpinner.stop();
		} catch (err) {
			if (err.body) {
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
			repoSpinner.start('Updating repository...');

			try {
				// Update README.md
				await ghGot(`/repos/${username}/${repo}/contents/README.md`, {
					method: 'PUT',
					token,
					body: {
						message: message || 'update stars by stargazed',
						content: contentBuffer,
						sha,
					},
				});
				repoSpinner.succeed('Update to repository successful!');
			} catch (err) {
				if (err.body) {
					repoSpinner.fail(chalk.default(err.body.message));
				}
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
					await ghGot('/user/repos', {
						method: 'POST',
						token,
						body: { ...repoDetails },
					});

					repoSpinner.succeed(`Repository '${repo}' created successfully`);
				} catch (err) {
					repoSpinner.info(chalk.default(err.body && err.body.message));
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
						message: message || 'initial commit from stargazed',
						content: contentBuffer,
					},
				});

				repoSpinner.succeed('README file uploaded successfully');
			} catch (err) {
				if (err.body) {
					repoSpinner.fail(chalk.default(err.body.message));
				}
			}
			repoSpinner.stop();
		}

		/**
		 *  Setup GitHub Actions for Daily AutoUpdate
		 */
		if (cronJob) {
			repoSpinner.start('Setting up cron job for GitHub Actions...');

			const workflowContent = await buildWorkflowContent(username, repo);
			// String to base64
			const workflowBuffer = await Buffer.from(workflowContent, 'utf8').toString('base64');
			// Create .github/workflows/workflow.yml file
			try {
				// Create README.md
				await ghGot(`/repos/${username}/${repo}/contents/.github/workflows/workflow.yml`, {
					method: 'PUT',
					token,
					body: {
						message: 'Set up GitHub workflow for daily auto-update',
						content: workflowBuffer,
					},
				});

				repoSpinner.succeed('Setup GitHub Actions workflow success');
			} catch (err) {
				if (err.body) {
					// GitHub returns this error if file already exist
					if (err.body.message === 'Invalid request.\n\n"sha" wasn\'t supplied.') {
						repoSpinner.info(chalk.default('GitHub workflow already setup for the repo!'));
					} else {
						repoSpinner.fail(chalk.default(err.body.message));
					}
				}
			}
			repoSpinner.stop();
		}
	}
};

// The user input options object
module.exports.options = options;
module.exports = stargazed;
module.exports.validate = validateArguments;
module.exports.htmlEscapeTable = htmlEscapeTable;
module.exports.getReadmeTemplate = getReadmeTemplate;
module.exports.buildReadmeContent = buildReadmeContent;
module.exports.writeReadmeContent = writeReadmeContent;
module.exports.getWorkflowTemplate = getReadmeTemplate;
module.exports.buildWorkflowContent = buildWorkflowContent;
