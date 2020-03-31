module.exports = {
	devtool: 'source-map',
	entry: './src/index.js',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
		],
	},
	output: {
		filename: 'rack.js',
		library: 'pluginRack',
	},
};
