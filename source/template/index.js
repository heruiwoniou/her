import Vue from 'vue'
import App from './.her/App'
import store from './entries/<%= entry %>/store/index'
import storeFactory from './../storeFactory'
import router from './router'

new Vue({
  el: '[her]',
  router,
  store: storeFactory(store),
  render: h => h(App)
})