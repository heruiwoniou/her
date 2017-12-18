import 'es6-promise/auto'
import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import App from '@@@/App'
import { flatMapComponents, sanitizeComponent } from '@@@/utils'
import Content from './components/content'


Vue.use(Vuex)
Vue.use(VueRouter)

Vue.component('page-content', Content)

let instance
export default function entryFactory(vueSetting, baseOption) {

  let createApp = async function (option) {

    option.router = new VueRouter(option.router)
    option.store = new Vuex.Store(option.store)
    instance = new Vue(option)

    // 路同处理
    option.router.beforeEach(loadAsyncComponents)
    option.router.beforeEach(render)
    option.router.afterEach(normalizeComponents)
    option.router.afterEach(async function (to, from) {
      let layout = to.matched[0].components.default.options ? to.matched[0].components.default.options.layout : ''
      await instance.loadLayout(layout)
      instance.setLayout(layout)
    })
    option.router.onError(function (err) {
      const statusCode = err.statusCode || err.status || (err.response && err.response.status) || 500
      instance.error({ statusCode, message: err.message })
    })

    return instance
  }
  let mountApp = function (ins) {
    instance.$mount('#__her__')
  }

  createApp(vueSetting).then(mountApp)
}


async function loadAsyncComponents(to, from, next) {
  try {
    await Promise.all(to.matched.map(async (m, index) => {
      try {
        await Promise.all(Object.keys(m.components).map(async key => {
          let Component = m.components[key];
          if (typeof Component !== 'function' || Component.options) {
            const _Component = sanitizeComponent(Component)
            m.components[key] = _Component
            return _Component
          }
          instance.$refs.loading.start()
          let asyncComponent = await Component()
          const _Component = sanitizeComponent(asyncComponent)
          m.components[key] = _Component
          return _Component
        }))
      } catch (err) {
        throw err;
      }
    }))
    next()
  } catch (err) {
    next(err)
  }
}

async function render(to, from, next) {
  try {
    if (instance.$refs.loading.finish) instance.$refs.loading.finish()
    next()
  } catch (err) {
    next(err)
  }
}

function normalizeComponents(to, ___) {
  flatMapComponents(to, (Component, _, match, key) => {
    if (typeof Component === 'object' && !Component.options) {
      // Updated via vue-router resolveAsyncComponents()
      Component = Vue.extend(Component)
      Component._Ctor = Component
      match.components[key] = Component
    }
    return Component
  })
}
