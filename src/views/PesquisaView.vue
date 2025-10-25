<template>
  <div>
    <h2>Busca e Filtros</h2>
    
    <div style="display: grid; grid-template-columns: 1fr 3fr; gap: 20px;">
      <!-- Filtros -->
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; height: fit-content;">
        <SearchInput v-model="filtros.texto" />
        <FilterCategory v-model="filtros.categorias" />
        <PriceRange :min="filtros.precoMin" :max="filtros.precoMax" :maxLimite="1000" @update-preco="atualizarPreco" />
        <SortOptions v-model="filtros.ordenacao" />
      </div>

      <!-- Resultados -->
      <div>
        <p style="margin-top: 0; color: #666; font-size: 14px;">
          <strong>{{ produtosFiltrados.length }}</strong> produto(s) encontrado(s)
        </p>
        <ResultsList :produtos="produtosFiltrados" />
      </div>
    </div>
  </div>
</template>

<script>
import SearchInput from '../components/busca/SearchInput.vue'
import FilterCategory from '../components/busca/FilterCategory.vue'
import PriceRange from '../components/busca/PriceRange.vue'
import SortOptions from '../components/busca/SortOptions.vue'
import ResultsList from '../components/busca/ResultsList.vue'
import { aplicarFiltros } from '../utils/searchFilters'

export default {
  name: 'PesquisaView',
  components: {
    SearchInput,
    FilterCategory,
    PriceRange,
    SortOptions,
    ResultsList
  },
  data() {
    return {
      filtros: {
        texto: '',
        categorias: [],
        precoMin: 0,
        precoMax: 1000,
        ordenacao: ''
      },
      produtos: [
        { id: 1, nome: 'Notebook', descricao: 'Laptop potente para trabalho', preco: 2500, categoria: 'Eletrônicos' },
        { id: 2, nome: 'Mouse Gamer', descricao: 'Mouse de alta precisão', preco: 150, categoria: 'Eletrônicos' },
        { id: 3, nome: 'Teclado Mecânico', descricao: 'Teclado RGB bacana', preco: 350, categoria: 'Eletrônicos' },
        { id: 4, nome: 'Camiseta Azul', descricao: 'Camiseta 100% algodão', preco: 50, categoria: 'Roupas' },
        { id: 5, nome: 'Calça Jeans', descricao: 'Calça confortável', preco: 80, categoria: 'Roupas' },
        { id: 6, nome: 'Clean Code', descricao: 'Livro sobre código limpo', preco: 100, categoria: 'Livros' },
        { id: 7, nome: 'The Pragmatic Programmer', descricao: 'Guia prático de programação', preco: 120, categoria: 'Livros' },
        { id: 8, nome: 'Bola de Futebol', descricao: 'Bola oficial de futebol', preco: 200, categoria: 'Esportes' },
        { id: 9, nome: 'Raquete de Tênis', descricao: 'Raquete profissional', preco: 300, categoria: 'Esportes' },
        { id: 10, nome: 'Sapato Esportivo', descricao: 'Sapato para corrida', preco: 180, categoria: 'Esportes' }
      ]
    }
  },
  computed: {
    produtosFiltrados() {
      return aplicarFiltros(this.produtos, this.filtros)
    }
  },
  methods: {
    atualizarPreco(dados) {
      this.filtros.precoMin = dados.min
      this.filtros.precoMax = dados.max
    }
  }
}
</script>
