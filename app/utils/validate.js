const isObject = require('validate.io-object');
const isString = require('validate.io-string-primitive');
const isBoolean = require('validate.io-boolean-primitive');

const cli = require('../cli');

const validateArguments = _options => {
	const { options } = cli;

	if (!isObject(_options)) {
		return new TypeError(`invalid input argument. Options argument must be an object. Value: \`${_options}\`.`);
	}

	if (
		Object.prototype.hasOwnProperty.call(_options, 'username') ||
		Object.prototype.hasOwnProperty.call(_options, 'u')
	) {
		options.username = _options.username || _options.u;
		if (!isString(options.username)) {
			return new TypeError(`invalid option. Username must be a string primitive.`);
		}
	}

	if (
		Object.prototype.hasOwnProperty.call(_options, 'token') ||
		Object.prototype.hasOwnProperty.call(_options, 't')
	) {
		options.token = _options.token || _options.t;
		if (!isString(options.token)) {
			return new TypeError(`invalid option. Token must be a string primitive.`);
		}
	}

	if (Object.prototype.hasOwnProperty.call(_options, 'repo') || Object.prototype.hasOwnProperty.call(_options, 'r')) {
		options.repo = _options.repo || _options.r;
		if (!isString(options.repo)) {
			return new TypeError(`invalid option. Repo name must be a string primitive.`);
		}
	}

	if (
		Object.prototype.hasOwnProperty.call(_options, 'message') ||
		Object.prototype.hasOwnProperty.call(_options, 'm')
	) {
		options.message = _options.message || _options.m;
		if (!isString(options.message)) {
			return new TypeError(`invalid option. Commit message must be a string primitive.`);
		}
	}

	if (Object.prototype.hasOwnProperty.call(_options, 'sort') || Object.prototype.hasOwnProperty.call(_options, 's')) {
		options.sort = _options.sort || _options.s;
		if (!isBoolean(options.sort)) {
			return new TypeError(`invalid option. Sort option must be a boolean primitive.`);
		}
	}

	if (
		Object.prototype.hasOwnProperty.call(_options, 'workflow') ||
		Object.prototype.hasOwnProperty.call(_options, 'w')
	) {
		options.workflow = _options.workflow || _options.w;
		if (!isBoolean(options.workflow)) {
			return new TypeError(`invalid option. Workflow option must be a boolean primitive.`);
		}
	}

	if (
		Object.prototype.hasOwnProperty.call(_options, 'version') ||
		Object.prototype.hasOwnProperty.call(_options, 'v')
	) {
		options.version = _options.version || _options.v;
		if (!isBoolean(options.version)) {
			return new TypeError(`invalid option. Version option must be a boolean primitive.`);
		}
	}

	return null;
};

module.exports = validateArguments;
