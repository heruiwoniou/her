import store from '@/entries/<%= entryName%>/store/index'
import router from './router'
import entryFactory from '@@@/entryFactory'
import App from '@@@/App.vue'
import '@/entries/<%= entryName%>/index'


entryFactory({
  router,
  store,
  ...App
})