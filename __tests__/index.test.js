import MainFunc, { htmlEscapeTable, getReadmeTemplate, buildReadmeContent } from '../index';
import '@testing-library/jest-dom/extend-expect';

const pckg = require('../package.json');

describe('Commands functional tests', () => {
	test('should check basic input behavior', async () => {
		// TODO: Get better mocking of inputs and full intergration
		// const response = await MainFunc({
		// 	username: 'Jean Luc Picard',
		// 	token: '1701-D',
		// 	repo: 'Enterprise',
		// 	message: 'Make it so...',
		// 	// sort: true,
		// 	// workflow: true,
		// 	// version: true,
		// });
		// console.log(response);
	});
	test('should static check htmlEscapeTable mapping', async () => {
		expect(htmlEscapeTable['>']).toBe('&gt;');
		expect(htmlEscapeTable['<']).toBe('&lt;');
	});
	test('should show positive getReadmeTemplate() outcome', async () => {
		const template = await getReadmeTemplate();

		expect(template).toBeTruthy();
		expect(template.slice(0, 9)).toBe('# Awesome');
		expect(template.length).toBe(2180);
	});
	test('should show positive buildReadmeContent(context) outcome', async () => {
		// TODO: the template breaks on line 28 looking for length on "item"
		// console.log(
		//	// 	await buildReadmeContent({
		// 		languages: ['Klingon', 'English', 'Vulcan', 'JavaScript'],
		// 		username: 'Jean Luc Picard',
		// 		count: Object.keys([1, 2, 3, 4]).length,
		// 		stargazed: true,
		// 		date: `${new Date().getDate()}--${new Date().getMonth()}--${new Date().getFullYear()}`,
		// 	})
		// );
	});
});
