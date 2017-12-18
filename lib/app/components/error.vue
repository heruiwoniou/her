<template>
  <div class="her-error-page">
    <div class="error">
      <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="#DBE1EC" viewBox="0 0 48 48">
        <path d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z" />
      </svg>

      <div class="title">{{ message }}</div>
      <p class="description" v-if="statusCode === 404">
        <her-link class="error-link" to="/">Back to the home page</her-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "her-error",
  props: ["error"],
  
  computed: {
    statusCode() {
      return (this.error && this.error.statusCode) || 500;
    },
    message() {
      return this.error.message || "Error";
    }
  }
};
</script>

<style>
.her-error-page {
  padding: 1rem;
  background: #f7f8fb;
  color: #47494e;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: sans-serif;
  font-weight: 100 !important;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.her-error-page .error {
  max-width: 450px;
}
.her-error-page .title {
  font-size: 1.5rem;
  margin-top: 15px;
  color: #47494e;
  margin-bottom: 8px;
}
.her-error-page .description {
  color: #7f828b;
  line-height: 21px;
  margin-bottom: 10px;
}
.her-error-page a {
  color: #7f828b !important;
  text-decoration: none;
}
</style>
