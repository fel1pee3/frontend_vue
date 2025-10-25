<template>
  <div>
    <router-link to="/">← Voltar</router-link>
    
    <div style="margin-top: 20px;">
      <h2>{{ post.title }}</h2>
      <p><strong>Categoria:</strong> {{ post.category }}</p>
      <p>{{ post.content }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Post',
  data() {
    return {
      posts: [
        { id: 1, title: 'Post 1', content: 'Conteúdo completo do post 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.', category: 'Tech' },
        { id: 2, title: 'Post 2', content: 'Conteúdo completo do post 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit.', category: 'Life' },
        { id: 3, title: 'Post 3', content: 'Conteúdo completo do post 3. Lorem ipsum dolor sit amet, consectetur adipiscing elit.', category: 'Tech' }
      ],
      post: {}
    }
  },
  mounted() {
    const id = parseInt(this.$route.params.id)
    this.post = this.posts.find(p => p.id === id) || {}
  }
}
</script>
