const ejs = require('ejs');
const path = require('path');
const ghGot = require('gh-got');
const unescape = require('lodash.unescape');

const Spinner = require('../shared/spinner');
const {flashError} = require('../shared/message');
const {readFileAsync, writeFileAsync} = require('./shared/fs');

// Escape symbol table
const htmlEscapeTable = {
  '>': '&gt;',
  '<': '&lt;',
  '\n': '',
  '[|]': '\\|',
};

// Replace special characters with escape code
// eslint-disable-next-line func-names
String.prototype.htmlEscape = function () {
  let escStr = this;

  Object.entries(htmlEscapeTable).map(([key, value]) => {
    return (escStr = escStr.replace(new RegExp(key, 'g'), value));
  });

  return escStr;
};

// Write content to README.md
async function writeReadmeContent(readmeContent) {
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
}

// Read the template from markdown file
async function getReadmeTemplate() {
  const spinner = new Spinner('Loading README template');
  spinner.start();

  try {
    const template = await readFileAsync(
      path.resolve(__dirname, '../templates', './stargazed.md'),
      'utf8'
    );

    spinner.succeed('README template loaded');

    return template;
  } catch (err) {
    spinner.fail('README template loading failed!');
    flashError(err);
  } finally {
    spinner.stop();
  }
}

// Render out readme content
async function buildReadmeContent(context) {
  const template = await getReadmeTemplate();

  return ejs.render(template, {
    ...context,
  });
}

/**
 *  @returns Object of Arrays
 */
function generateStargazedList(list) {
  const unordered = {};

  list.forEach((item) => {
    let {
      name,
      description,
      html_url,
      language,
      stargazers_count,
      owner: {login},
    } = item;

    language = language || 'Others';
    description = description ? description.trim().htmlEscape() : '';

    if (!(language in unordered)) {
      unordered[language] = [];
    }

    unordered[language].push({
      name,
      html_url,
      description,
      login,
      stargazers_count,
    });
  });

  return unordered;
}

// Asynchronous API Call
async function fetchUserStargazedRepos({
  spinner,
  options,
  list = [],
  page = 1,
}) {
  let entries = list;
  let pageNumber = page;
  let response;

  const {username, token} = options;
  const url = `users/${username}/starred?&per_page=100&page=${pageNumber}`;

  try {
    response = await ghGot(url, {token});
  } catch (err) {
    spinner.fail('Error occured while fetching data!');
    flashError(err);

    return;
  }

  const {body, headers} = response;

  // Concatenate to existing data
  entries = entries.concat(body);

  // GitHub returns `last` for the last page
  if (headers.link && headers.link.includes('next')) {
    pageNumber += 1;
    return fetchUserStargazedRepos({
      spinner,
      options,
      list: entries,
      page: pageNumber,
    });
  }

  return {
    list: entries,
  };
}

module.exports.htmlEscapeTable = htmlEscapeTable;
module.exports.getReadmeTemplate = getReadmeTemplate;
module.exports.buildReadmeContent = buildReadmeContent;
module.exports.writeReadmeContent = writeReadmeContent;
module.exports.generateStargazedList = generateStargazedList;
module.exports.fetchUserStargazedRepos = fetchUserStargazedRepos;
