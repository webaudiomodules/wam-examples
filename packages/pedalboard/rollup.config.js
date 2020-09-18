// rollup.config.js
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import html from 'rollup-plugin-html';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';

const common = {
	output: [
		{
			sourcemap: true,
			chunkFileNames: '[name].js',
			dir: './dist/',
			format: 'es',
		},
	],
	plugins: [
		postcss({
			extract: false,
			use: ['sass'],
			modules: true,
		}),
		babel({
			exclude: 'node_modules/**',
			runtimeHelpers: true,
		}),
		resolve({
			browser: true,
		}),
		commonjs(),
		html(),
		terser(),
		replace({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
		}),
	],
};

const plugin = {
	...common,
	input: './src',
};

export default [
	plugin,
];
