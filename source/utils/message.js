const chalk = require('chalk');

/**
 *  Display Validation Errors
 */
function flashError(message) {
	console.error(chalk.bold.red(`✖ ${message}`));
	process.exit(1);
}

module.exports = { flashError };
