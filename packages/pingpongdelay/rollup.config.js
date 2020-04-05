// rollup.config.js
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import html from 'rollup-plugin-html';

export default {
	input: './src/index.js',

	output: [
		{
			sourcemap: true,
			file: './dist/index.js',
			format: 'es',
		},
	],

	plugins: [
		postcss({
			extract: false,
			use: ['sass'],
		}),
		babel({
			exclude: 'node_modules/**',
			runtimeHelpers: true,
		}),
		resolve(),
		commonjs(),
		html(),
	],
};
