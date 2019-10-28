/**
 *  @author abhijithvijayan <abhijithvijayan.in>
 */

const ejs = require('ejs');
const path = require('path');
const ghGot = require('gh-got');
const chalk = require('chalk');
const unescape = require('lodash.unescape');

const pkg = require('../package.json');
const Spinner = require('./utils/spinner');
const { flashError } = require('./utils/message');
const validateArguments = require('./utils/validate');
const { EMPTY_REPO_MESSAGE } = require('./utils/constants');
const { readFileAsync, writeFileAsync } = require('./utils/fs');

// User-input argument options
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
	const spinner = new Spinner('Loading README template');
	spinner.start();

	try {
		const template = await readFileAsync(path.resolve(__dirname, 'templates', './stargazed.md'), 'utf8');

		spinner.succeed('README template loaded');

		return template;
	} catch (err) {
		spinner.fail('README template loading failed!');
		flashError(err);
	}

	spinner.stop();
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
	const spinner = new Spinner('Creating README locally');
	spinner.start();

	try {
		await writeFileAsync('README.md', unescape(readmeContent));

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
	const spinner = new Spinner('Loading sample workflow file');
	spinner.start();

	try {
		const sample = await readFileAsync(path.resolve(__dirname, 'templates', './workflow.yml'), 'utf8');

		spinner.succeed('workflow.yml loaded');

		return sample;
	} catch (err) {
		spinner.fail('workflow.yml loading failed!');
		flashError(err);
	}

	spinner.stop();
};

/**
 *  Build the workflow.yml content
 */
const buildWorkflowContent = async (username, repo) => {
	// Read workflow.yml
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

/**
 *  Asynchronous API Call
 */
const fetchUserStargazedRepos = async ({ spinner, username, token, list = [], page = 1 }) => {
	let pageNumber = page;
	let entries = list;
	let response;

	const url = `users/${username}/starred?&per_page=100&page=${pageNumber}`;

	try {
		response = await ghGot(url, { token });
	} catch (err) {
		spinner.fail('Error occured while fetching data!');
		flashError(err);

		return;
	}

	const { body, headers } = response;

	// Concatenate to existing data
	entries = entries.concat(body);

	// GitHub returns `last` for the last page
	if (headers.link && headers.link.includes('next')) {
		pageNumber += 1;
		return fetchUserStargazedRepos({ spinner, username, token, list: entries, page: pageNumber });
	}

	return { list: entries };
};

/**
 *  stargazed repo list parser
 */
const parseStargazedList = ({ list, unordered }) => {
	return list.forEach(item => {
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

		unordered[language].push([name, html_url, description.trim(), login, stargazers_count]);
	});
};

/**
 *  Function to find if repo is empty / readme exists
 */
const checkIfReadmeExist = async ({ username, repo, token }) => {
	const spinner = new Spinner(`Checking if repository '${repo}' exists...`);
	spinner.start();

	let sha = null;
	let repoExists = false;
	let isRepoEmpty = false;

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

		spinner.info('Repository found!');
		spinner.stop();
	} catch (err) {
		if (err.body) {
			if (err.body.message === EMPTY_REPO_MESSAGE) {
				repoExists = true;
				isRepoEmpty = true;
			}
			// spinner.fail(chalk.default(err.body.message));
		}
	}

	return { sha, repoExists, isRepoEmpty };
};

/**
 *  Update upstream README.md
 */
const updateRepositoryReadme = async ({ username, repo, token, message, contentBuffer, sha }) => {
	const spinner = new Spinner('Updating repository...');
	spinner.start();

	try {
		await ghGot(`/repos/${username}/${repo}/contents/README.md`, {
			method: 'PUT',
			token,
			body: {
				message: message || 'update stars by stargazed',
				content: contentBuffer,
				sha,
			},
		});

		spinner.succeed('Update to repository successful!');
	} catch (err) {
		if (err.body) {
			spinner.fail(chalk.default(err.body.message));
		}
	}

	spinner.stop();
};

/**
 *  Create a upstream repository with metadata
 */
const createRepository = async ({ repo, token }) => {
	const spinner = new Spinner('Creating new repository...');
	spinner.start();

	const repoDetails = {
		name: repo,
		description: 'A curated list of my GitHub stars by stargazed',
		homepage: 'https://github.com/abhijithvijayan/stargazed',
		private: true,
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

		spinner.succeed(`Repository '${repo}' created successfully`);
	} catch (err) {
		spinner.info(chalk.default(err.body && err.body.message));
	}

	spinner.stop();
};

/**
 *  Create a new README.md file in repository
 */
const uploadReadmeToRepository = async ({ username, repo, token, message, contentBuffer }) => {
	const spinner = new Spinner('Uploading README file...');
	spinner.start();

	try {
		await ghGot(`/repos/${username}/${repo}/contents/README.md`, {
			method: 'PUT',
			token,
			body: {
				message: message || 'initial commit from stargazed',
				content: contentBuffer,
			},
		});

		spinner.succeed('README file uploaded successfully');
	} catch (err) {
		if (err.body) {
			spinner.fail(chalk.default(err.body.message));
		}
	}

	spinner.stop();
};

/**
 *  Core Driver function
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

	const unordered = {};
	const ordered = {};

	const spinner = new Spinner('Fetching stargazed repositories...');
	spinner.start();

	// API Calling function
	const { list = [] } = await fetchUserStargazedRepos({ spinner, username, token });

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
	 *  Handles all the repo actions
	 */
	if (gitStatus) {
		const { sha, repoExists, isRepoEmpty } = await checkIfReadmeExist({
			username,
			repo,
			token,
		});

		// Content to write (base-64)
		const contentBuffer = await Buffer.from(unescape(readmeContent), 'utf8').toString('base64');

		/**
		 *  Update README on the upstream repo
		 */
		if (sha && !isRepoEmpty) {
			await updateRepositoryReadme({ username, repo, token, message, contentBuffer, sha });
		}

		if (!repoExists || isRepoEmpty) {
			/**
			 *  Create new Repository
			 */
			if (!repoExists) {
				await createRepository({ repo, token });
			}

			/**
			 *  Upload file if repo doesn't exist or is empty
			 */
			await uploadReadmeToRepository({ username, repo, token, message, contentBuffer });
		}

		/**
		 *  Setup GitHub Actions for Daily AutoUpdate
		 */
		if (cronJob) {
			spinner.start('Setting up cron job for GitHub Actions...');

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

				spinner.succeed('Setup GitHub Actions workflow success');
			} catch (err) {
				if (err.body) {
					// GitHub returns this error if file already exist
					if (err.body.message === 'Invalid request.\n\n"sha" wasn\'t supplied.') {
						spinner.info(chalk.default('GitHub workflow already setup for the repo!'));
					} else {
						spinner.fail(chalk.default(err.body.message));
					}
				}
			}

			spinner.stop();
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
