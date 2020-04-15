const ora = require('ora');

class Spinner {
	constructor(text) {
		this._text = text;
		this._spinner = ora(this._text);
	}

	start() {
		this._spinner.start();
	}

	info(text) {
		this._spinner.info(text);
	}

	succeed(text) {
		this._spinner.succeed(text);
	}

	fail(text) {
		this._spinner.fail(text);
	}

	stop() {
		this._spinner.stop();
	}
}

module.exports = Spinner;
