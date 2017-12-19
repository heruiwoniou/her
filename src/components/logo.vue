<template>
  <div class="logo">
    <img src="~/assets/logo.png" alt="">
    <cs-a></cs-a>
  </div>
</template>
<script>
import a from "~/components/a";
export default {
  components: {
    csA: a
  }
};
</script>
<style>
.logo {
  background: url("~/assets/logo.png") no-repeat right;
}
</style>








