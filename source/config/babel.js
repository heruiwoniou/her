export default function babelOption(baseOption) {
  return {
    babelrc: false,
    cacheDirectory: baseOption.dev,
    presets: [
      [
        require('babel-preset-vue-app'),
        {
          targets: { ie: 9, uglify: true }
        }
      ]
    ]
  }
}