// rollup.config.js
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import html from 'rollup-plugin-html';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

const { NODE_ENV } = process.env;
const isProduction = NODE_ENV === 'production';

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
		copy({
			targets: [
				{ src: 'src/descriptor.json', dest: 'dist/' },
			],
		}),
		postcss({
			extract: false,
			use: ['sass'],
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
		isProduction && terser(),
	].filter(Boolean),
};

const plugin = {
	...common,
	input: './src',
};

const gui = {
	...common,
	input: './src/Gui',
	output: [{
		...common.output[0],
		dir: './dist/Gui',
	}],
};

export default [
	plugin,
	gui,
];
