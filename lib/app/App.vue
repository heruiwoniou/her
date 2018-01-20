<template>
  <div id="__her__">
    <loading ref="loading"></loading>
    <component v-if="layout" :is="layout"></component>
  </div>
</template>
<script>
import Loading from './components/loading'

let layouts = {
<%
var layoutsKeys = Object.keys(layouts);
layoutsKeys.forEach(function (key, i) { %>
  "_<%= key %>": () => import('<%= layouts[key] %>'  /* webpackChunkName: "<%= wChunk('layouts/'+key) %>" */).then(m => m.default || m)<%= (i + 1) < layoutsKeys.length ? ',' : '' %>
<% }) %>
}


let resolvedLayouts = {}
export default {
  components: {
    Loading
  },
  data: () => ({
    layout: null,
    layoutName: "",
    err: null,
    dateErr: null
  }),
  created(){
    window.__$vm__ = this;
  },
  mounted(){
    this.$loading = this.$refs.loading
  },
  watch: {
    'err': 'errorChanged'
  },
  methods: {
    error(err){
      err = err || null;
      if (typeof err === 'string') err = { statusCode: 500, message: err }
      this.dateErr = Date.now()
      this.err = err
      return err
    },
    errorChanged () {
      if (this.err && this.$loading) {
        if (this.$loading.fail) this.$loading.fail()
        if (this.$loading.finish) this.$loading.finish()
      }
    },
    setLayout(layout) {
      if (!layout || !resolvedLayouts["_" + layout]) layout = "default";
      this.layoutName = layout;
      let _layout = "_" + layout;
      this.layout = resolvedLayouts[_layout];
      return this.layout;
    },
    loadLayout(layout) {
      if (!layout || !(layouts["_" + layout] || resolvedLayouts["_" + layout]))
        layout = "default";
      let _layout = "_" + layout;
      if (resolvedLayouts[_layout]) {
        return Promise.resolve(resolvedLayouts[_layout]);
      }
      return layouts[_layout]()
        .then(Component => {
          resolvedLayouts[_layout] = Component;
          delete layouts[_layout];
          return resolvedLayouts[_layout];
        })
        .catch(e => {
          throw e;
        });
    }
  }
};
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
}
</style>