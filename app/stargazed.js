/**
 *  stargazed
 *
 *  @author   abhijithvijayan <abhijithvijayan.in>
 *  @license  MIT License
 */

const ejs = require('ejs');
const path = require('path');
const ghGot = require('gh-got');
const unescape = require('lodash.unescape');

const { options } = require('./utils/validate');
const Spinner = require('./utils/spinner');
const { flashError } = require('./utils/message');
const { readFileAsync, writeFileAsync } = require('./utils/fs');

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
String.prototype.htmlEscape = function () {
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
	} finally {
		spinner.stop();
	}
};

/**
 *  Render out readme content
 */
const buildReadmeContent = async (context) => {
	const template = await getReadmeTemplate();

	return ejs.render(template, {
		...context,
	});
};

/**
 *  Write content to README.md
 */
const writeReadmeContent = async (readmeContent) => {
	const spinner = new Spinner('Creating README locally');
	spinner.start();

	try {
		await writeFileAsync('README.md', unescape(readmeContent));

		spinner.succeed('README created locally');
	} catch (err) {
		spinner.fail('Failed to create README');
		flashError(err);
	} finally {
		spinner.stop();
	}
};

/**
 *  Asynchronous API Call
 */
const fetchUserStargazedRepos = async ({ spinner, list = [], page = 1 }) => {
	const { username, token } = options;

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
		return fetchUserStargazedRepos({ spinner, list: entries, page: pageNumber });
	}

	return { list: entries };
};

/**
 *  stargazed repo list parser
 */
const parseStargazedList = ({ list, unordered }) => {
	return list.forEach((item) => {
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

module.exports.htmlEscapeTable = htmlEscapeTable;
module.exports.getReadmeTemplate = getReadmeTemplate;
module.exports.parseStargazedList = parseStargazedList;
module.exports.buildReadmeContent = buildReadmeContent;
module.exports.writeReadmeContent = writeReadmeContent;
module.exports.fetchUserStargazedRepos = fetchUserStargazedRepos;
