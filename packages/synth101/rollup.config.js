import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import omt from "@surma/rollup-plugin-off-main-thread";
import builtins from "rollup-plugin-node-builtins";
import copy from 'rollup-plugin-copy';

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
            runtimeHelpers: false,
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        }),
        resolve({
            preferBuiltins: false,
            browser: true,
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        }),
        commonjs({
            include: /node_modules/,
            namedExports: {
                "node_modules/preact/dist/preact.js": ["h", "Component", "render"],
            }
        }),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production")
        }),
        omt(),
        builtins()
        // terser()
    ]
};
const synth101 = {
    ...common,
    input: "./src/index.tsx",
    output: [{ ...common.output[0], dir: "./dist" }],
    plugins: [...common.plugins, copy({ targets: [{ src: "./src/descriptor.json", dest: "./dist" }] })]
};

export default [synth101];
