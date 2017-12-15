import 'es6-promise/auto'
import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import App from '@@@/App'
import { flatMapComponents, sanitizeComponent } from '@@@/utils'

Vue.use(Vuex)
Vue.use(VueRouter)

let instance
export default function entryFactory(vueSetting) {

  let createApp = async function (option) {

    option.router = new VueRouter(option.router)
    option.store = new Vuex.Store(option.store)
    instance = new Vue(option)

    // 路同处理
    option.router.beforeEach(loadAsyncComponents)
    option.router.afterEach(normalizeComponents)
    option.router.afterEach(async function (to, from) {
      let layout = to.matched[0].components.default.options ? to.matched[0].components.default.options.layout : ''
      await instance.loadLayout(layout)
      instance.setLayout(layout)
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
    await Promise.all(flatMapComponents(to, (Component, _, match, key) => {
      // If component already resolved
      if (typeof Component !== 'function' || Component.options) {
        const _Component = sanitizeComponent(Component)
        match.components[key] = _Component
        return _Component
      }

      // Resolve component
      return Component().then(Component => {
        const _Component = sanitizeComponent(Component)
        match.components[key] = _Component
        return _Component
      })
    }))

    next()
  } catch (err) {
    // if (!err) err = {}
    // const statusCode = err.statusCode || err.status || (err.response && err.response.status) || 500
    // this.error({ statusCode, message: err.message })
    throw err;
    next(false)
  }
}


function normalizeComponents (to, ___) {
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
