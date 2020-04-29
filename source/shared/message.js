const chalk = require('chalk');
require('emoji-log');

/**
 *  Display Validation Errors
 */
function flashError(message) {
  console.emoji('🦄', chalk.bold.red(`✖ ${message}`));
  process.exit(1);
}

module.exports = {flashError};
