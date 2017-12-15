import babel from './babel'
import styleLoader from './style'
import babelOption from './babel';

export default function vueLoader(baseOption, builderOption) {
  return {
    // postcss: true,
    extractCSS: !baseOption.dev,
    cssSourceMap: baseOption.dev,
    preserveWhitespace: false,
    hotReload: babelOption.dev,
    loaders: {
      'js': {
        loader: 'babel-loader',
        options: babel(baseOption)
      },
      // Note: do not nest the `postcss` option under `loaders`
      'css': styleLoader(baseOption, 'css', [], true),
      'less': styleLoader(baseOption, 'less', 'less-loader', true),
      'scss': styleLoader(baseOption, 'scss', 'sass-loader', true),
      'sass': styleLoader(baseOption, 'sass', { loader: 'sass-loader', options: { indentedSyntax: true } }, true),
      'stylus': styleLoader(baseOption, 'stylus', 'stylus-loader', true),
      'styl': styleLoader(baseOption, 'stylus', 'stylus-loader', true)
    },
    template: {
      doctype: 'html' // For pug, see https://github.com/vuejs/vue-loader/issues/55
    },
    transformToRequire: {
      video: 'src',
      source: 'src',
      object: 'src',
      img: 'src',
      image: 'xlink:href'
    }
  }
}