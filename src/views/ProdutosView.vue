<template>
  <div>
    <h2>Gerenciamento de Produtos</h2>

    <!-- Filtros e Ordenação (Exercício 2) -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <label class="form-label">Buscar:</label>
            <input v-model="filtros.busca" type="text" class="form-control" placeholder="Nome ou categoria...">
          </div>
          <div class="col-md-3">
            <label class="form-label">Ordenar por:</label>
            <select v-model="filtros.ordenarPor" class="form-select">
              <option value="">Padrão</option>
              <option value="nome">Nome (A-Z)</option>
              <option value="nome-desc">Nome (Z-A)</option>
              <option value="preco">Preço (Menor)</option>
              <option value="preco-desc">Preço (Maior)</option>
              <option value="estoque">Estoque (Menor)</option>
              <option value="estoque-desc">Estoque (Maior)</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Estoque mín:</label>
            <input v-model.number="filtros.estoque" type="number" class="form-control" min="0">
          </div>
          <div class="col-md-3">
            <label class="form-label">&nbsp;</label>
            <button @click="salvarFiltro" class="btn btn-success btn-sm w-100">Salvar Filtro</button>
          </div>
        </div>

        <!-- Filtros Salvos -->
        <div v-if="filtrosSalvos.length > 0" class="mt-3">
          <p class="mb-2"><small class="text-muted">Meus filtros:</small></p>
          <div class="btn-group" role="group">
            <button v-for="filtro in filtrosSalvos" :key="filtro.id" class="btn btn-outline-secondary btn-sm" @click="carregarFiltro(filtro.id)">
              {{ filtro.nome }} <button class="btn btn-sm text-danger" @click.stop="deletarFiltro(filtro.id)">✕</button>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Seleção em Lote (Exercício 1) -->
    <div v-if="produtos.length > 0" class="card mb-4">
      <div class="card-body">
        <div class="form-check">
          <input v-model="selecionarTodos" type="checkbox" class="form-check-input" id="selecionarTodos">
          <label class="form-check-label" for="selecionarTodos">
            Selecionar todos ({{ produtos.length }})
          </label>
        </div>

        <div v-if="produtosSelecionados.length > 0" class="mt-3">
          <p class="mb-2"><strong>{{ produtosSelecionados.length }} produto(s) selecionado(s)</strong></p>
          <button @click="abrirModalDesconto" class="btn btn-warning btn-sm me-2">Aplicar Desconto</button>
          <button @click="abrirModalAumento" class="btn btn-info btn-sm me-2">Aumentar Preço</button>
          <button @click="confirmarExclusaoLote" class="btn btn-danger btn-sm">Excluir Selecionados</button>
        </div>
      </div>
    </div>

    <!-- Lista de Produtos -->
    <div v-if="produtosFiltrados.length === 0" class="alert alert-info">
      Nenhum produto encontrado
    </div>

    <div class="row">
      <div v-for="produto in produtosFiltrados" :key="produto.id" class="col-md-4 mb-3">
        <div class="card">
          <div class="card-body">
            <div class="form-check mb-2">
              <input :checked="produtoSelecionado(produto.id)" @change="toggleSelecao(produto.id)" type="checkbox" class="form-check-input" :id="`checkbox-${produto.id}`">
              <label class="form-check-label" :for="`checkbox-${produto.id}`">Selecionar</label>
            </div>
            <h5>{{ produto.nome }}</h5>
            <p class="text-muted">{{ produto.categoria }}</p>
            <p><strong>R$ {{ produto.preco.toFixed(2) }}</strong></p>
            <p><small>Estoque: {{ produto.estoque }}</small></p>
            <p v-if="produto.dataCriacao"><small class="text-muted">{{ new Date(produto.dataCriacao).toLocaleDateString() }}</small></p>
            <button @click="editar(produto)" class="btn btn-primary btn-sm me-2">Editar</button>
            <button @click="deletar(produto.id)" class="btn btn-danger btn-sm">Deletar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Desconto/Aumento -->
    <div v-if="mostrarModalValor" class="modal d-block" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ tipoOperacao === 'desconto' ? 'Aplicar Desconto' : 'Aumentar Preço' }}</h5>
            <button @click="mostrarModalValor = false" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">Percentual (%):</label>
            <input v-model.number="percentualOperacao" type="number" class="form-control" min="0" step="0.1">
          </div>
          <div class="modal-footer">
            <button @click="mostrarModalValor = false" class="btn btn-secondary">Cancelar</button>
            <button @click="aplicarOperacaoLote" class="btn btn-primary">Aplicar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de Notificação -->
    <div v-if="mensagem" :class="['alert', 'position-fixed', { 'alert-success': tipoMensagem === 'sucesso', 'alert-danger': tipoMensagem === 'erro' }]" style="bottom: 20px; right: 20px; z-index: 9999; width: 350px;">
      {{ mensagem }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProdutosView',
  data() {
    return {
      produtos: [
        { id: 1, nome: 'Notebook', categoria: 'Eletrônicos', preco: 2500, estoque: 5, dataCriacao: '2025-10-15' },
        { id: 2, nome: 'Mouse', categoria: 'Periféricos', preco: 50, estoque: 20, dataCriacao: '2025-10-10' },
        { id: 3, nome: 'Teclado', categoria: 'Periféricos', preco: 150, estoque: 10, dataCriacao: '2025-10-12' },
        { id: 4, nome: 'Monitor', categoria: 'Eletrônicos', preco: 1200, estoque: 3, dataCriacao: '2025-10-08' },
        { id: 5, nome: 'Webcam', categoria: 'Periféricos', preco: 200, estoque: 15, dataCriacao: '2025-10-14' }
      ],
      selecionados: new Set(),
      selecionarTodos: false,
      filtros: {
        busca: '',
        ordenarPor: '',
        estoque: 0,
        dataDe: '',
        dataAte: ''
      },
      filtrosSalvos: [],
      mostrarModalValor: false,
      tipoOperacao: '',
      percentualOperacao: 0,
      mensagem: '',
      tipoMensagem: '',
      contador: 5
    }
  },
  computed: {
    produtosFiltrados() {
      let resultado = this.produtos

      // Filtro de busca
      if (this.filtros.busca) {
        const busca = this.filtros.busca.toLowerCase()
        resultado = resultado.filter(p => 
          p.nome.toLowerCase().includes(busca) || 
          p.categoria.toLowerCase().includes(busca)
        )
      }

      // Filtro de estoque
      if (this.filtros.estoque > 0) {
        resultado = resultado.filter(p => p.estoque >= this.filtros.estoque)
      }

      // Filtro de data
      if (this.filtros.dataDe) {
        resultado = resultado.filter(p => new Date(p.dataCriacao) >= new Date(this.filtros.dataDe))
      }
      if (this.filtros.dataAte) {
        resultado = resultado.filter(p => new Date(p.dataCriacao) <= new Date(this.filtros.dataAte))
      }

      // Ordenação
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
          case 'estoque':
            return a.estoque - b.estoque
          case 'estoque-desc':
            return b.estoque - a.estoque
          default:
            return 0
        }
      })

      return resultado
    },
    produtosSelecionados() {
      return this.produtosFiltrados.filter(p => this.selecionados.has(p.id))
    }
  },
  watch: {
    selecionarTodos(novoValor) {
      if (novoValor) {
        this.produtosFiltrados.forEach(p => this.selecionados.add(p.id))
      } else {
        this.selecionados.clear()
      }
    }
  },
  methods: {
    // Exercício 1: Bulk Operations
    toggleSelecao(produtoId) {
      if (this.selecionados.has(produtoId)) {
        this.selecionados.delete(produtoId)
      } else {
        this.selecionados.add(produtoId)
      }
      this.atualizarCheckboxTodos()
    },
    produtoSelecionado(produtoId) {
      return this.selecionados.has(produtoId)
    },
    atualizarCheckboxTodos() {
      const total = this.produtosFiltrados.length
      const selecionados = this.produtosSelecionados.length
      
      if (selecionados === 0) {
        this.selecionarTodos = false
      } else if (selecionados === total) {
        this.selecionarTodos = true
      }
    },
    abrirModalDesconto() {
      this.tipoOperacao = 'desconto'
      this.percentualOperacao = 0
      this.mostrarModalValor = true
    },
    abrirModalAumento() {
      this.tipoOperacao = 'aumento'
      this.percentualOperacao = 0
      this.mostrarModalValor = true
    },
    aplicarOperacaoLote() {
      const ids = Array.from(this.selecionados)
      ids.forEach(id => {
        const produto = this.produtos.find(p => p.id === id)
        if (produto) {
          if (this.tipoOperacao === 'desconto') {
            produto.preco = produto.preco * (1 - this.percentualOperacao / 100)
          } else {
            produto.preco = produto.preco * (1 + this.percentualOperacao / 100)
          }
        }
      })
      
      this.mostrarToast('sucesso', `${ids.length} produto(s) atualizado(s)`)
      this.mostrarModalValor = false
      this.selecionados.clear()
      this.selecionarTodos = false
    },
    confirmarExclusaoLote() {
      if (confirm(`Excluir ${this.produtosSelecionados.length} produto(s)?`)) {
        const ids = Array.from(this.selecionados)
        this.produtos = this.produtos.filter(p => !ids.includes(p.id))
        this.mostrarToast('sucesso', `${ids.length} produto(s) deletado(s)`)
        this.selecionados.clear()
        this.selecionarTodos = false
      }
    },

    // Exercício 2: Filtros Avançados
    salvarFiltro() {
      const nome = prompt('Nome do filtro:')
      if (nome) {
        const filtro = {
          id: Date.now(),
          nome,
          configuracao: JSON.parse(JSON.stringify(this.filtros))
        }
        this.filtrosSalvos.push(filtro)
        localStorage.setItem('filtrosSalvos', JSON.stringify(this.filtrosSalvos))
        this.mostrarToast('sucesso', 'Filtro salvo!')
      }
    },
    carregarFiltro(filtroId) {
      const filtro = this.filtrosSalvos.find(f => f.id === filtroId)
      if (filtro) {
        this.filtros = JSON.parse(JSON.stringify(filtro.configuracao))
      }
    },
    deletarFiltro(filtroId) {
      this.filtrosSalvos = this.filtrosSalvos.filter(f => f.id !== filtroId)
      localStorage.setItem('filtrosSalvos', JSON.stringify(this.filtrosSalvos))
      this.mostrarToast('sucesso', 'Filtro removido')
    },

    // Funções auxiliares
    editar(produto) {
      this.mostrarToast('sucesso', `Editando: ${produto.nome}`)
    },
    deletar(id) {
      if (confirm('Excluir este produto?')) {
        this.produtos = this.produtos.filter(p => p.id !== id)
        this.mostrarToast('sucesso', 'Produto excluído')
      }
    },
    mostrarToast(tipo, mensagem) {
      this.tipoMensagem = tipo
      this.mensagem = mensagem
      setTimeout(() => {
        this.mensagem = ''
      }, 3000)
    }
  },
  mounted() {
    const salvos = localStorage.getItem('filtrosSalvos')
    if (salvos) {
      this.filtrosSalvos = JSON.parse(salvos)
    }
  }
}
</script>

<style scoped>
.modal {
  display: none;
}
.modal.d-block {
  display: block;
}
.modal-dialog {
  margin-top: 100px;
}
</style>
