'use strict';

const ghGot = require('gh-got');
const chalk = require("chalk");
const isObject = require('validate.io-object');
const isString = require('validate.io-string-primitive');
const isBoolean = require('validate.io-boolean-primitive');

let options = {};

function validate(_options) {
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


module.exports = (_options) => {
  
  /**
   *  Display Validation Errors
   */
  function flashValidationError(message) {
    console.error(chalk.bold.red(`✖ ${message}`));
    process.exit(1);
  }

  const err = validate(_options);

  if (err) {
    flashValidationError(err);
    return;
  }

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

  /**
   *  Trim whitespaces
   */
  if (typeof (String.prototype.trim) === "undefined") {
    String.prototype.trim = function () {
      return String(this).replace(/^\s+|\s+$/g, '');
    };
  }

  console.log(options);

  const { username } = options;
  const url = `users/${username}/starred`;

  (async () => {
    let responseObj = {};
    let stargazed = {};
    try {
      responseObj = await ghGot(url, _options);
    } catch(err) {
      console.warn(
        chalk.bold.green(`Error while fetching data!`)
      );
      return;
    }

    if (!Object.keys(responseObj).length) {
      console.warn(
        chalk.bold.green(`Fetch complete!`)
      );
    }

    const { body } = responseObj;

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

    console.log(stargazed);
    
    // console.log(responseObj);

    return responseObj;
  })(); 
};