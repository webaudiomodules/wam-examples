import babel from '@rollup/plugin-babel';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import builtins from "rollup-plugin-node-builtins";
import copy from 'rollup-plugin-copy';

/** @type {import('rollup').InputOptions} */
const common = {
    output: [
        {
            // sourcemap: true,
            chunkFileNames: "[name].js",
            format: "es"
        }
    ],

    plugins: [
        babel({
			exclude: /node_modules/,
			babelHelpers: 'bundled',
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        }),
        resolve({
            preferBuiltins: false,
            browser: true,
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        }),
        commonjs(),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
            preventAssignment: true
        }),
        builtins()
    ]
};
const synth101 = {
    ...common,
    input: "./src/index.tsx",
    output: [{ ...common.output[0], dir: "./dist" }],
    plugins: [...common.plugins, copy({ targets: [{ src: "./src/descriptor.json", dest: "./dist" }, { src: "./src/screenshot.png", dest: "./dist" }] })]
};

export default [synth101];
