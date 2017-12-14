<template>
  <div id="her" c='1'>
    <component v-if="layout" :is="layout"></component>
  </div>
</template>
<script>

let layouts = {
<%
var layoutsKeys = Object.keys(layouts);
layoutsKeys.forEach(function (key, i) { %>
  "_<%= key %>": () => import('<%= layouts[key] %>'  /* webpackChunkName: "<%= wChunk('layouts/'+key) %>" */).then(m => m.default || m)<%= (i + 1) < layoutsKeys.length ? ',' : '' %>
<% }) %>
}


let resolvedLayouts = {}
export default {
  data: () => ({
    layout: null,
    layoutName: ""
  }),
  methods: {
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