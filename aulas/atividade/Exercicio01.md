Exercicio 1 - Bulk Operations: Ações em Lote
Objetivo
Implementar seleção múltipla de produtos e ações em lote (bulk operations) como:

Seleção com checkboxes
Exclusão em lote
Atualização de preços em lote (desconto/acréscimo percentual)
Didática: Por Que Bulk Operations?
Em sistemas reais, usuários precisam fazer operações em múltiplos itens:

Um gerente precisa fazer desconto em 50 produtos
Precisa excluir 10 produtos descontinuados
Precisa aumentar preço de tudo em 5%
Implementar isso item por item é ineficiente. Bulk operations resolvem isso.

Passo 1: Adicionar Checkboxes no Template
Localização: src/views/ProdutosView.vue

No template, antes da lista de produtos, adicione:

<!-- Checkbox para selecionar todos -->
<div class="card mb-4" v-if="produtos.length > 0">
  <div class="card-body">
    <div class="form-check">
      <input 
        v-model="selecionarTodos"
        type="checkbox"
        class="form-check-input"
        id="selecionarTodos"
      >
      <label class="form-check-label" for="selecionarTodos">
        Selecionar todos ({{ produtos.length }})
      </label>
    </div>

    <!-- Barra de ações quando há seleção -->
    <div v-if="produtosSelecionados.length > 0" class="mt-3">
      <p class="mb-2">
        <strong>{{ produtosSelecionados.length }} produto(s) selecionado(s)</strong>
      </p>
      
      <div class="btn-group" role="group">
        <button 
          class="btn btn-warning btn-sm"
          @click="abrirModalDesconto"
        >
          Aplicar Desconto
        </button>
        
        <button 
          class="btn btn-info btn-sm"
          @click="abrirModalAumento"
        >
          Aumentar Preço
        </button>
        
        <button 
          class="btn btn-danger btn-sm"
          @click="confirmarExclusaoLote"
        >
          Excluir Selecionados
        </button>
      </div>
    </div>
  </div>
</div>
Por que separar em card?

Fica claro que é interface de seleção
Não poluir a listagem
Fácil de esconder quando sem seleção
Passo 2: Adicionar Checkboxes nos Cards de Produto
No card de cada produto, adicione no topo:

<!-- Dentro do card, antes do titulo -->
<div class="form-check mb-2">
  <input 
    :checked="produtoSelecionado(produto.id)"
    @change="toggleSelecao(produto.id)"
    type="checkbox"
    class="form-check-input"
    :id="`checkbox-${produto.id}`"
  >
  <label class="form-check-label" :for="`checkbox-${produto.id}`">
    Selecionar
  </label>
</div>
Usar :checked e @change em vez de v-model? Porque o estado está em um Set, não em um objeto simples.

Passo 3: Atualizar o State (data)
Adicione em src/views/ProdutosView.vue:

data() {
  return {
    // ... dados anteriores ...
    selecionados: new Set(),      // IDs dos produtos selecionados
    selecionarTodosCheck: false,  // Estado do checkbox "Selecionar todos"
  }
}
Por que usar Set?

Operação O(1) para adicionar/remover
Automaticamente evita duplicatas
Conveniente para verificar se tem um item
Passo 4: Implementar Métodos de Seleção
Adicione estes métodos em src/views/ProdutosView.vue:

methods: {
  // Alterna seleção de um produto
  toggleSelecao(produtoId) {
    if (this.selecionados.has(produtoId)) {
      this.selecionados.delete(produtoId)
    } else {
      this.selecionados.add(produtoId)
    }
    // Atualiza checkbox "Selecionar todos"
    this.atualizarCheckboxTodos()
  },

  // Verifica se um produto está selecionado
  produtoSelecionado(produtoId) {
    return this.selecionados.has(produtoId)
  },

  // Atualiza estado do checkbox "Selecionar todos"
  atualizarCheckboxTodos() {
    const todosCount = this.produtosFiltrados.length
    const selecionadosCount = this.produtosSelecionados.length
    
    if (selecionadosCount === 0) {
      this.selecionarTodosCheck = false
    } else if (selecionadosCount === todosCount) {
      this.selecionarTodosCheck = true
    }
    // Se parcial, deixa indeterminado (Bootstrap cuida)
  },

  // Get: Lista de IDs selecionados
  get produtosSelecionados() {
    return this.produtosFiltrados.filter(p => 
      this.selecionados.has(p.id)
    )
  }
}
Como usar get?

// Transforma um método em propriedade
this.produtosSelecionados  // Chama produtosSelecionados()
Passo 5: Selecionar/Desselecionar Todos
Adicione um computed para sincronizar:

computed: {
  // ... computadas anteriores ...
  
  selecionarTodos: {
    get() {
      return this.selecionarTodosCheck
    },
    set(valor) {
      if (valor) {
        // Seleciona todos os visíveis após filtro
        this.produtosFiltrados.forEach(p => {
          this.selecionados.add(p.id)
        })
      } else {
        // Desseleciona todos
        this.selecionados.clear()
      }
      this.selecionarTodosCheck = valor
    }
  }
}
Como v-model funciona com computed getter/setter?

