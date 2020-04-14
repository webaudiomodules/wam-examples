// rollup.config.js
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
	input: './src',

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
			runtimeHelpers: true,
		}),
		resolve({
			browser: true,
		}),
		commonjs(),
		terser(),
	],
};
