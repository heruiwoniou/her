import Vue from 'vue'

export function flatMapComponents(route, fn) {
  return Array.prototype.concat.apply([], route.matched.map(function (m, index) {
    return Object.keys(m.components).map(function (key) {
      return fn(m.components[key], m.instances[key], m, key, index)
    })
  }))
}

export function sanitizeComponent(Component) {
  if (!Component.options) {
    Component = Vue.extend(Component) // fix issue #6
    Component._Ctor = Component
  } else {
    Component._Ctor = Component
    Component.extendOptions = Component.options
  }
  console.log(Component.options)
  return Component
}