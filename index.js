'use strict';

const ghGot = require('gh-got');

module.exports = (_options) => {

  console.log(_options);

  const {u, username} = _options;

  const url = `users/${u || username}/starred`;
  return (async () => {
      const response = await ghGot(url, _options);

      console.log(response);

      return response;
  })(); 
};