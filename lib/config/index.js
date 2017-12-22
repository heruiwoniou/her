import { resolve, join } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import fromPairs from 'lodash/fromPairs'
import vueLoader from './loader'
import babel from './babel'
import styleLoader from './style'
import babelOption from './babel';
import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin'
import CompressionWebpackPlugin from 'compression-webpack-plugin'
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'

export default function (baseOption, builderOption) {
  return {
    devtool: process.env.NODE_ENV !== 'production' ? baseOption.dev ? 'cheap-module-eval-source-map' : '#source-map' : false,
    entry: fromPairs(builderOption.entries
      .map(({ entryName }) => {
        let src = resolve(builderOption.generateAppRoot, 'entries', entryName, 'index.js')
        src = baseOption.dev ? [resolve(__dirname, '../lib/config/client')].concat(src) : src
        return [entryName, src]
      })),
    output: {
      filename: baseOption.assetsPath + 'js/[name].js',
      chunkFilename: baseOption.assetsPath + 'js/[name].js',
      path: resolve(baseOption.rootDir, 'dist'),
      publicPath: '/'
    },
    performance: {
      maxEntrypointSize: 1000000,
      maxAssetSize: 300000,
      hints: baseOption.dev ? false : 'warning'
    },
    resolve: {
      extensions: ['.js', '.json', '.vue', '.ts'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '~': join(baseOption.srcDir),
        '@': join(baseOption.srcDir),
        '@@': join(baseOption.rootDir),
        '@@@': join(baseOption.rootDir, '.her'),
        'assets': join(baseOption.srcDir, 'assets')
      }
    },
    externals: baseOption.webpack.externals,
    module: {
      noParse: /es6-promise\.js$/,
      rules: [
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
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 1000, // 1KO
            name: baseOption.assetsPath + 'img/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 1000, // 1 KO
            name: baseOption.assetsPath + 'fonts/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(webm|mp4)$/,
          loader: 'file-loader',
          options: {
            name: baseOption.assetsPath + 'videos/[name].[hash:7].[ext]'
          }
        },
        ...baseOption.webpack.rules
      ]
    },
    plugins: [
      ...builderOption.entries.map(
        ({ entryName }, i) => {
          return new HtmlWebpackPlugin({
            filename: (baseOption.entry && baseOption.entry == entryName) || (!baseOption.entry && i == 0)
              ? 'index.html'
              : `${entryName}.html`,
            template: resolve(baseOption.srcDir, 'entries', entryName, 'index.html'),
            inject: true,
            chunksSortMode: 'dependency',
            minify: baseOption.dev ? {} : {
              removeComments: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true
            },
            chunks: [...(baseOption.dev ? [] : [
              'manifest', 'vendor'
            ]), entryName]
          })
        }),
      new LodashModuleReplacementPlugin(),
      ...baseOption.dev ? [new webpack.HotModuleReplacementPlugin()] : [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          },
          sourceMap: process.env.NODE_ENV !== 'production'
        }),
        new ExtractTextPlugin({
          filename: baseOption.assetsPath + 'css/[name].css'
        }),
        new OptimizeCSSPlugin({
          cssProcessorOptions: {
            safe: true
          }
        }),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: function (module) {
            // any required modules inside node_modules are extracted to vendor
            return (
              module.resource &&
              /\.js$/.test(module.resource) &&
              module.resource.indexOf(
                join(__dirname, '../node_modules')
              ) === 0
            )
          }
        }),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest',
          chunks: ['vendor']
        }),
        new CopyWebpackPlugin(baseOption.statics.map(s => ({
          from: resolve(baseOption.rootDir, s),
          to: s,
          ignore: ['.*']
        }))),
        ...(process.env.NODE_ENV == 'production' ? [
          new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp('\\.(js|css)$'),
            threshold: 10240,
            minRatio: 0.8
          })
        ] : [])
      ],
      ...baseOption.webpack.plugins
    ]
  }
}