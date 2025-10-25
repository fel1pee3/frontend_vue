<template>
  <div id="app">
    <!-- Header da aplicação -->
    <header class="bg-primary text-white py-3 mb-4">
      <div class="container">
        <h1 class="mb-0">
          <i class="fas fa-graduation-cap me-2"></i>
          Frontend Vue.js - Aula 01
        </h1>
        <p class="mb-0 opacity-75">Exercícios: Contador e Lista de Tarefas</p>
      </div>
    </header>

    <!-- Conteúdo principal -->
    <div class="container">
      <div class="row">
        <!-- Exercício 1: Contador -->
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-calculator me-2"></i>
                Exercício 1: Contador
              </h5>
            </div>
            <div class="card-body">
              <Contador />
            </div>
          </div>
        </div>
        
        <!-- Exercício 2: Lista de Tarefas -->
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-list-check me-2"></i>
                Exercício 2: Lista de Tarefas
              </h5>
            </div>
            <div class="card-body">
              <ListaTarefas />
            </div>
          </div>
        </div>
      </div>

      <!-- Seção de informações -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-info-circle me-2"></i>
                Conceitos Implementados
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Exercício 1 - Contador:</h6>
                  <ul class="list-unstyled">
                    <li><i class="fas fa-check text-success me-2"></i>Data binding ({{ contador }})</li>
                    <li><i class="fas fa-check text-success me-2"></i>Event handling (@click)</li>
                    <li><i class="fas fa-check text-success me-2"></i>Conditional rendering (v-if)</li>
                    <li><i class="fas fa-check text-success me-2"></i>Computed properties</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6>Exercício 2 - Lista de Tarefas:</h6>
                  <ul class="list-unstyled">
                    <li><i class="fas fa-check text-success me-2"></i>Two-way data binding (v-model)</li>
                    <li><i class="fas fa-check text-success me-2"></i>List rendering (v-for)</li>
                    <li><i class="fas fa-check text-success me-2"></i>Event modifiers (@keyup.enter)</li>
                    <li><i class="fas fa-check text-success me-2"></i>Array methods (push, splice)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
import Contador from './components/Contador.vue'
import ListaTarefas from './components/ListaTarefas.vue'

export default {
  name: 'App',
  components: {
    Contador,
    ListaTarefas
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
