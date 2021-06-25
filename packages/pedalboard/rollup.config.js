import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import html from '@rollup/plugin-html';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import url from '@rollup/plugin-url';

const common = {
	output: [
		{
			// sourcemap: true,
			chunkFileNames: '[name].js',
			dir: './dist/',
			format: 'es',
		},
	],
	plugins: [
		json(),
		url(),
		copy({
			targets: [
				{ src: 'src/descriptor.json', dest: 'dist/' },
				{ src: 'src/screenshot.png', dest: 'dist/' },
				{ src: 'repository/pedals.json', dest: 'dist/' },
				{ src: 'repository/patches.json', dest: 'dist/' },
			],
		}),
		postcss({
			extract: false,
			use: ['sass'],
			modules: true,
		}),
		babel({
			babelHelpers: 'bundled',
			exclude: /node_modules/,
		}),
		resolve({
			browser: true,
		}),
		commonjs(),
		html(),
		replace({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			preventAssignment: true,
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
