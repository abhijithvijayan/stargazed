const fs = require('fs');
const {promisify} = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

module.exports = {
  readFileAsync,
  writeFileAsync,
};
