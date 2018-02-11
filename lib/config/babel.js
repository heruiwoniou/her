import defaultsDeep from 'lodash/defaultsDeep'
export default function babelOption(baseOption) {
  let ret = defaultsDeep(baseOption.webpack.babel, {
    babelrc: false,
    cacheDirectory: baseOption.dev,
    // plugins: ['lodash'],
    presets: [
      [
        'vue-app',
        {
          targets: { ie: 9, uglify: true },
          // useBuiltIns: true
        }
      ]
    ]
  })

  return ret
}