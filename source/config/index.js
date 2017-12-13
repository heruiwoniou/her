import { resolve, join } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import fromPairs from 'lodash/fromPairs'
import vueLoader from './loader'
import babel from './babel'
import styleLoader from './style'

export default function (baseOption, builderOption) {
  return {
    devtool: baseOption.dev ? 'cheap-module-eval-source-map' : false,
    entry: fromPairs(
      builderOption.entries.map(
        ({ entryName }) => ([entryName, resolve(builderOption.generateAppRoot, 'entries', entryName, 'index.js')]))
    ),
    output: {
      filename: '[name].[hash].js',
      path: resolve(baseOption.rootDir, 'dist'),
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.json', '.vue', '.ts'],
      alias: {
        '@': join(baseOption.srcDir),
        '@@': join(baseOption.rootDir),
        '@@@': join(baseOption.rootDir, '.her')
      }
    },
    module: {
      noParse: /es6-promise\.js$/,
      rules: [
        // {
        //   test: /\.vue$/,
        //   loader: 'vue-loader'
        // },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: vueLoader(baseOption)
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: babel(baseOption)
        },
        { test: /\.css$/, use: styleLoader(baseOption, 'css') },
        { test: /\.less$/, use: styleLoader(baseOption, 'less', 'less-loader') },
        { test: /\.sass$/, use: styleLoader(baseOption, 'sass', { loader: 'sass-loader', options: { indentedSyntax: true } }) },
        { test: /\.scss$/, use: styleLoader(baseOption, 'scss', 'sass-loader') },
        { test: /\.styl(us)?$/, use: styleLoader(baseOption, 'stylus', 'stylus-loader') },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 1000, // 1KO
            name: 'img/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 1000, // 1 KO
            name: 'fonts/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(webm|mp4)$/,
          loader: 'file-loader',
          options: {
            name: 'videos/[name].[hash:7].[ext]'
          }
        }
      ]
    },
    plugins: [
      ...builderOption.entries.map(
        ({ entryName }, i) => new HtmlWebpackPlugin({
          filename: i == 0 ? 'index.html' : `${entryName}.html`,
          template: resolve(baseOption.srcDir, 'entries', entryName, 'index.html'),
          chunks: [entryName]
        }))
    ]
  }
}