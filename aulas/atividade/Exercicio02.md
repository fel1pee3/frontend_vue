Exercicio 2 - Filtros Avançados e Ordenação
Objetivo
Expandir o sistema de filtros com:

Ordenação por nome, preço e estoque
Filtros dinâmicos (data de criação)
Salvamento de filtros favoritos
O Que Você Vai Implementar
1. Ordenação de Produtos
Adicione seletor de ordenação na barra de filtros:

<select v-model="filtros.ordenarPor" class="form-select">
  <option value="">Ordenar por...</option>
  <option value="nome">Nome (A-Z)</option>
  <option value="nome-desc">Nome (Z-A)</option>
  <option value="preco">Preço (Menor primeiro)</option>
  <option value="preco-desc">Preço (Maior primeiro)</option>
  <option value="estoque">Estoque (Menor primeiro)</option>
  <option value="estoque-desc">Estoque (Maior primeiro)</option>
</select>
Implementação na computada produtosFiltrados:

computed: {
  produtosFiltrados() {
    // Primeiro filtra (como antes)
    let resultado = this.produtos.filter(...)
    
    // Depois ordena
    resultado.sort((a, b) => {
      switch (this.filtros.ordenarPor) {
        case 'nome':
          return a.nome.localeCompare(b.nome)
        case 'nome-desc':
          return b.nome.localeCompare(a.nome)
        case 'preco':
          return a.preco - b.preco
        case 'preco-desc':
          return b.preco - a.preco
        // ... outros casos
      }
      return 0
    })
    
    return resultado
  }
}
2. Filtro por Data de Criação
Adicione inputs de data na barra de filtros:

<div class="col-md-6">
  <label class="form-label">Data de criação (De):</label>
  <input 
    v-model="filtros.dataDe"
    type="date"
    class="form-control"
  >
</div>

<div class="col-md-6">
  <label class="form-label">Data de criação (Até):</label>
  <input 
    v-model="filtros.dataAte"
    type="date"
    class="form-control"
  >
</div>
Implementação do filtro:

// No computed produtosFiltrados
const matchDataDe = !this.filtros.dataDe || 
  new Date(produto.dataCriacao) >= new Date(this.filtros.dataDe)

const matchDataAte = !this.filtros.dataAte || 
  new Date(produto.dataCriacao) <= new Date(this.filtros.dataAte)
3. Salvamento de Filtros Favoritos
Use localStorage para salvar e recuperar filtros:

data() {
  return {
    filtros: { /* ... */ },
    filtrosSalvos: []  // Array de filtros salvos
  }
}

methods: {
  salvarFiltro() {
    const nome = prompt('Nome do filtro:')
    if (nome) {
      const filtro = {
        id: Date.now(),
        nome,
        configuracao: { ...this.filtros }
      }
      
      this.filtrosSalvos.push(filtro)
      localStorage.setItem('filtrosSalvos', JSON.stringify(this.filtrosSalvos))
      this.mostrarToast('success', 'Filtro salvo!')
    }
  },

  carregarFiltro(filtroId) {
    const filtro = this.filtrosSalvos.find(f => f.id === filtroId)
    if (filtro) {
      this.filtros = { ...filtro.configuracao }
    }
  },

  deletarFiltro(filtroId) {
    this.filtrosSalvos = this.filtrosSalvos.filter(f => f.id !== filtroId)
    localStorage.setItem('filtrosSalvos', JSON.stringify(this.filtrosSalvos))
  }
}

mounted() {
  // Carrega filtros salvos ao montar
  const salvos = localStorage.getItem('filtrosSalvos')
  if (salvos) {
    this.filtrosSalvos = JSON.parse(salvos)
  }
}
Template para gerenciar filtros salvos:

<div class="card mb-4" v-if="filtrosSalvos.length > 0">
  <div class="card-body">
    <h6>Meus Filtros</h6>
    <div class="btn-group" role="group">
      <button 
        v-for="filtro in filtrosSalvos"
        :key="filtro.id"
        class="btn btn-outline-secondary btn-sm"
        @click="carregarFiltro(filtro.id)"
      >
        {{ filtro.nome }}
        <button 
          class="btn btn-sm btn-link text-danger"
          @click.stop="deletarFiltro(filtro.id)"
        >
          X
        </button>
      </button>
    </div>
    <button 
      class="btn btn-success btn-sm ms-2"
      @click="salvarFiltro"
    >
      Salvar Filtro Atual
    </button>
  </div>
</div>
4. Busca por Código de Barras (Bônus)
Adicione input para simular leitura de código de barras:

<div class="col-md-6">
  <label class="form-label">Código de Barras:</label>
  <input 
    v-model="filtros.codigoBarras"
    type="text"
    class="form-control"
    placeholder="Escanear código de barras..."
    @keyup.enter="buscarPorCodigoBarras"
  >
</div>
methods: {
  buscarPorCodigoBarras() {
    // Se backend suporta busca por código
    const produto = this.produtos.find(
      p => p.codigoBarras === this.filtros.codigoBarras
    )
    
    if (produto) {
      this.filtros.pesquisa = produto.nome
      this.mostrarToast('success', `Encontrado: ${produto.nome}`)
    } else {
      this.mostrarToast('error', 'Código não encontrado')
    }
  }
}
Estrutura Sugerida
Seu arquivo data() ficará assim:

data() {
  return {
    produtos: [],
    carregando: false,
    erro: null,
    
    // Filtros
    filtros: {
      pesquisa: '',
      precoMin: null,
      precoMax: null,
      dataDe: null,
      dataAte: null,
      codigoBarras: '',
      ordenarPor: ''
    },
    
    // Favoritos
    filtrosSalvos: [],
    
    // ... resto do estado
  }
}
Recursos Principais
Métodos de Array: .filter(), .sort(), .find()
localStorage para persistência
Date API do JavaScript para comparações
v-model para duas vias com inputs