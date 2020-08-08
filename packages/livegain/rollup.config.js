import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import omt from "@surma/rollup-plugin-off-main-thread";
import builtins from "rollup-plugin-node-builtins";

const common = {

    output: [
        {
            // sourcemap: true,
            chunkFileNames: "[name].js",
            dir: "./dist/",
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
    input: "./src/LiveGainModule.tsx"
};
const oscilloscope = {
    ...common,
    input: "./src/OscilloscopeModule.tsx"
};
const spectroscope = {
    ...common,
    input: "./src/SpectroscopeModule.tsx",
    onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === "EVAL") return;
        warn(warning);
    }
};
const spectrogram = {
    ...common,
    input: "./src/SpectrogramModule.tsx",
    onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === "EVAL") return;
        warn(warning);
    }
};
export default [liveGain, oscilloscope, spectroscope, spectrogram];
