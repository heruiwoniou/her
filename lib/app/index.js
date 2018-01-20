import store from '@/entries/<%= entryName%>/store/index'
import router from './router'
import entryFactory from '@@@/entryFactory'
import App from '@@@/App.vue'
import mixin from '@/entries/<%= entryName%>/index'

App.mixins = [mixin]

entryFactory({
  router,
  store,
  ...App
})