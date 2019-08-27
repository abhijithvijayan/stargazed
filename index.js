'use strict';

const ora = require('ora');
const fs = require('fs');
const ejs = require('ejs');
const ghGot = require('gh-got');
const chalk = require("chalk");
const { promisify } = require('util');
const unescape = require('lodash.unescape');
const isObject = require('validate.io-object');
const isString = require('validate.io-string-primitive');
const isBoolean = require('validate.io-boolean-primitive');

let options = {};

const validate = (_options) => {
  if (!isObject(_options)) {
    return new TypeError('invalid input argument. Options argument must be an object. Value: `' + _options + '`.');
  }
  if (_options.hasOwnProperty('username') || _options.hasOwnProperty('u')) {
    options.username = _options.username || _options.u;
    if (!isString(options.username)) {
      return new TypeError('invalid option. Username must be a string primitive. Option: `' + options.username + '`.');
    }
  }
  if (_options.hasOwnProperty('token') || _options.hasOwnProperty('t')) {
    options.token = _options.token || _options.t;
    if (!isString(options.token)) {
      return new TypeError('invalid option. Token must be a string primitive. Option: `' + options.token + '`.');
    }
  }
  if (_options.hasOwnProperty('repo') || _options.hasOwnProperty('r')) {
    options.repo = _options.repo || _options.r;
    if (!isString(options.repo)) {
      return new TypeError('invalid option. Repo name must be a string primitive. Option: `' + options.repo + '`.');
    }
  }
  if (_options.hasOwnProperty('message') || _options.hasOwnProperty('m')) {
    options.message = _options.message || _options.m;
    if (!isString(options.message)) {
      return new TypeError('invalid option. Commit message must be a string primitive. Option: `' + options.message + '`.');
    }
  }
  if(_options.hasOwnProperty('sort') || _options.hasOwnProperty('s')) {
    options.sort = _options.sort || _options.s;
    if (!isBoolean(options.sort)) {
      return new TypeError('invalid option. Sort option must be a boolean primitive. Option: `' + options.sort + '`.');
    }
  }
  if (_options.hasOwnProperty('version') || _options.hasOwnProperty('v')) {
    options.version = _options.version || _options.v;
    if (!isBoolean(options.version)) {
      return new TypeError('invalid option. Version option must be a boolean primitive. Option: `' + options.version + '`.');
    }
  }
  if (_options.hasOwnProperty('help') || _options.hasOwnProperty('h')) {
    options.help = _options.help || _options.h;
    if (!isBoolean(options.help)) {
      return new TypeError('invalid option. Help option must be a boolean primitive. Option: `' + options.help + '`.');
    }
  }
  return null;
} 

/**
 *  Display Validation Errors
 */
const flashError = (message) => {
  console.error(chalk.bold.red(`✖ ${message}`));
  process.exit(1);
}

/** 
 *  Escape symbol table
 */
const htmlEscapeTable = {
  ">": "&gt;",
  "<": "&lt;",
};

/**
 *  Replace special characters with escape code
 */
String.prototype.htmlEscape = function() {
  let escStr = this;
  for (let x in htmlEscapeTable) {
    escStr = escStr.replace(new RegExp(x, 'g'), htmlEscapeTable[x]);
  }
  return escStr;
};

const getReadmeTemplate = async () => {
  const spinner = ora('Loading README template').start();

  try {
    const template = await promisify(fs.readFile)('template.md', 'utf8');
    spinner.succeed('README template loaded');
    return template;
  } catch (err) {
    spinner.fail('README template loading fail');
    flashError(err);
  }
}

const buildReadmeContent = async (context) => {
  const template = await getReadmeTemplate();
  // console.log(context);
  return ejs.render(template, {
    ...context
  })
}

const writeReadmeContent = async (readmeContent) => {
  const spinner = ora('Creating README').start()

  try {
    await promisify(fs.writeFile)('README.md', unescape(readmeContent));
    spinner.succeed('README created');
  } catch (err) {
    spinner.fail('README creation fail');
    flashError(err);
  }
}

module.exports = (_options) => {

  const err = validate(_options);

  if (err) {
    flashError(err);
    return;
  }

  /**
   *  Trim whitespaces
   */
  if (typeof (String.prototype.trim) === "undefined") {
    String.prototype.trim = function () {
      return String(this).replace(/^\s+|\s+$/g, '');
    };
  }

  const { username, sort } = options;
  const url = `users/${username}/starred`;

  (async () => {
    let response = {};
    let stargazed = {};
    try {
      response = await ghGot(url, _options);
    } catch(err) {
      console.warn(
        chalk.bold.green(`Error while fetching data!`)
      );
      return;
    }

    if (!Object.keys(response).length) {
      console.warn(
        chalk.bold.green(`Fetch complete!`)
      );
    }

    const { body } = response;

    /** 
     *  Parse and save object
     */
    if (Array.isArray(body)) {
      body.map((item, index) => {
        let { name, description, html_url, language  } = item;
        language = language || 'Others';
        description = description ? description.htmlEscape().replace('\n', '') : '';
        if (!(language in stargazed)) {
          stargazed[language] = [];
        }
        stargazed[language].push([name, html_url, description.trim()])
        return;
      }) 
    }

    if (sort) {
      // ToDo: Sort the object
    }

    /**
     *  Generate Language Index
     */
    let languages = Object.keys(stargazed);
    const readmeContent = await buildReadmeContent({ languages, username, stargazed })

    /** 
     *  Write Readme Content
     */
    await writeReadmeContent(readmeContent);
  })(); 
};