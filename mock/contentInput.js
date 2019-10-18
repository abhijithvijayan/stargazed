export const inputContent = {
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
};

export const badInputToken = {
	username: 'Jean-Luc-Picard',
	token: null,
	repo: 'Enterprise',
	message: 'Make it so...',
	sort: true,
	workflow: true,
	version: true,
};

export const badInputUsername = {
	username: null,
	token: '1701-D',
	repo: 'Enterprise',
	message: 'Make it so...',
	sort: true,
	workflow: true,
	version: true,
};

export const goodInputValidation = {
	username: 'Jean-Luc-Picard',
	token: '1701-D',
	repo: 'Enterprise',
	message: 'Make it so...',
	sort: true,
	workflow: true,
	version: true,
};
