import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import omt from "@surma/rollup-plugin-off-main-thread";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";

const common = {

    output: [
        {
            sourcemap: true,
            chunkFileNames: "[name].js",
            dir: "./dist/",
            format: "es"
        }
    ],

    plugins: [
        copy({
            targets: [
                { src: "src/descriptor.json", dest: "dist/" }
            ]
        }),
        babel({
            exclude: /node_modules/,
            runtimeHelpers: true,
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        }),
        resolve({
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
        terser()
    ]
};
const plugin = {
    ...common,
    input: "./src/index.ts"
};
const gui = {
    ...common,
    input: "./src/gui.tsx"
};
export default [plugin, gui];
