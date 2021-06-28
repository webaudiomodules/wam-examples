/** @type {import('@babel/core').TransformOptions} */
module.exports = {
	presets: [
		['@babel/preset-env', { targets: { node: '14', chrome: '63', firefox: '67' } }],
		'@babel/preset-typescript',
	],
	plugins: [
		['@babel/plugin-proposal-class-properties'],
	],
};
