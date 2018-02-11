import { resolve } from "path";
import rollupBabel from "rollup-plugin-babel";
import rollupAlias from "rollup-plugin-alias";
import rollupCommonJS from "rollup-plugin-commonjs";
import rollupReplace from "rollup-plugin-replace";
import rollupNodeResolve from "rollup-plugin-node-resolve";
import rollupJson from "rollup-plugin-json";
import packageJson from "../package.json";
import defaultsDeep from "lodash/defaultsDeep";

const dependencies = Object.keys(packageJson.dependencies);
const version = packageJson.version;

let setting = {
  input: resolve("lib/index.js"),
  output: {
    file: resolve("release/index.js"),
    format: "cjs",
    sourcemap: true
  },
  external: [
    "fs",
    "path",
    "http",
    "connect",
    "url",
    "crypto",
    "buffer",
    "stream",
    "constants",
    "util",
    "assert",
    "zlib"
  ].concat(dependencies),
  name: "Her",
  plugins: [
    rollupAlias({
      resolve: [".js", ".json"]
    }),

    rollupNodeResolve({ preferBuiltins: true }),

    rollupCommonJS(),

    rollupJson(),

    rollupBabel({
      exclude: "node_modules/**",
      runtimeHelpers: true,
      presets: [
        [
          "env",
          {
            modules: false
          }
        ]
      ],
      plugins: ["transform-runtime", "external-helpers"]
    }),
    rollupReplace({ __VERSION__: version })
  ]
};

export default [
  resolve("release/index.js"),
  "D:/Program/Git/moral-education-vue/node_modules/vue-her/release/index.js",
  "D:/Program/Git/panda/patriarch-vue/node_modules/vue-her/release/index.js"
].map(file => {
  let res = defaultsDeep({}, setting);
  res.output.file = file;
  return res;
});
