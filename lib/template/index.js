import 'es6-promise/auto'
import Vue from 'vue'
import App from '@@@/App'
import store from '@/entries/<%= entryName%>/store/index'
import storeFactory from '@@@/storeFactory'
// import router from './router'

new Vue({
  el: '#her',
  // router,
  store: storeFactory(store),
  render: h => h(App)
})