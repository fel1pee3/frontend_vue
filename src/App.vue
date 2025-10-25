<template>
  <div id="app">
    <!-- Header da aplicação -->
    <header class="bg-primary text-white py-3 mb-4">
      <div class="container">
        <h1 class="mb-0">
          <i class="fas fa-graduation-cap me-2"></i>
          Frontend Vue.js - Aula 03
        </h1>
        <p class="mb-0 opacity-75">Consumindo APIs</p>
      </div>
    </header>

    <!-- Conteúdo principal -->
    <div class="container">
      <TestarConexao />
      <hr>
      <BuscarDados />
      <hr>
      <CRUDProdutos />
    </div>

    <!-- Footer -->
    <footer class="bg-light text-center py-3 mt-5">
      <div class="container">
        <p class="text-muted mb-0">
          Curso Vue.js - Prof. Rodrigo | 
          <a href="https://vuejs.org/" target="_blank" class="text-decoration-none">
            Documentação Vue.js
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import TestarConexao from './components/TestarConexao.vue'
import BuscarDados from './components/BuscarDados.vue'
import CRUDProdutos from './components/CRUDProdutos.vue'

export default {
  name: 'App',
  components: {
    TestarConexao,
    BuscarDados,
    CRUDProdutos
  }
}
</script>

<style>
/* Estilos globais da aplicação */
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

/* Animações suaves */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Estilos customizados */
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: none;
}

.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
</style>
