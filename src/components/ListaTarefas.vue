<template>
  <div class="lista-tarefas">
    <h2>Lista de Tarefas</h2>
    
    <!-- Input para nova tarefa -->
    <div class="input-section">
      <input 
        v-model="novaTarefa" 
        @keyup.enter="adicionarTarefa"
        type="text" 
        placeholder="Digite uma nova tarefa..."
        class="input-tarefa"
      >
      <button @click="adicionarTarefa" class="btn btn-adicionar" :disabled="!novaTarefa.trim()">
        Adicionar
      </button>
    </div>
    
    <!-- Contador de tarefas -->
    <div class="contador-tarefas">
      <strong>Total de tarefas: {{ totalTarefas }}</strong>
    </div>
    
    <!-- Lista de tarefas -->
    <div class="tarefas" v-if="tarefas.length > 0">
      <div 
        v-for="(tarefa, index) in tarefas" 
        :key="index" 
        class="tarefa-item"
      >
        <span class="tarefa-numero">{{ index + 1 }}.</span>
        <span class="tarefa-texto">{{ tarefa }}</span>
        <button @click="removerTarefa(index)" class="btn btn-remover">
          ✕
        </button>
      </div>
    </div>
    
    <!-- Mensagem quando não há tarefas -->
    <div v-else class="sem-tarefas">
      <p>Nenhuma tarefa adicionada ainda.</p>
      <p>Adicione sua primeira tarefa acima! 📝</p>
    </div>
    
    <!-- Botão para limpar todas -->
    <div class="acoes" v-if="tarefas.length > 0">
      <button @click="limparTodas" class="btn btn-limpar">
        Limpar Todas
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListaTarefas',
  data() {
    return {
      novaTarefa: '',
      tarefas: []
    }
  },
  computed: {
    totalTarefas() {
      return this.tarefas.length
    }
  },
  methods: {
    adicionarTarefa() {
      if (this.novaTarefa.trim()) {
        this.tarefas.push(this.novaTarefa.trim())
        this.novaTarefa = ''
      }
    },
    removerTarefa(index) {
      this.tarefas.splice(index, 1)
    },
    limparTodas() {
      if (confirm('Tem certeza que deseja remover todas as tarefas?')) {
        this.tarefas = []
      }
    }
  }
}
</script>

<style scoped>
.lista-tarefas {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.input-tarefa {
  flex: 1;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.input-tarefa:focus {
  outline: none;
  border-color: #007bff;
}

.contador-tarefas {
  background-color: #e9ecef;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  margin-bottom: 20px;
  color: #495057;
}

.tarefas {
  margin-bottom: 20px;
}

.tarefa-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tarefa-numero {
  font-weight: bold;
  color: #007bff;
  margin-right: 10px;
  min-width: 25px;
}

.tarefa-texto {
  flex: 1;
  color: #333;
}

.sem-tarefas {
  text-align: center;
  padding: 30px;
  color: #6c757d;
  font-style: italic;
}

.sem-tarefas p {
  margin: 5px 0;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-adicionar {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
}

.btn-adicionar:hover:not(:disabled) {
  background-color: #218838;
}

.btn-remover {
  background-color: #dc3545;
  color: white;
  font-size: 12px;
  padding: 5px 8px;
  margin-left: 10px;
}

.btn-remover:hover {
  background-color: #c82333;
}

.btn-limpar {
  background-color: #ffc107;
  color: #212529;
  width: 100%;
}

.btn-limpar:hover {
  background-color: #e0a800;
}

.acoes {
  margin-top: 15px;
}
</style>