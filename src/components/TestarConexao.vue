<template>
  <div>
    <h3>Exercício 1: Testar Conexão com API</h3>
    <button @click="testarConexao">Testar Conexão</button>
    
    <div v-if="carregando">Carregando...</div>
    <div v-if="erro" style="color: red;">Erro: {{ erro }}</div>
    <div v-if="dados">
      <h4>Dados Recebidos:</h4>
      <p><strong>ID:</strong> {{ dados.id }}</p>
      <p><strong>Título:</strong> {{ dados.title }}</p>
      <p><strong>Conteúdo:</strong> {{ dados.body }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestarConexao',
  data() {
    return {
      dados: null,
      carregando: false,
      erro: null
    }
  },
  methods: {
    async testarConexao() {
      this.carregando = true
      this.erro = null
      this.dados = null
      
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1')
        if (!response.ok) throw new Error('Erro na requisição')
        this.dados = await response.json()
      } catch (e) {
        this.erro = e.message
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>

<style scoped>
button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>