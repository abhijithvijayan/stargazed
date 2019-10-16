import stargazed from '..';
import '@testing-library/jest-dom/extend-expect';

const pckg = require('../package.json');

describe('Commands functional tests', () => {
	test('should check basic input behavior', async () => {
		await stargazed({
			username: 'Jean-Luc-Picard',
			token: '1701-D',
			repo: 'Enterprise',
			message: 'Make it so...',
			sort: true,
			workflow: true,
			version: true,
		});
	});
	test('should static check htmlEscapeTable mapping', async () => {
		expect(stargazed.htmlEscapeTable['>']).toBe('&gt;');
		expect(stargazed.htmlEscapeTable['<']).toBe('&lt;');
		expect(stargazed.htmlEscapeTable['|']).toBe('|');
	});
	test('should show positive getReadmeTemplate() outcome', async () => {
		const template = await stargazed.getReadmeTemplate();

		expect(template).toBeTruthy();
		expect(template.slice(0, 9)).toBe('# Awesome');
		expect(template.length).toBe(2180);
	});
	test('should show positive buildReadmeContent(context) outcome', async () => {
		await stargazed.buildReadmeContent({
			languages: ['Klingon', 'English', 'Vulcan', 'JavaScript'],
			username: 'Jean-Luc-Picard',
			count: Object.keys([1, 2, 3, 4]).length,
			stargazed: {
				Klingon: [[1, 'URL', 'description', 'author', 1000], [2, 'URL', 'description', 'author', 2000]],
				English: [[2, 'URL', 'description', 'author', 2000]],
				Vulcan: [[3, 'URL', 'description', 'author', 3000]],
				JavaScript: [[4, 'URL', 'description', 'author', 4000]],
			},
			date: `${new Date().getDate()}--${new Date().getMonth()}--${new Date().getFullYear()}`,
		});
	});
});
