<template>
  <div id="app">
    <LoadingBar />
    
    <header class="bg-primary text-white py-3 mb-4">
      <div class="container">
        <h1 class="mb-0">Aula 04 - Blog com Vue Router</h1>
      </div>
    </header>

    <div class="container">
      <Breadcrumbs />
      <router-view />
    </div>
  </div>
</template>

<script>
import Breadcrumbs from './components/Breadcrumbs.vue'
import LoadingBar from './components/LoadingBar.vue'

export default {
  name: 'App',
  components: {
    Breadcrumbs,
    LoadingBar
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}

.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
</style>
