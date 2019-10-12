import { flashError, htmlEscapeTable } from '../index';

describe('Commands functional tests', () => {
	test('should static check htmlEscapeTable mapping', () => {
		expect(htmlEscapeTable['>']).toBe('&gt;');
		expect(htmlEscapeTable['<']).toBe('&lt;');
	});
	// test('should check output of flashError', () => {
	// 	expect(flashError('ErrorTest')).toBe('');
	// });
});
