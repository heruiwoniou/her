const { join } = require('path')
const { writeFile } = require('fs-extra')

module.exports = {
  server: {
    port: 3005
  },
  statics: [
    'static',
    'public'
  ],
  webpack: {
    styleLoader: {
      webpack: {
        styleLoader: {
        },
        externals: {},
        plugins: [],
        rules: []
      },
    },
    externals: {},
    plugins: [],
    rules: []
  },
  entry: 'login',
  assetsPath: '__comsys__/',
  assetslog: function (stats) {
    new Promise((resolve, reject) => {
      writeFile(join(this.rootDir, 'resource.txt'), stats, 'utf-8').then(resolve, reject)
    })
  }
}