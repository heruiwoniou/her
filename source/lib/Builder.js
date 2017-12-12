import Glob from 'glob';
import Debug from 'debug';
import pify from 'pify'
import fs from 'fs-extra'
import { join } from 'path'
import { createRoutes } from './../common/utils'

const debug = Debug('her:builder')
debug.color = 7
const glob = pify(Glob)

export default class Builder {
  constructor(her) {
    this.her = her
    this.router = null
  }

  async build() {
    await this.generateRouter()
  }

  async generateRouter() {
    debug('Generating routes...')
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
      let entryRoot = join(cwd, file.slice(0, file.lastIndexOf('/')))
      let res = await glob('pages/**/*.vue', { cwd: entryRoot })
      this.entries.push(createRoutes(res, entryRoot))
    }))

  }

  builderFiles() {

  }

  builderComponents() {
  }
}