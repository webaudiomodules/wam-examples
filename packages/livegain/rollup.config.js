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
                "node_modules/react/index.js": ["Component", "PureComponent", "Fragment", "Children", "createElement", "createRef"],
                "node_modules/react-dom/index.js": ["render"],
                "../../node_modules/react/index.js": ["Component", "PureComponent", "Fragment", "Children", "createElement", "createRef"],
                "../../node_modules/react-dom/index.js": ["render"]
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
const liveGain = {
    ...common,
    input: "./src/livegain/index.tsx",
    output: [{ ...common.output[0], dir: "./dist/livegain" }],
    plugins: [...common.plugins, copy({ targets: [{ src: "./src/livegain/descriptor.json", dest: "./dist/livegain" }] })]
};
const oscilloscope = {
    ...common,
    input: "./src/oscilloscope/index.tsx",
    output: { ...common.output[0], dir: "./dist/oscilloscope" },
    plugins: [...common.plugins, copy({ targets: [{ src: "./src/oscilloscope/descriptor.json", dest: "./dist/oscilloscope" }] })]
};
const spectroscope = {
    ...common,
    input: "./src/spectroscope/index.tsx",
    output: { ...common.output[0], dir: "./dist/spectroscope" },
    plugins: [...common.plugins, copy({ targets: [{ src: "./src/spectroscope/descriptor.json", dest: "./dist/spectroscope" }] })],
    onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === "EVAL") return;
        warn(warning);
    }
};
const spectrogram = {
    ...common,
    input: "./src/spectrogram/index.tsx",
    output: { ...common.output[0], dir: "./dist/spectrogram" },
    plugins: [...common.plugins, copy({ targets: [{ src: "./src/spectrogram/descriptor.json", dest: "./dist/spectrogram" }] })],
    onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === "EVAL") return;
        warn(warning);
    }
};
export default [liveGain, oscilloscope, spectroscope, spectrogram];
