const ghGot = require('gh-got');
const chalk = require('chalk');

const Spinner = require('./spinner');
const { EMPTY_REPO_MESSAGE } = require('./message');

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
	} catch (err) {
		if (err.body) {
			if (err.body.message === EMPTY_REPO_MESSAGE) {
				repoExists = true;
				isRepoEmpty = true;
			}
			// spinner.fail(chalk.default(err.body.message));
		}
	} finally {
		spinner.stop();
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
	} finally {
		spinner.stop();
	}
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
		spinner.info(chalk.default(err.body && err.body.message));
	} finally {
		spinner.stop();
	}
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

const handleRepositoryActions = async ({ username, repo, token, message, readmeContent }) => {
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

module.exports = {
	checkIfReadmeExist,
	updateRepositoryReadme,
	createRepository,
	uploadReadmeToRepository,
	handleRepositoryActions,
};
