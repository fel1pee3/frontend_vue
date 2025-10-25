<template>
  <div>
    <h3>Exercício 2: Buscar e Exibir Dados</h3>
    
    <div v-if="carregando">Carregando...</div>
    <div v-if="erro" style="color: red;">Erro: {{ erro }}</div>
    
    <div v-for="post in posts" :key="post.id" style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
      <h4>{{ post.title }}</h4>
      <p>{{ post.body }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BuscarDados',
  data() {
    return {
      posts: [],
      carregando: true,
      erro: null
    }
  },
  mounted() {
    this.buscarPosts()
  },
  methods: {
    async buscarPosts() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts')
        if (!response.ok) throw new Error('Erro ao buscar dados')
        this.posts = await response.json()
      } catch (e) {
        this.erro = e.message
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>