<template>
  <div>
    <h2>Blog</h2>
    
    <div style="margin-bottom: 20px;">
      <input v-model="busca" placeholder="Buscar por título ou categoria..." style="padding: 5px; width: 300px;">
    </div>
    
    <div v-if="postosFiltrados.length === 0">Nenhum post encontrado</div>
    
    <div v-for="post in postosFiltrados" :key="post.id" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
      <h3>{{ post.title }}</h3>
      <p><strong>Categoria:</strong> {{ post.category }}</p>
      <p>{{ post.content.substring(0, 100) }}...</p>
      <router-link :to="`/post/${post.id}`">Ler mais</router-link>
    </div>
    
    <router-link to="/admin" style="display: block; margin-top: 20px;">Ir para Painel Admin</router-link>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'Home',
  setup() {
    const posts = ref([
      { id: 1, title: 'Post 1', content: 'Conteúdo do post 1. Lorem ipsum dolor sit amet.', category: 'Tech' },
      { id: 2, title: 'Post 2', content: 'Conteúdo do post 2. Lorem ipsum dolor sit amet.', category: 'Life' },
      { id: 3, title: 'Post 3', content: 'Conteúdo do post 3. Lorem ipsum dolor sit amet.', category: 'Tech' }
    ])
    
    const busca = ref('')
    
    const postosFiltrados = computed(() => {
      return posts.value.filter(post => 
        post.title.toLowerCase().includes(busca.value.toLowerCase()) ||
        post.category.toLowerCase().includes(busca.value.toLowerCase())
      )
    })
    
    return {
      posts,
      busca,
      postosFiltrados
    }
  }
}
</script>
