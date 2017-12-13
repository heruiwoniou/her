export default function babelOption(baseOption) {
  return {
    babelrc: false,
    cacheDirectory: baseOption.dev,
    presets: [
      [
        'vue-app',
        {
          targets: { ie: 9, uglify: true },
          useBuiltIns: true
        }
      ]
    ]
  }
}