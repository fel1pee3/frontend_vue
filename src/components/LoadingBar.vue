<template>
  <div v-if="isLoading" style="position: fixed; top: 0; left: 0; height: 3px; background: #007bff; width: 100%; z-index: 1000; transition: width 0.3s;"></div>
</template>

<script>
export default {
  name: 'LoadingBar',
  data() {
    return {
      isLoading: false
    }
  },
  created() {
    this.$router.beforeEach((to, from, next) => {
      this.isLoading = true
      next()
    })
    
    this.$router.afterEach(() => {
      setTimeout(() => {
        this.isLoading = false
      }, 300)
    })
  }
}
</script>
