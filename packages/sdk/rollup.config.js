// rollup.config.js
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';

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
			runtimeHelpers: true,
		}),
		builtins(),
		resolve({
			browser: true,
		}),
		commonjs(),
	],
};
export default [{
	input: './src',
	...commonConfig,
}, {
	input: './src/WamProcessor.js',
	...commonConfig,
}];
