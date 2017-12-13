<template>
  <div id="her">
    Hello this is App.vue
  </div>
</template>
<script>
let a = function() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(10000), 5000);
  });
};
export default {
  data() {
    return {};
  },
  async mounted() {
    let c = await a();
    console.log(c);
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