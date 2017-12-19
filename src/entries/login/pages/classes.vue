<template>
  <div>
    <ul>
      <li>
        <router-link to="/classes/a">a</router-link>
      </li>
      <li>
        <router-link to="/classes/b">b</router-link>
      </li>
      <li>
        <router-link to="/classes/c">c</router-link>
      </li>
    </ul>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  layout: 'c'
}
</script>

