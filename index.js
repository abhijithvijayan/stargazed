'use strict';

const ghGot = require('gh-got');
const chalk = require("chalk");
const isObject = require('validate.io-object');
const isString = require('validate.io-string-primitive');

let opts = {};

function validate(options) {
  if (!isObject(options)) {
    return new TypeError('invalid input argument. Options argument must be an object. Value: `' + options + '`.');
  }
  if (options.hasOwnProperty('username') || options.hasOwnProperty('u')) {
    opts.username = options.username || options.u;
    if (!isString(opts.username)) {
      return new TypeError('invalid option. Username must be a string primitive. Option: `' + opts.username + '`.');
    }
  }
  if (options.hasOwnProperty('token') || options.hasOwnProperty('t')) {
    opts.token = options.token || options.t;
    if (!isString(opts.token)) {
      return new TypeError('invalid option. Token must be a string primitive. Option: `' + opts.token + '`.');
    }
  }
  if (options.hasOwnProperty('repo') || options.hasOwnProperty('r')) {
    opts.repo = options.repo || options.r;
    if (!isString(opts.repo)) {
      return new TypeError('invalid option. Repo name must be a string primitive. Option: `' + opts.repo + '`.');
    }
  }
  if (options.hasOwnProperty('message') || options.hasOwnProperty('m')) {
    opts.message = options.message || options.m;
    if (!isString(opts.message)) {
      return new TypeError('invalid option. Commit message must be a string primitive. Option: `' + opts.message + '`.');
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

  console.log(opts);

  const {u, username} = _options;

  const url = `users/${u || username}/starred`;
  return (async () => {
      const response = await ghGot(url, _options);

      // console.log(response);

      return response;
  })(); 
};