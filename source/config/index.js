const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
export default function (option) {
  return {
    entry: {
      app: path.resolve(option.rootDir, 'index.js'),
    },
    output: {
      filename: '[name].[hash].js',
      path: path.resolve(option.rootDir, 'dist'),
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.json', '.vue', '.ts']
    },
    module: {
      rules: [
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
      new HtmlWebpackPlugin({
        title: option.title || 'Output Management',
        template: path.resolve(option.rootDir, '.her/views/app.html')
      })
    ]
  }
}