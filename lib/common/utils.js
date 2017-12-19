import _ from 'lodash'
import { resolve, relative, sep } from 'path'

export const isWindows = /^win/.test(process.platform)

const reqSep = /\//g
const sysSep = _.escapeRegExp(sep)
const normalize = string => string.replace(reqSep, sysSep)

export function wp(p = '') {
  if (isWindows) {
    return p.replace(/\\/g, '\\\\')
  }
  return p
}

export async function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, (ms || 0)))
}

export function relativeTo() {
  let args = Array.prototype.slice.apply(arguments)
  let dir = args.shift()

  // Resolve path
  let path = r(...args)

  // Check if path is an alias
  if (path.indexOf('@') === 0 || path.indexOf('~') === 0) {
    return path
  }

  // Make correct relative path
  let rp = relative(dir, path)
  if (rp[0] !== '.') {
    rp = './' + rp
  }
  return wp(rp)
}


export function wChunk(p = '') {
  if (isWindows) {
    return p.replace(/\//g, '_')
  }
  return p
}


export function r() {
  let args = Array.prototype.slice.apply(arguments)
  let lastArg = _.last(args)

  if (lastArg.indexOf('@') === 0 || lastArg.indexOf('~') === 0) {
    return wp(lastArg)
  }

  return wp(resolve(...args.map(normalize)))
}

export function createRoutes(files, srcDir) {
  let routes = []
  files.forEach((file) => {
    let keys = file.replace(/^pages/, '').replace(/\.vue$/, '').replace(/\/{2,}/g, '/').split('/').slice(1)
    let route = { name: '', path: '', component: r(srcDir, file) }
    let parent = routes
    keys.forEach((key, i) => {
      route.name = route.name ? route.name + '-' + key.replace('_', '') : key.replace('_', '')
      route.name += (key === '_') ? 'all' : ''
      route.chunkName = file.replace(/\.vue$/, '')
      let child = _.find(parent, { name: route.name })
      if (child) {
        child.children = child.children || []
        parent = child.children
        route.path = ''
      } else {
        if (key === 'index' && (i + 1) === keys.length) {
          route.path += (i > 0 ? '' : '/')
        } else {
          route.path += '/' + (key === '_' ? '*' : key.replace('_', ':'))
          if (key !== '_' && key.indexOf('_') !== -1) {
            route.path += '?'
          }
        }
      }
    })
    // Order Routes path
    parent.push(route)
    parent.sort((a, b) => {
      if (!a.path.length || a.path === '/') {
        return -1
      }
      if (!b.path.length || b.path === '/') {
        return 1
      }
      let i = 0
      let res = 0
      let y = 0
      let z = 0
      const _a = a.path.split('/')
      const _b = b.path.split('/')
      for (i = 0; i < _a.length; i++) {
        if (res !== 0) {
          break
        }
        y = _a[i] === '*' ? 2 : (_a[i].indexOf(':') > -1 ? 1 : 0)
        z = _b[i] === '*' ? 2 : (_b[i].indexOf(':') > -1 ? 1 : 0)
        res = y - z
        // If a.length >= b.length
        if (i === _b.length - 1 && res === 0) {
          // change order if * found
          res = _a[i] === '*' ? -1 : 1
        }
      }
      return res === 0 ? (_a[i - 1] === '*' && _b[i] ? 1 : -1) : res
    })
  })
  return cleanChildrenRoutes(routes)
}

export function cleanChildrenRoutes(routes, isChild = false) {
  let start = -1
  let routesIndex = []
  routes.forEach((route) => {
    if (/-index$/.test(route.name) || route.name === 'index') {
      // Save indexOf 'index' key in name
      let res = route.name.split('-')
      let s = res.indexOf('index')
      start = (start === -1 || s < start) ? s : start
      routesIndex.push(res)
    }
  })
  routes.forEach((route) => {
    route.path = (isChild) ? route.path.replace('/', '') : route.path
    if (route.path.indexOf('?') > -1) {
      let names = route.name.split('-')
      let paths = route.path.split('/')
      if (!isChild) {
        paths.shift()
      } // clean first / for parents
      routesIndex.forEach((r) => {
        let i = r.indexOf('index') - start //  children names
        if (i < paths.length) {
          for (let a = 0; a <= i; a++) {
            if (a === i) {
              paths[a] = paths[a].replace('?', '')
            }
            if (a < i && names[a] !== r[a]) {
              break
            }
          }
        }
      })
      route.path = (isChild ? '' : '/') + paths.join('/')
    }
    route.name = route.name.replace(/-index$/, '')
    if (route.children) {
      if (route.children.find((child) => child.path === '')) {
        delete route.name
      }
      route.children = cleanChildrenRoutes(route.children, true)
    }
  })
  return routes
}

export function rmCache(path) {
  const mod = require.cache[path]
  delete require.cache[path]
  if (mod.parent && mod.parent.children) {
    for (let i = 0; i < mod.parent.children.length; i++) {
      if (mod.parent.children[i] === mod) {
        mod.parent.children.splice(i, 1)
        break
      }
    }
  }
}

export function sequence(tasks, fn) {
  return tasks.reduce((promise, task) => promise.then(() => fn(task)), Promise.resolve())
}