<!-- Isto chama selecionarTodos.get/set automaticamente -->
<input v-model="selecionarTodos" type="checkbox">
Passo 6: Modal para Aplicar Desconto
Crie novo componente: src/components/ModalDesconto.vue

<template>
  <div class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="handleSubmit">
          <div class="modal-header">
            <h5 class="modal-title">Aplicar Desconto</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="$emit('cancelar')"
            ></button>
          </div>
          
          <div class="modal-body">
            <p class="text-muted mb-3">
              Aplicar desconto em {{ quantidade }} produto(s)
            </p>

            <div class="mb-3">
              <label class="form-label">
                Percentual de Desconto <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <input 
                  v-model.number="desconto"
                  type="number"
                  class="form-control"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Ex: 10"
                  required
                >
                <span class="input-group-text">%</span>
              </div>
            </div>

            <!-- Preview -->
            <div class="alert alert-info">
              <h6>Exemplo de cálculo:</h6>
              <p class="mb-0">
                Preço original: R$ 100,00
                <br>
                Desconto ({{ desconto }}%): R$ {{ (100 * desconto / 100).toFixed(2) }}
                <br>
                <strong>Novo preço: R$ {{ (100 - (100 * desconto / 100)).toFixed(2) }}</strong>
              </p>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="$emit('cancelar')"
            >
              Cancelar
            </button>
            
            <button type="submit" class="btn btn-primary">
              Aplicar Desconto
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalDesconto',
  props: {
    quantidade: {
      type: Number,
      required: true
    }
  },
  emits: ['aplicar', 'cancelar'],
  data() {
    return {
      desconto: 10  // Valor padrão
    }
  },
  methods: {
    handleSubmit() {
      if (this.desconto >= 0 && this.desconto <= 100) {
        this.$emit('aplicar', this.desconto)
      }
    }
  }
}
</script>
Passo 7: Modal para Aumentar Preço
Crie: src/components/ModalAumento.vue (similar ao ModalDesconto)

<template>
  <div class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="handleSubmit">
          <div class="modal-header">
            <h5 class="modal-title">Aumentar Preço</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="$emit('cancelar')"
            ></button>
          </div>
          
          <div class="modal-body">
            <p class="text-muted mb-3">
              Aumentar preço em {{ quantidade }} produto(s)
            </p>

            <div class="mb-3">
              <label class="form-label">
                Percentual de Aumento <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <input 
                  v-model.number="aumento"
                  type="number"
                  class="form-control"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Ex: 5"
                  required
                >
                <span class="input-group-text">%</span>
              </div>
            </div>

            <!-- Preview -->
            <div class="alert alert-info">
              <h6>Exemplo de cálculo:</h6>
              <p class="mb-0">
                Preço original: R$ 100,00
                <br>
                Aumento ({{ aumento }}%): R$ {{ (100 * aumento / 100).toFixed(2) }}
                <br>
                <strong>Novo preço: R$ {{ (100 + (100 * aumento / 100)).toFixed(2) }}</strong>
              </p>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="$emit('cancelar')"
            >
              Cancelar
            </button>
            
            <button type="submit" class="btn btn-primary">
              Aumentar Preço
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalAumento',
  props: {
    quantidade: {
      type: Number,
      required: true
    }
  },
  emits: ['aplicar', 'cancelar'],
  data() {
    return {
      aumento: 5  // Valor padrão
    }
  },
  methods: {
    handleSubmit() {
      if (this.aumento >= 0 && this.aumento <= 100) {
        this.$emit('aplicar', this.aumento)
      }
    }
  }
}
</script>
Passo 8: Implementar Métodos de Ação em Lote
Em src/views/ProdutosView.vue, adicione:

