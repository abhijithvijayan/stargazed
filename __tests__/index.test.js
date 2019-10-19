import stargazed, {
	validate,
	// flashError,
	htmlEscapeTable,
	getReadmeTemplate,
	buildReadmeContent,
	// writeReadmeContent,
	buildWorkflowContent,
} from '..';
import '@testing-library/jest-dom/extend-expect';

import {
	inputContent,
	badInputToken,
	goodInputValidation,
	badInputUsername,
	goodInputFalseValidation,
	badInputRepo,
	badInputMessage,
} from '../mock/contentInput';

const pckg = require('../package.json');

//! flashError cannot be tested currently due to process.exit
// ? research a way to test something as it exits?

describe('Commands functional tests', () => {
	test('should check basic input behavior of core function', async () => {
		const response = await stargazed({
			username: 'Jean-Luc-Picard',
			token: '1701-D',
			repo: 'Enterprise',
			message: 'Make it so...',
			sort: true,
			workflow: true,
			version: true,
		});

		expect(response).toBe(pckg.version);
	});
	test('should static check htmlEscapeTable mapping', async () => {
		expect(htmlEscapeTable['>']).toBe('&gt;');
		expect(htmlEscapeTable['<']).toBe('&lt;');
		expect(htmlEscapeTable['[|]']).toBe('\\|');
		expect(htmlEscapeTable['\n']).toBe('');
	});
	test('should show positive getReadmeTemplate() outcome', async () => {
		const template = await getReadmeTemplate();

		expect(template).toBeTruthy();
		expect(template.slice(0, 9)).toBe('# Awesome');
		expect(template.length > 10).toBe(true);
	});
	test('should show positive buildReadmeContent(context) outcome', async () => {
		const response = await buildReadmeContent(inputContent);

		expect(response.match('Klingon')[0]).toBe('Klingon');
		expect(response.match('English')[0]).toBe('English');
		expect(response.match('Vulcan')[0]).toBe('Vulcan');
		expect(response.match('JavaScript')[0]).toBe('JavaScript');
	});
	test('should show that the data is mapped for workflow content', async () => {
		const response = await buildWorkflowContent('Jean-Luc-Picard', 'mock-repository');

		expect(response).toBeTruthy();
		expect(response).toContain('cron');
		expect(response).toContain('Jean-Luc-Picard');
		expect(response.length > 0).toBe(true);
	});
	test('should check validation good input/output - positive branch return null', async () => {
		expect(validate(goodInputValidation)).toBeNull();
	});

	// test('should check validation good input/output - positive branch return null', async () => {
	// 	expect(validate(goodInputFalseValidation)).toBeNull();
	// });
	test('should check bad inputs in validation behavior/paths', () => {
		const badTokenRes = () => {
			throw validate(badInputToken);
		};
		expect(badTokenRes).toThrowError(new TypeError(`invalid option. Token must be a string primitive.`));

		const badUsernameRes = () => {
			throw validate(badInputUsername);
		};
		expect(badUsernameRes).toThrowError(new TypeError(`invalid option. Username must be a string primitive.`));

		const badRepoRes = () => {
			throw validate(badInputRepo);
		};
		expect(badRepoRes).toThrowError(new TypeError('invalid option. Repo name must be a string primitive.'));
		const badMessageRes = () => {
			throw validate(badInputMessage);
		};
		expect(badMessageRes).toThrowError(new TypeError('invalid option. Commit message must be a string primitive.'));
	});

	
});
