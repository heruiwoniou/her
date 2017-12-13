import Glob from 'glob';
import Debug from 'debug';
import pify from 'pify'
import fs, { remove, mkdirp, readFile, writeFile, existsSync, copy } from 'fs-extra'
import { join } from 'path'
import { createRoutes, r } from './../common/utils'
import template from 'lodash/template'

const debug = Debug('her:builder')
debug.color = 3
const glob = pify(Glob)

export default class Builder {
  constructor(her) {
    this.her = her
    // 入口
    this.entries = null
    // 路由
    this.routers = null

    // 模板文件夹
    this.templateRoot = join(__dirname, '../lib/template')
    // 目标文件夹
    this.generateAppRoot = join(this.her.defaultOptions.rootDir, '.her')
  }

  async build() {

    await remove(this.generateAppRoot)
    await mkdirp(this.generateAppRoot)

    // 拷贝
    await this.buildBaseFiles()

    // 入口
    await this.generateEntries()
    await this.buildEntries()

    await this.generateRouter()
  }

  async generateFileFromTpl(tpl, option, toDir) {
    let compiler = template(tpl)
    await writeFile(toDir, compiler(option), 'utf-8')
  }

  /**
   * 生成基础文件
   * 
   * @memberof Builder
   */
  async buildBaseFiles() {
    debug('Building Base Files...')
    await Promise.all([
      'App.vue',
      'storeFactory.js'
    ].map(async fileName => {
      await copy(
        join(this.templateRoot, fileName),
        join(this.generateAppRoot, fileName)
      )
    }))
  }

  /**
   * 获取入口
   * 
   * @memberof Builder
   */
  async generateEntries() {
    debug('Generating Entries...')
    const cwd = join(this.her.defaultOptions.srcDir, 'entries');
    if (!fs.existsSync(join(this.her.defaultOptions.srcDir, 'entries'))) {
      throw new Error(`No \`entries\` directory found in ${this.her.defaultOptions.srcDir}.`)
    }

    // 根据目录，获取路由对象
    const files = await glob('**/*.html', { cwd })
    if (files.length == 0) {
      throw new Error(`can not find entry file in \`entries\` directory.`)
    }
    this.entries = []
    await Promise.all(files.map(async file => {
      let entryName = file.slice(0, file.lastIndexOf('/'))
      let dir = join(cwd, entryName)
      this.entries.push({
        entryName,
        dir
      })
    }))
  }
  async buildEntries() {
    debug('Building Entry Files...')
    await Promise.all(this.entries.map(async ({ entryName, dir }) => {
      // 生成目录
      await mkdirp(join(this.generateAppRoot, 'entries', entryName))

      // 生成入口文件
      // 1. 读取模板
      let tpl = await readFile(join(this.templateRoot, 'index.js'), 'utf-8');
      // console.log(tpl)
      // 2. 生成文件
      await this.generateFileFromTpl(tpl, { entryName }, join(this.generateAppRoot, 'entries', entryName, 'index.js'))
    }))
  }
  /**
   * 生成路由信息
   * 
   * @memberof Builder
   */
  async generateRouter() {
    debug('Generating Routes...')
    this.routers = []
    await Promise.all(this.entries.map(async ({ entryName, dir }) => {
      let res = await glob('pages/**/*.vue', { cwd: dir })
      this.routers.push({
        entryName,
        router: createRoutes(res, dir)
      })
    }))
  }
}