methods: {
  // ... métodos anteriores ...

  abrirModalDesconto() {
    this.modalDescontoAberto = true
  },

  abrirModalAumento() {
    this.modalAumentoAberto = true
  },

  async aplicarDescontoLote(percentual) {
    this.processandoLote = true

    try {
      // Para cada produto selecionado
      for (const produto of this.produtosSelecionados) {
        const novoPreco = produto.preco * (1 - percentual / 100)
        
        // Atualiza no servidor
        const resultado = await ProdutoService.atualizar(
          produto.id,
          { ...produto, preco: novoPreco }
        )
        
        if (!resultado.sucesso) {
          throw new Error(`Erro ao atualizar ${produto.nome}`)
        }
      }

      this.mostrarToast(
        'success',
        `Desconto de ${percentual}% aplicado em ${this.produtosSelecionados.length} produto(s)!`
      )
      
      // Limpa seleção e recarrega
      this.selecionados.clear()
      await this.carregarProdutos()
      this.modalDescontoAberto = false
    } catch (erro) {
      this.mostrarToast('error', erro.message)
    }

    this.processandoLote = false
  },

  async aplicarAumentoLote(percentual) {
    this.processandoLote = true

    try {
      for (const produto of this.produtosSelecionados) {
        const novoPreco = produto.preco * (1 + percentual / 100)
        
        const resultado = await ProdutoService.atualizar(
          produto.id,
          { ...produto, preco: novoPreco }
        )
        
        if (!resultado.sucesso) {
          throw new Error(`Erro ao atualizar ${produto.nome}`)
        }
      }

      this.mostrarToast(
        'success',
        `Aumento de ${percentual}% aplicado em ${this.produtosSelecionados.length} produto(s)!`
      )
      
      this.selecionados.clear()
      await this.carregarProdutos()
      this.modalAumentoAberto = false
    } catch (erro) {
      this.mostrarToast('error', erro.message)
    }

    this.processandoLote = false
  },

  async confirmarExclusaoLote() {
    const confirmou = confirm(
      `Tem certeza que deseja excluir ${this.produtosSelecionados.length} produto(s)?`
    )
    
    if (confirmou) {
      await this.excluirLote()
    }
  },

  async excluirLote() {
    this.processandoLote = true

    try {
      for (const produto of this.produtosSelecionados) {
        const resultado = await ProdutoService.excluir(produto.id)
        
        if (!resultado.sucesso) {
          throw new Error(`Erro ao excluir ${produto.nome}`)
        }
      }

      this.mostrarToast(
        'success',
        `${this.produtosSelecionados.length} produto(s) excluído(s)!`
      )
      
      this.selecionados.clear()
      await this.carregarProdutos()
    } catch (erro) {
      this.mostrarToast('error', erro.message)
    }

    this.processandoLote = false
  }
}
Passo 9: Adicionar Importações e Estado
No data de ProdutosView.vue:

data() {
  return {
    // ... dados anteriores ...
    selecionados: new Set(),
    selecionarTodosCheck: false,
    modalDescontoAberto: false,
    modalAumentoAberto: false,
    processandoLote: false
  }
}
Nas importações:

import ModalDesconto from '@/components/ModalDesconto.vue'
import ModalAumento from '@/components/ModalAumento.vue'
Nos componentes:

components: {
  ProdutosView,
  ModalProduto,
  ToastNotificacao,
  ModalDesconto,
  ModalAumento
}
Passo 10: Adicionar Modais no Template
No template de ProdutosView.vue:

<!-- Modais de desconto e aumento -->
<ModalDesconto 
  v-if="modalDescontoAberto"
  :quantidade="produtosSelecionados.length"
  @aplicar="aplicarDescontoLote"
  @cancelar="modalDescontoAberto = false"
/>

<ModalAumento 
  v-if="modalAumentoAberto"
  :quantidade="produtosSelecionados.length"
  @aplicar="aplicarAumentoLote"
  @cancelar="modalAumentoAberto = false"
/>
Como Funciona o Fluxo Completo
Cenário: User deseja dar 10% de desconto em 3 produtos
1. User vê a lista de produtos
   └─ Clica em 3 checkboxes (checkbox dos cards)
   └─ Set selecionados = { 1, 2, 3 }

2. Barra de seleção aparece
   └─ "3 produtos selecionados"
   └─ Mostra botões de ação

3. User clica "Aplicar Desconto"
   └─ ModalDesconto abre
   └─ User digita 10 (%)

4. User clica "Aplicar Desconto" no modal
   └─ Para cada produto selecionado:
      └─ novoPreco = preco * (1 - 10/100)
      └─ PUT /api/produtos/{id} { preco: novoPreco }

5. Backend valida e salva
   └─ Retorna sucesso

6. Toast aparece
   └─ "Desconto de 10% aplicado em 3 produto(s)!"
   └─ Seleção limpa
   └─ Lista recarrega com novos preços
Conceitos Importantes
Set vs Array
// Array - procura lenta O(n)
const selecionados = [1, 2, 3]
if (selecionados.includes(1)) { }  // Procura todo array

// Set - procura rápida O(1)
const selecionados = new Set([1, 2, 3])
if (selecionados.has(1)) { }  // Acesso direto
Getter/Setter em Computed
computed: {
  selecionarTodos: {
    get() { return this.selecionarTodosCheck },
    set(valor) { 
      // Atualiza múltiplos items
      valor ? this.selecionados.clear() : this.selecionados.add(...)
    }
  }
}
Processamento em Lote com Loop
for (const produto of this.produtosSelecionados) {
  // Faz requisição sequencial
  const resultado = await ProdutoService.atualizar(...)
  if (!resultado.sucesso) throw erro
}

// Alternativa: requisições paralelas
await Promise.all(
  this.produtosSelecionados.map(p => 
    ProdutoService.atualizar(p.id, novosDados)
  )
)
