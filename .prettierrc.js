module.exports = {
	trailingComma: 'es5',
	tabWidth: 4,
	useTabs: true,
	singleQuote: true,
	proseWrap: 'preserve',
	overrides: [
		{
			files: ['**/*.{yml,yaml,yml.config}'],
			options: {
				useTabs: false,
				singleQuote: false,
				semi: false,
				quoteProps: 'preserve',
				trailingComma: 'none',
				parser: 'yaml',
				tabWidth: 2,
			}
		  },
	],
};
