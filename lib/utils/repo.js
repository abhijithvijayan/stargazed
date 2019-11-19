const path = require('path');
const chalk = require('chalk');
const ghGot = require('gh-got');

const cli = require('../cli');
const Spinner = require('./spinner');
const pkg = require('../../package.json');
const { flashError } = require('./message');
const { readFileAsync } = require('./fs');
const { EMPTY_REPO_MESSAGE, SHA_NOT_SUPPLIED_ERROR } = require('./constants');

/**
 *  Function to find if repo is empty / readme exists
 */
const checkIfReadmeExist = async () => {
	const {
		options: { username, repo, token = '' },
	} = cli;

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
	} catch (err) {
		if (err.body) {
			if (err.body.message === EMPTY_REPO_MESSAGE) {
				repoExists = true;
				isRepoEmpty = true;
			}
			// spinner.fail(chalk(err.body.message));
		}
	} finally {
		spinner.stop();
	}

	return { sha, repoExists, isRepoEmpty };
};

/**
 *  Update upstream README.md
 */
const updateRepositoryReadme = async ({ contentBuffer, sha }) => {
	const {
		options: { username, repo, token = '', message },
	} = cli;

	const spinner = new Spinner('Updating repository...');
	spinner.start();

	try {
		await ghGot(`/repos/${username}/${repo}/contents/README.md`, {
			method: 'PUT',
			token,
			body: {
				message: message || `update stars by stargazed ${pkg.version}`,
				content: contentBuffer,
				sha,
			},
		});

		spinner.succeed('Update to repository successful!');
	} catch (err) {
		if (err.body) {
			spinner.fail(chalk(err.body.message));
		}
	} finally {
		spinner.stop();
	}
};

/**
 *  Create a upstream repository with metadata
 */
const createRepository = async () => {
	const {
		options: { repo, token = '' },
	} = cli;

	const spinner = new Spinner('Creating new repository...');
	spinner.start();

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

		spinner.succeed(`Repository '${repo}' created successfully`);
	} catch (err) {
		spinner.info(chalk(err.body && err.body.message));
	} finally {
		spinner.stop();
	}
};

/**
 *  Create a new README.md file in repository
 */
const uploadReadmeToRepository = async ({ contentBuffer }) => {
	const {
		options: { username, repo, token, message },
	} = cli;

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
			spinner.fail(chalk(err.body.message));
		}
	}

	spinner.stop();
};

const handleRepositoryActions = async ({ readmeContent }) => {
	const {
		options: { username, repo, token = '', message },
	} = cli;

	const { sha, repoExists, isRepoEmpty } = await checkIfReadmeExist({
		username,
		repo,
		token,
	});

	// Content to write (base-64)
	const contentBuffer = await Buffer.from(unescape(readmeContent), 'utf8').toString('base64');

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
};

/**
 *  Read the workflow sample file
 */
const getWorkflowTemplate = async () => {
	const spinner = new Spinner('Loading sample workflow file');
	spinner.start();

	try {
		const sample = await readFileAsync(path.resolve(__dirname, '../templates', './workflow.yml'), 'utf8');

		spinner.succeed('workflow.yml loaded');

		return sample;
	} catch (err) {
		spinner.fail('workflow.yml loading failed!');
		flashError(err);
	} finally {
		spinner.stop();
	}
};

/**
 *  Build the workflow.yml content
 */
const buildWorkflowContent = async () => {
	const {
		options: { username, repo },
	} = cli;

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
 *  Handle setting up GitHub actions workflow
 */
const setUpWorkflow = async () => {
	const {
		options: { username, repo, token = '' },
	} = cli;

	const spinner = new Spinner('Setting up cron job for GitHub Actions...');
	spinner.start();

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
			if (err.body.message === SHA_NOT_SUPPLIED_ERROR) {
				spinner.info(chalk('GitHub workflow already setup for the repo!'));
			} else {
				spinner.fail(chalk(err.body.message));
			}
		}
	} finally {
		spinner.stop();
	}
};

module.exports = {
	checkIfReadmeExist,
	updateRepositoryReadme,
	createRepository,
	uploadReadmeToRepository,
	handleRepositoryActions,
	buildWorkflowContent,
	setUpWorkflow,
};
