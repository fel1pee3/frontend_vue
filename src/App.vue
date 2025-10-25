<template>
  <div id="app">
    <header class="bg-primary text-white py-3 mb-4">
      <div class="container">
        <h1 class="mb-0">Frontend Vue.js - Aula 05</h1>
        <p class="mb-0 opacity-75">Formulários, Validação, Filtros e Wizard</p>
      </div>
    </header>

    <nav style="background: #f8f9fa; padding: 15px; margin-bottom: 20px;">
      <div class="container">
        <router-link to="/" style="margin-right: 15px;">Home</router-link>
        <router-link to="/cadastro" style="margin-right: 15px;">Cadastro Multi-Componente</router-link>
        <router-link to="/pesquisa" style="margin-right: 15px;">Busca e Filtros</router-link>
        <router-link to="/wizard">Wizard Multi-Etapas</router-link>
      </div>
    </nav>

    <div class="container">
      <router-view />
    </div>

    <footer class="bg-light text-center py-3 mt-5">
      <div class="container">
        <p class="text-muted mb-0">Curso Vue.js - Aula 05 | Formulários e Validação</p>
      </div>
    </footer>
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
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}

.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white;
}

.bg-light {
  background: #f8f9fa !important;
}

.text-white {
  color: white;
}

.text-muted {
  color: #6c757d;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
