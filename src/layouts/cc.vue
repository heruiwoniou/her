<template>
  <div class="layout-c">
    <cs-logo></cs-logo>
    <h1>这里是layout-c</h1>
    <ul>
      <li>
        <router-link to="/">index</router-link>
      </li>
      <li>
        <router-link to="/about">about</router-link>
      </li>
      <li>
        <router-link to="/classes">classes</router-link>
      </li>
      <li>
        <router-link to="/news">news</router-link>
      </li>
    </ul>
    <page-content></page-content> 
  </div>
</template>
<script>
import Logo from "~/components/logo.vue";

export default {
  components: {
    csLogo: Logo
  }
};
</script>
<style>
.layout-c ul {
  background: red;
}
</style>


