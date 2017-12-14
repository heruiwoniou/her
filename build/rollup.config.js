import { resolve } from 'path'
import rollupBabel from 'rollup-plugin-babel'
import rollupAlias from 'rollup-plugin-alias'
import rollupCommonJS from 'rollup-plugin-commonjs'
import rollupReplace from 'rollup-plugin-replace'
import rollupNodeResolve from 'rollup-plugin-node-resolve'
import rollupJson from 'rollup-plugin-json'
import packageJson from '../package.json'

const dependencies = Object.keys(packageJson.dependencies)
const version = packageJson.version

export default {
  input: resolve('lib/index.js'),
  output: {
    file: resolve('release/index.js'),
    format: 'cjs',
    sourcemap: true
  },
  external: ['fs', 'path', 'http', 'connect']
    .concat(dependencies),
  name: 'Her',
  plugins: [
    rollupAlias({
      resolve: ['.js', '.json']
    }),

    rollupNodeResolve({ preferBuiltins: true }),

    rollupCommonJS(),

    rollupJson(),

    rollupBabel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
      presets: [
        [
          "env",
          {
            "modules": false
          }
        ]
      ],
      "plugins": [
        "transform-runtime",
        "external-helpers"
      ]
    }),
    rollupReplace({ __VERSION__: version })
  ]
}