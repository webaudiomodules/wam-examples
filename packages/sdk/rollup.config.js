import babel from '@rollup/plugin-babel';

const commonConfig = {
	output: [
		{
			sourcemap: true,
			chunkFileNames: '[name].js',
			dir: './esm/',
			format: 'es',
		},
	],

	plugins: [
		babel({
			exclude: 'node_modules/**',
			babelHelpers: 'bundled',
		})
	],
};
export default [{
	input: './src/index.js',
	...commonConfig,
}];
