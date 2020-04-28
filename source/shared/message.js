const chalk = require('chalk');
require('unicorn.log');

/**
 *  Display Validation Errors
 */
function flashError(message) {
  console.unicorn(chalk.bold.red(`✖ ${message}`));
  process.exit(1);
}

module.exports = {flashError};
