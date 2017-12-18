<template>
  <error v-if="this.$root.err" :error="this.$root.err"></error>
  <router-view v-else></router-view>
</template>
<script>
import Error from "./error";

export default {
  components: {
    Error
  }
};
</script>
