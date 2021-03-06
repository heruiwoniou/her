import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { join } from 'path'
import defaultsDeep from 'lodash/defaultsDeep'

export default function styleLoader(baseOption, ext, loaders = [], isVueLoader = false) {
  // Normalize loaders
  loaders = (Array.isArray(loaders) ? loaders : [loaders]).map(loader => {
    let options = baseOption.webpack.styleLoader[loader.loader || loader] || {}
    if (typeof loader === 'string') {
      loader = { loader }
    }
    let res = defaultsDeep(loader, { options }, {
      options: {
        sourceMap: process.env.NODE_ENV !== 'production',
      }
    })
    return res
  })

  // https://github.com/postcss/postcss-loader
  let postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: process.env.NODE_ENV !== 'production',
    }
  }

  // https://github.com/webpack-contrib/css-loader
  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: !baseOption.dev,
      importLoaders: 1,
      sourceMap: process.env.NODE_ENV !== 'production',
      alias: {
        '/assets': join(baseOption.srcDir, 'assets')
      }
    }
  }

  // https://github.com/vuejs/vue-style-loader
  const vueStyleLoader = {
    loader: 'vue-style-loader',
    options: {
      sourceMap: process.env.NODE_ENV !== 'production'
    }
  }

  if (!baseOption.dev) {
    return ExtractTextPlugin.extract({
      fallback: vueStyleLoader,
      use: [
        cssLoader,
        postcssLoader,
        ...loaders
      ].filter(l => l)
    })
  }

  return [
    vueStyleLoader,
    cssLoader,
    postcssLoader,
    ...loaders
  ].filter(l => l)
}
