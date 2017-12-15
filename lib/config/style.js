// import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { join } from 'path'

export default function styleLoader(baseOption, ext, loaders = [], isVueLoader = false) {
  // Normalize loaders
  loaders = (Array.isArray(loaders) ? loaders : [loaders]).map(loader => {
    if (typeof loader === 'string') {
      loader = { loader }
    }
    return Object.assign({
      options: {
        sourceMap: baseOption.dev
      }
    }, loader)
  })

  // https://github.com/postcss/postcss-loader
  let postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: baseOption.dev
    }
  }

  // https://github.com/webpack-contrib/css-loader
  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: !baseOption.dev,
      importLoaders: 1,
      sourceMap: baseOption.dev,
      alias: {
        '/assets': join(baseOption.srcDir, 'assets')
      }
    }
  }

  // https://github.com/vuejs/vue-style-loader
  const vueStyleLoader = {
    loader: 'vue-style-loader',
    options: {
      sourceMap: baseOption.dev
    }
  }

  // if (!baseOption.dev) {
  //   return ExtractTextPlugin.extract({
  //     fallback: vueStyleLoader,
  //     use: [
  //       cssLoader,
  //       postcssLoader,
  //       ...loaders
  //     ].filter(l => l)
  //   })
  // }

  // https://github.com/yenshih/style-resources-loader
  // let styleResourcesLoader
  // if (this.options.build.styleResources) {
  //   styleResourcesLoader = {
  //     loader: 'style-resources-loader',
  //     options: this.options.build.styleResources
  //   }
  // }

  return [
    vueStyleLoader,
    cssLoader,
    postcssLoader,
    ...loaders
    // styleResourcesLoader
  ].filter(l => l)
}
