import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-import-css';
import html from 'rollup-plugin-html';
import copy from 'rollup-plugin-copy';
import url from '@rollup/plugin-url';

/** @type {import('rollup').InputOptions} */
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
		url({
			fileName: '[dirname][name][extname]',
			limit: 0,
		}),
		copy({
			targets: [
				{ src: 'src/descriptor.json', dest: 'dist/' },
				{ src: 'src/screenshot.png', dest: 'dist/' },
			],
		}),
		babel({
			exclude: /node_modules/,
			babelHelpers: 'bundled',
		}),
		resolve({
			browser: true,
		}),
		commonjs(),
		css(),
		html(),
	],
	onwarn(warning, warn) {
		// suppress eval warnings
		if (warning.code === 'EVAL') return;
		warn(warning);
	}
};

const plugin = {
	...common,
	input: './src',
};
/*
const gui = {
	...common,
	input: './src/Gui',
	output: [{
		...common.output[0],
		dir: './dist/Gui',
	}],
};
*/
export default [
	plugin,
	// gui,
];
