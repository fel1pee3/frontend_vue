<template>
  <div>
    <h2>Painel Administrativo</h2>
    
    <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
      <h3>Adicionar Novo Post</h3>
      <input v-model="form.title" placeholder="Título" style="display: block; padding: 5px; margin: 5px 0; width: 300px;">
      <input v-model="form.content" placeholder="Conteúdo" style="display: block; padding: 5px; margin: 5px 0; width: 300px;">
      <select v-model="form.category" style="display: block; padding: 5px; margin: 5px 0; width: 300px;">
        <option value="">Selecione Categoria</option>
        <option value="Tech">Tech</option>
        <option value="Life">Life</option>
        <option value="Other">Other</option>
      </select>
      <button @click="adicionarPost" style="padding: 5px 15px; margin-top: 10px;">Adicionar Post</button>
    </div>
    
    <router-link to="/">← Voltar para Blog</router-link>
  </div>
</template>

<script>
export default {
  name: 'AdminPanel',
  data() {
    return {
      form: {
        title: '',
        content: '',
        category: ''
      }
    }
  },
  methods: {
    adicionarPost() {
      if (!this.form.title.trim() || !this.form.content.trim() || !this.form.category) {
        alert('Preencha todos os campos')
        return
      }
      alert('Post adicionado! (Funcionalidade para aula posterior)')
      this.form = { title: '', content: '', category: '' }
    }
  }
}
</script>
