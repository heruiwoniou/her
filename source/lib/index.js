import defaultsDeep from 'lodash/defaultsDeep'
import path from 'path'

import Builder from './Builder'
import Server from './Server'

export default class Her {

  constructor(options) {
    // 服务器实例
    this.server = null

    // 构建实例
    this.builder = null

    // 设置参数
    this.setConfig(options)

    // 创建服务器对象
    this.server = new Server(this)

    // 创建构建对象
    this.builder = new Builder(this)
  }

  setConfig(options) {
    this.defaultOptions = defaultsDeep(options, {
      // TODO: 添加默认配置

      // 是否是开发模式
      dev: false,

      // 全局变量
      env: {},

      // 服务器配置
      server: {
        host: '0.0.0.0',
        port: '3000',
        middlewares: []
      },

      srcDir: '',
      rootDir: ''
    });
  }

  /**
   * 开启服务器
   * 
   * @memberof Her
   */
  async serverStart() {

    await this.builder.build()

    await this.server.listen()
  }

  /**
   * 停止服务器
   * 
   * @memberof Her
   */
  async serverStop() {
    await this.server.stop()
  }

  /**
   * 释放对象
   * 
   * @memberof Her
   */
  async destory() {
    await this.server.stop();
  }
}