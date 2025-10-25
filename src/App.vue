<template>
  <div id="app">
    <header class="bg-primary text-white py-3 mb-4">
      <div class="container">
        <h1 class="mb-0">Aula 6 - CRUD com Auditoria</h1>
        <nav class="mt-2">
          <router-link to="/" class="text-white me-3">Home</router-link>
          <router-link to="/produtos" class="text-white me-3">Produtos</router-link>
          <router-link to="/auditoria" class="text-white">Auditoria</router-link>
        </nav>
      </div>
    </header>

    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  min-height: 100vh;
}

a {
  text-decoration: none;
  color: white;
  cursor: pointer;
}

a:hover {
  text-decoration: underline;
}

.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.btn {
  cursor: pointer;
}

.form-control, .form-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: none;
}
</style>
