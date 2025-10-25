<template>
  <div class="contador">
    <h2>Contador</h2>
    <div class="valor">{{ contador }}</div>
    
    <!-- Mensagem especial quando chegar a 10 -->
    <div v-if="contador === 10" class="mensagem-especial">
      🎉 Parabéns! Você chegou a 10! 🎉
    </div>
    
    <div class="botoes">
      <button @click="incrementar(1)" class="btn btn-primary">+1</button>
      <button @click="decrementar(1)" class="btn btn-secondary" :disabled="contador === 0">-1</button>
      <button @click="incrementar(5)" class="btn btn-primary">+5</button>
      <button @click="decrementar(5)" class="btn btn-secondary" :disabled="contador < 5">-5</button>
    </div>
    
    <div class="reset">
      <button @click="reset" class="btn btn-reset">Reset</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Contador',
  data() {
    return {
      contador: 0
    }
  },
  methods: {
    incrementar(valor) {
      this.contador += valor
    },
    decrementar(valor) {
      // Não permite valores negativos
      if (this.contador - valor >= 0) {
        this.contador -= valor
      }
    },
    reset() {
      this.contador = 0
    }
  }
}
</script>

<style scoped>
.contador {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: 10px;
  text-align: center;
  background-color: #f9f9f9;
}

.valor {
  font-size: 3rem;
  font-weight: bold;
  color: #333;
  margin: 20px 0;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mensagem-especial {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  margin: 15px 0;
  border-radius: 5px;
  border: 1px solid #c3e6cb;
  font-weight: bold;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.botoes {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 20px 0;
}

.btn {
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-reset {
  background-color: #dc3545;
  color: white;
}

.btn-reset:hover {
  background-color: #c82333;
}

.reset {
  margin-top: 15px;
}
</style>