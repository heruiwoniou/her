import express from 'express'
import chalk from 'chalk'
import Debug from 'debug'
import webpack from 'webpack';
import opn from 'opn'
import pify from 'pify'
import MFS from 'memory-fs'
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import connectHistoryApiFallback from 'connect-history-api-fallback'
import configFactory from './../config'
import { writeFile } from 'fs-extra'
import { r, sequence, waitFor } from '../common/utils'
import _ from 'lodash'
import chokidar from 'chokidar'

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

    this.webpackDevMiddleware = null
    this.webpackHotMiddleware = null
    this.compilersWatching = []
    this.webpackStats = her.defaultOptions.dev ? false : {
      chunks: false,
      children: false,
      modules: false,
      colors: true,
      excludeAssets: [
        /.map$/,
        /index\..+\.html$/
      ]
    }
  }

  async buildWebpack() {
    // Initialize shared FS and Cache
    const sharedFS = this.her.defaultOptions.dev && new MFS()
    const sharedCache = {}
    this.webpackConfig = configFactory(this.her.defaultOptions, this.her.builder);
    // Initialize compilers

    this.compilers = [this.webpackConfig].map(compilersOption => {
      const compiler = webpack(compilersOption)
      // In dev, write files in memory FS (except for DLL)
      if (sharedFS) {
        compiler.outputFileSystem = sharedFS
      }
      compiler.cache = sharedCache
      return compiler
    })

    await Promise.all(this.compilers.map(compiler => {
      const name = compiler.options.name
      // --- Dev Build ---
      if (this.her.defaultOptions.dev) {
        return this.webpackDev(compiler)
      }
      // --- Production Build ---
      return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          /* istanbul ignore if */
          if (err) {
            throw err
          }

          // Show build stats for production
          console.log(stats.toString(this.webpackStats)) // eslint-disable-line no-console

          /* istanbul ignore if */
          if (stats.hasErrors()) {
            throw new Error('Webpack build exited with errors')
          }
          resolve()
        })
      })

    }))

  }

  webpackDev(compiler) {
    return new Promise((resolve, reject) => {
      debug('Adding Webpack Middleware...')
      this.webpackDevMiddleware = pify(webpackDevMiddleware(compiler, {
        publicPath: this.webpackConfig.output.publicPath,
        // // stats: this.webpackStats,
        // noInfo: false,
        // quiet: false,
        watchOptions: []
      }))
      this.webpackDevMiddleware.close = pify(this.webpackDevMiddleware.close)

      this.webpackHotMiddleware = pify(webpackHotMiddleware(compiler, {
        log: false,
        heartbeat: 10000
      }))
      this.watchFiles()
      resolve()
    })
  }



  watchFiles() {
    debug('Adding Watcher')
    const src = this.her.defaultOptions.srcDir
    const patterns = [
      r(src, 'layouts'),
      r(src, 'entries'),
      r(src, 'components'),
      r(src, 'layouts/*.vue'),
      r(src, 'layouts/**/*.vue')
    ]
    this.her.builder.entries.forEach(({ entryName }) => {
      patterns.push(
        r(src, entryName),
        r(src, entryName + '/pages'),
        r(src, entryName + '/pages/*.vue'),
        r(src, entryName + '/pages/**/*.vue')
      )
    })

    const options = {
      ignoreInitial: true
    }
    /* istanbul ignore next */
    const refreshFiles = _.debounce(async () => {
      // console.log(1)
      await this.her.builder.build()
    }, 200)

    // Watch for src Files
    this.filesWatcher = chokidar.watch(patterns, options)
      .on('add', refreshFiles)
      .on('unlink', refreshFiles)

  }


  async unwatch() {
    if (this.filesWatcher) {
      this.filesWatcher.close()
    }

    if (this.customFilesWatcher) {
      this.customFilesWatcher.close()
    }

    this.compilersWatching.forEach(watching => watching.close())

    // Stop webpack middleware
    await this.webpackDevMiddleware.close()
  }


  setupMiddlewares() {
    debug('Setuping Middlewares...')
    this.her.defaultOptions.server.middlewares.forEach(middleware => this.app.use(middleware))
    this.app.use(this.webpackHotMiddleware)
    this.app.use(connectHistoryApiFallback())
    this.app.use(this.webpackDevMiddleware)
    this.her.defaultOptions.statics.forEach(dir => {
      this.app.use(`/${dir}`, express.static(path.join(this.her.defaultOptions.rootDir, `./${dir}`)))
    })
    return new Promise((resolve, reject) => {
      this.webpackDevMiddleware.waitUntilValid(resolve)
    })
  }

  /**
   * 启动服务器
   * 
   * @memberof Her
   */
  async ready() {
    this.app = express();
    await this.buildWebpack()
    await this.setupMiddlewares()
  }

  listen(isFirst) {
    return new Promise((resolve, reject) => {
      let { host, port } = this.her.defaultOptions.server
      this.server = this.app.listen({ host, port, exclusive: false }, (err) => {
        if (err) {
          reject(err)
        }
        debug('Server Started')
        const _host = host === '0.0.0.0' ? 'localhost' : host
        console.log('\n' + chalk.bgGreen.black(' OPEN ') + chalk.green(` http://${_host}:${port}\n`))
        if (isFirst) {
          opn(`http://${_host}:${port}`)
        }
        resolve()
      });
    })
  }

  stop() {
    return new Promise(async (resolve, reject) => {
      if (this.server) {
        debug('Server Stoping...')
        await this.unwatch()
        this.server.close(err => {
          debug('Server Closed')
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