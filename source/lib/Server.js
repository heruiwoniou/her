import express from 'express'
import chalk from 'chalk'
import Debug from 'debug'
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import connectHistoryApiFallback from 'connect-history-api-fallback'
import configFactory from './../config'

import path from 'path'

let debug = Debug('her:server')
debug.color = 5

export default class Server {

  constructor(her) {
    // connect对象
    this.app = null
    // 服务器实例
    this.server = null
    this.her = her
  }

  setupMiddlewares() {
    let config = configFactory(this.her.defaultOptions)
    const compiler = webpack(config);
    this.her.defaultOptions.server.middlewares.forEach(middleware => this.app.use(middleware))
    this.app.use(webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 2000
    }))
    this.app.use(connectHistoryApiFallback())
    this.app.use(webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
      quiet: true
    }))
    this.app.use('/static', express.static(path.join(this.her.defaultOptions.rootDir, './static')))
  }

  /**
   * 启动服务器
   * 
   * @memberof Her
   */
  listen() {
    return new Promise((resolve, reject) => {
      let { host, port } = this.her.defaultOptions.server
      this.app = express();
      this.setupMiddlewares()
      this.server = this.app.listen({ host, port, exclusive: false }, (err) => {
        if (err) {
          reject(err)
        }
        debug('server start')
        const _host = host === '0.0.0.0' ? 'localhost' : host
        console.log('\n' + chalk.bgGreen.black(' OPEN ') + chalk.green(` http://${_host}:${port}\n`))
        resolve()
      });
    })
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close(err => {
          debug('server closed')
          if (err) {
            return reject(err)
          }
          resolve()
        })
      } else {
        resolve()
      }
    })

  }
}