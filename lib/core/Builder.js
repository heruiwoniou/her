import Glob from 'glob';
import Debug from 'debug';
import pify from 'pify'
import fs, { remove, mkdirp, readFile, writeFile, existsSync, copy } from 'fs-extra'
import { join, resolve } from 'path'
import { createRoutes, r, wChunk, relativeTo, wp, waitFor } from './../common/utils'
import hash from 'hash-sum'
import serialize from 'serialize-javascript'
import template from 'lodash/template'
import uniqBy from 'lodash/uniqBy'

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
    // 模板
    this.layouts = null

    // 模板文件夹
    this.templateRoot = join(__dirname, '../lib/app')
    // 目标文件夹
    this.generateAppRoot = join(this.her.defaultOptions.rootDir, '.her')

  }

  async build(isRoot) {
    if (isRoot) {
      await remove(this.generateAppRoot)
      await mkdirp(this.generateAppRoot)
      await mkdirp(join(this.generateAppRoot, 'components'))
      // 拷贝
      await this.buildBaseFiles()
    }

    // 入口
    await this.generateEntries()
    await this.buildEntries()

    // 路由
    await this.generateRouter()
    await this.buildRouter()

    // 模板
    await this.generateLayout()
    await this.buildLayout()
  }

  async checkKeepFiles() {
    debug('Checking Keep Files...')
    if (!existsSync(resolve(this.her.defaultOptions.rootDir, '.postcssrc.js'))) {
      await copy(
        resolve(__dirname, '../.postcssrc.js'),
        resolve(this.her.defaultOptions.rootDir, '.postcssrc.js')
      )
    }
  }

  /**
   * 生成基础文件
   * 
   * @memberof Builder
   */
  async buildBaseFiles() {
    debug('Building Base Files...')
    await Promise.all([
      'components/content.vue',
      'components/error.vue',
      'components/loading.vue',
      'entryFactory.js',
      'utils.js'
    ].map(async fileName => {
      // 生成入口文件
      // 1. 读取模板
      let tpl = await readFile(join(this.templateRoot, fileName), 'utf-8');

      // 2. 生成文件
      let compiler = template(tpl)
      await writeFile(join(this.generateAppRoot, fileName), compiler({ baseOption: this.her.defaultOptions }), 'utf-8')
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
    await Promise.all(files.map(file => {
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

      // 2. 生成文件
      let compiler = template(tpl)
      await writeFile(join(this.generateAppRoot, 'entries', entryName, 'index.js'), compiler({ entryName }), 'utf-8')
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

  /**
   * 生成路由文件
   * 
   * @memberof Builder
   */
  async buildRouter() {
    debug('Building Router files...')
    await Promise.all(this.routers.map(async ({ entryName, router }) => {

      // 生成路由文件
      // 1. 读取模板
      let tpl = await readFile(join(this.templateRoot, 'router.js'), 'utf-8');

      // 2. 生成文件
      let compiler = template(tpl, {
        imports: {
          serialize,
          hash,
          r,
          wp,
          wChunk,
          relativeToBuild: (...args) => relativeTo(join(this.generateAppRoot, 'entries', entryName), ...args)
        }
      })
      await writeFile(
        join(this.generateAppRoot, 'entries', entryName, 'router.js'),
        compiler(Object.assign({ entryName, router: { routes: router } }, {
          uniqBy
        })),
        'utf-8')
    }))
  }

  /**
   * 生成模板配置信息
   * 
   * @memberof Builder
   */
  async generateLayout() {
    debug('Generating Layouts...')
    this.layouts = {}
    if (existsSync(resolve(this.her.defaultOptions.srcDir, 'layouts'))) {
      let hasErrorLayout = false
      let relativeToBuild = (...args) => relativeTo(this.generateAppRoot, ...args)
      const layoutsFiles = await glob('layouts/**/*.vue', { cwd: this.her.defaultOptions.srcDir })
      layoutsFiles.forEach((file) => {
        let name = file.split('/').slice(1).join('/').replace(/\.vue$/, '')
        if (name === 'error') {
          hasErrorLayout = true
          return
        }
        this.layouts[name] = relativeToBuild(this.her.defaultOptions.srcDir, file)
      })
    }
  }

  async buildLayout() {
    debug('Building Layouts...')
    // 生成路由文件
    // 1. 读取模板
    let tpl = await readFile(join(this.templateRoot, 'App.vue'), 'utf-8');

    // 2. 生成文件
    let compiler = template(tpl, {
      imports: {
        serialize,
        hash,
        r,
        wp,
        wChunk
      }
    })
    await writeFile(
      join(this.generateAppRoot, 'App.vue'),
      compiler({ layouts: this.layouts }),
      'utf-8')
  }

}