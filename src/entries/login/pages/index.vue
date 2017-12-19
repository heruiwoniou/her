<template>
  <h1>login-index-{{ cache }} --测试</h1>
</template>
<script>
import { mapState } from "vuex";
export default {
  layout: 'c',
  computed: mapState(['cache'])
};
</script>
