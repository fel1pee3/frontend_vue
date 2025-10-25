<template>
  <div>
    <h3>Exercício 3: CRUD Simples</h3>
    
    <div style="margin-bottom: 20px;">
      <button @click="toggleForm">{{ mostraForm ? 'Cancelar' : 'Adicionar Produto' }}</button>
    </div>
    
    <div v-if="mostraForm" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 20px;">
      <h4>{{ editando ? 'Editar Produto' : 'Novo Produto' }}</h4>
      <input v-model="form.nome" placeholder="Nome" style="display: block; margin: 5px 0; padding: 5px;">
      <input v-model.number="form.preco" placeholder="Preço" type="number" style="display: block; margin: 5px 0; padding: 5px;">
      <input v-model="form.descricao" placeholder="Descrição" style="display: block; margin: 5px 0; padding: 5px;">
      <button @click="salvar" style="margin-top: 10px;">{{ editando ? 'Atualizar' : 'Adicionar' }}</button>
    </div>
    
    <div>
      <h4>Produtos ({{ produtos.length }})</h4>
      <div v-for="produto in produtos" :key="produto.id" style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
        <p><strong>{{ produto.nome }}</strong> - R$ {{ produto.preco }}</p>
        <p>{{ produto.descricao }}</p>
        <button @click="editar(produto)" style="margin-right: 5px;">Editar</button>
        <button @click="deletar(produto.id)" style="background-color: #ff6b6b; color: white;">Deletar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CRUDProdutos',
  data() {
    return {
      produtos: [
        { id: 1, nome: 'Produto 1', preco: 10, descricao: 'Descrição 1' },
        { id: 2, nome: 'Produto 2', preco: 20, descricao: 'Descrição 2' }
      ],
      mostraForm: false,
      editando: false,
      proxId: 3,
      form: {
        nome: '',
        preco: 0,
        descricao: ''
      }
    }
  },
  methods: {
    toggleForm() {
      this.mostraForm = !this.mostraForm
      if (!this.mostraForm) {
        this.resetForm()
      }
    },
    salvar() {
      if (!this.form.nome.trim()) {
        alert('Nome é obrigatório')
        return
      }
      
      if (this.editando) {
        const produto = this.produtos.find(p => p.id === this.form.id)
        if (produto) {
          produto.nome = this.form.nome
          produto.preco = this.form.preco
          produto.descricao = this.form.descricao
        }
        this.editando = false
      } else {
        this.produtos.push({
          id: this.proxId++,
          nome: this.form.nome,
          preco: this.form.preco,
          descricao: this.form.descricao
        })
      }
      
      this.resetForm()
      this.mostraForm = false
    },
    editar(produto) {
      this.form = { ...produto }
      this.editando = true
      this.mostraForm = true
    },
    deletar(id) {
      this.produtos = this.produtos.filter(p => p.id !== id)
    },
    resetForm() {
      this.form = {
        nome: '',
        preco: 0,
        descricao: ''
      }
    }
  }
}
</script>