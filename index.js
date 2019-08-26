'use strict';

const ghGot = require('gh-got');
const chalk = require("chalk");
const isObject = require('validate.io-object');
const isString = require('validate.io-string-primitive');

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
  return null;
}

function flashValidationError(message) {
  console.error(chalk.bold.red(`✖ ${message}`));
  process.exit(1);
}

module.exports = (_options) => {

  const err = validate(_options);
  if (err) {
    flashValidationError(err);
    return;
  }

  console.log(options);

  const { username } = options;
  const url = `users/${username}/starred`;

  (async () => {
    let response = [];

    try {
      response = await ghGot(url, _options);
    } catch(err) {
      console.warn(
        chalk.bold.green(`Error while fetching data!`)
      );
      return;
    }

    if (!response.length) {
      console.warn(
        chalk.bold.green(`Fetch complete!`)
      );
    }

      // console.log(response);

      return response;
  })(); 
};