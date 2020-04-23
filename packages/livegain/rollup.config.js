import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import omt from "@surma/rollup-plugin-off-main-thread";
import { terser } from "rollup-plugin-terser";

export default {
    input: "./src/index.ts",

    output: [
        {
            sourcemap: true,
            chunkFileNames: "[name].js",
            dir: "./dist/",
            format: "es"
        }
    ],

    plugins: [
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
