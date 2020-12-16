const airbnbBaseImports = require('eslint-config-airbnb-base/rules/imports');
const airbnbBaseStyle = require('eslint-config-airbnb-base/rules/style');

const airbnbNoExtraneousDependenciesRule = airbnbBaseImports.rules['import/no-extraneous-dependencies'];
const airbnbNoUnderscoreDangleRule = airbnbBaseStyle.rules['no-underscore-dangle'];

const noExtraneousDependenciesRule = [
	airbnbNoExtraneousDependenciesRule[0],
	{
		...airbnbNoExtraneousDependenciesRule[1],
		devDependencies: [
			...airbnbNoExtraneousDependenciesRule[1].devDependencies,
			'**/*{.,_}stories.{js,jsx}',
			'scripts/*',
		],
	},
];

const noUnderscoreDangleRule = [
	airbnbNoUnderscoreDangleRule[0],
	{
		...airbnbNoUnderscoreDangleRule[1],
		allow: [
			...airbnbNoUnderscoreDangleRule[1].allow,
			'_id',
		],
	},
];

module.exports = {
	env: {
		browser: true,
	},
	extends: [
		'53js/react',
		'plugin:jest/recommended',
	],
	rules: {
		'react/jsx-one-expression-per-line': 0, // Buggy
		'import/no-extraneous-dependencies': noExtraneousDependenciesRule,
		'no-redeclare': 'off',
		'no-underscore-dangle': noUnderscoreDangleRule,
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				args: 'none',
				ignoreRestSiblings: true,
			},
		],
		'import/extensions': ['error', 'always', { pattern: { ts: 'never' } }],
	},
	settings: {
		'import/resolver': {
			node: {
				extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.d.ts'],
			},
		},
	},
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
};
