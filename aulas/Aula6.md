## Aula 6 — CRUD de Produtos (Integração Completa com Flask)

### Objetivos
- Implementar operações CRUD completas (Create, Read, Update, Delete)
- Conectar diretamente com a API Flask do backend
- Gerenciar estados de loading e erro
- Implementar formulários avançados para produtos
- Trabalhar com validações client-side e server-side
- Aplicar conceitos de UX em operações assíncronas

---

### Visão Geral da Integração

Esta aula conecta diretamente com os endpoints da API Flask:

| Operação | Método HTTP | Endpoint | Descrição |
|----------|-------------|----------|-----------|
| **Listar** | GET | `/api/produtos` | Lista todos os produtos |
| **Criar** | POST | `/api/produtos` | Cria novo produto |
| **Buscar** | GET | `/api/produtos/{id}` | Busca produto específico |
| **Atualizar** | PUT | `/api/produtos/{id}` | Atualiza produto existente |
| **Excluir** | DELETE | `/api/produtos/{id}` | Remove produto |

---

### Serviço API para Produtos

#### `src/services/ProdutoService.js`
```javascript
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

// Configuração global do Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptador para adicionar token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptador para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export class ProdutoService {
  
  /**
   * Lista todos os produtos
   */
  static async listarTodos() {
    try {
      const response = await api.get('/produtos')
      return {
        sucesso: true,
        dados: response.data,
        mensagem: 'Produtos carregados com sucesso'
      }
    } catch (error) {
      return {
        sucesso: false,
        dados: [],
        mensagem: this.tratarErro(error)
      }
    }
  }

  /**
   * Busca produto por ID
   */
  static async buscarPorId(id) {
    try {
      const response = await api.get(`/produtos/${id}`)
      return {
        sucesso: true,
        dados: response.data,
        mensagem: 'Produto encontrado'
      }
    } catch (error) {
      return {
        sucesso: false,
        dados: null,
        mensagem: this.tratarErro(error)
      }
    }
  }

  /**
   * Cria novo produto
   */
  static async criar(produto) {
    try {
      const response = await api.post('/produtos', produto)
      return {
        sucesso: true,
        dados: response.data,
        mensagem: 'Produto criado com sucesso!'
      }
    } catch (error) {
      return {
        sucesso: false,
        dados: null,
        mensagem: this.tratarErro(error)
      }
    }
  }

  /**
   * Atualiza produto existente
   */
  static async atualizar(id, produto) {
    try {
      const response = await api.put(`/produtos/${id}`, produto)
      return {
        sucesso: true,
        dados: response.data,
        mensagem: 'Produto atualizado com sucesso!'
      }
    } catch (error) {
      return {
        sucesso: false,
        dados: null,
        mensagem: this.tratarErro(error)
      }
    }
  }

  /**
   * Exclui produto
   */
  static async excluir(id) {
    try {
      await api.delete(`/produtos/${id}`)
      return {
        sucesso: true,
        dados: null,
        mensagem: 'Produto excluído com sucesso!'
      }
    } catch (error) {
      return {
        sucesso: false,
        dados: null,
        mensagem: this.tratarErro(error)
      }
    }
  }

  /**
   * Trata erros da API
   */
  static tratarErro(error) {
    if (error.response) {
      // Erro da API
      switch (error.response.status) {
        case 400:
          return error.response.data.message || 'Dados inválidos'
        case 401:
          return 'Não autorizado. Faça login novamente.'
        case 403:
          return 'Acesso negado'
        case 404:
          return 'Produto não encontrado'
        case 500:
          return 'Erro interno do servidor'
        default:
          return `Erro: ${error.response.status}`
      }
    } else if (error.request) {
      // Erro de rede
      return 'Erro de conexão. Verifique se o backend está rodando.'
    } else {
      // Outro erro
      return 'Erro inesperado'
    }
  }
}
```

---

### Componente de Listagem

#### `src/views/ProdutosView.vue`
```vue
<template>
  <div class="produtos-view">
    <!-- Header da página -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2>
          <i class="fas fa-box-open me-2"></i>
          Gerenciar Produtos
        </h2>
        <p class="text-muted mb-0">
          Total: {{ produtos.length }} produto(s)
        </p>
      </div>
      
      <div>
        <button 
          class="btn btn-success me-2"
          @click="abrirModal()"
        >
          <i class="fas fa-plus"></i> Novo Produto
        </button>
        
        <button 
          class="btn btn-outline-primary"
          @click="carregarProdutos"
          :disabled="carregando"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': carregando }"></i>
          Atualizar
        </button>
      </div>
    </div>

    <!-- Filtros e pesquisa -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Pesquisar:</label>
            <input 
              v-model="filtros.pesquisa"
              type="text"
              class="form-control"
              placeholder="Nome do produto..."
            >
          </div>
          
          <div class="col-md-3">
            <label class="form-label">Preço mínimo:</label>
            <input 
              v-model.number="filtros.precoMin"
              type="number"
              class="form-control"
              step="0.01"
              min="0"
            >
          </div>
          
          <div class="col-md-3">
            <label class="form-label">Preço máximo:</label>
            <input 
              v-model.number="filtros.precoMax"
              type="number"
              class="form-control"
              step="0.01"
              min="0"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="carregando" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-2 text-muted">Carregando produtos...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="erro" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ erro }}
      <button class="btn btn-sm btn-outline-danger ms-3" @click="carregarProdutos">
        Tentar novamente
      </button>
    </div>

    <!-- Lista de produtos -->
    <div v-else>
      <!-- Produtos em grid -->
      <div class="row" v-if="produtosFiltrados.length > 0">
        <div 
          v-for="produto in produtosFiltrados" 
          :key="produto.id"
          class="col-lg-4 col-md-6 mb-4"
        >
          <div class="card h-100 produto-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title">{{ produto.nome }}</h5>
                <span 
                  class="badge"
                  :class="produto.estoque > 10 ? 'bg-success' : produto.estoque > 0 ? 'bg-warning' : 'bg-danger'"
                >
                  {{ produto.estoque > 0 ? `${produto.estoque} un.` : 'Esgotado' }}
                </span>
              </div>
              
              <div class="mb-3">
                <span class="h4 text-primary">R$ {{ produto.preco.toFixed(2) }}</span>
              </div>
              
              <div class="d-flex gap-2">
                <button 
                  class="btn btn-outline-primary btn-sm flex-fill"
                  @click="abrirModal(produto)"
                >
                  <i class="fas fa-edit"></i> Editar
                </button>
                
                <button 
                  class="btn btn-outline-danger btn-sm"
                  @click="confirmarExclusao(produto)"
                  :disabled="excluindo === produto.id"
                >
                  <i class="fas fa-trash" v-if="excluindo !== produto.id"></i>
                  <i class="fas fa-spinner fa-spin" v-else></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5">
        <i class="fas fa-search fa-3x text-muted mb-3"></i>
        <h4 class="text-muted">Nenhum produto encontrado</h4>
        <p class="text-muted">
          {{ produtos.length === 0 ? 'Clique em "Novo Produto" para começar' : 'Tente ajustar os filtros' }}
        </p>
      </div>
    </div>

    <!-- Modal de formulário -->
    <ModalProduto 
      v-if="modalAberto"
      :produto="produtoEditando"
      :salvando="salvando"
      @salvar="salvarProduto"
      @cancelar="fecharModal"
    />

    <!-- Toast de notificação -->
    <ToastNotificacao 
      v-if="toast.visivel"
      :tipo="toast.tipo"
      :mensagem="toast.mensagem"
      @fechar="toast.visivel = false"
    />
  </div>
</template>

<script>
import { ProdutoService } from '@/services/ProdutoService'
import ModalProduto from '@/components/ModalProduto.vue'
import ToastNotificacao from '@/components/ToastNotificacao.vue'

export default {
  name: 'ProdutosView',
  components: {
    ModalProduto,
    ToastNotificacao
  },
  data() {
    return {
      produtos: [],
      carregando: false,
      erro: null,
      salvando: false,
      excluindo: null,
      modalAberto: false,
      produtoEditando: null,
      filtros: {
        pesquisa: '',
        precoMin: null,
        precoMax: null
      },
      toast: {
        visivel: false,
        tipo: 'success',
        mensagem: ''
      }
    }
  },
  computed: {
    produtosFiltrados() {
      return this.produtos.filter(produto => {
        const matchPesquisa = produto.nome.toLowerCase()
          .includes(this.filtros.pesquisa.toLowerCase())
        
        const matchPrecoMin = !this.filtros.precoMin || 
          produto.preco >= this.filtros.precoMin
        
        const matchPrecoMax = !this.filtros.precoMax || 
          produto.preco <= this.filtros.precoMax
        
        return matchPesquisa && matchPrecoMin && matchPrecoMax
      })
    }
  },
  async mounted() {
    await this.carregarProdutos()
  },
  methods: {
    async carregarProdutos() {
      this.carregando = true
      this.erro = null
      
      const resultado = await ProdutoService.listarTodos()
      
      if (resultado.sucesso) {
        this.produtos = resultado.dados
      } else {
        this.erro = resultado.mensagem
      }
      
      this.carregando = false
    },

    abrirModal(produto = null) {
      this.produtoEditando = produto ? { ...produto } : {
        nome: '',
        preco: 0,
        estoque: 0
      }
      this.modalAberto = true
    },

    fecharModal() {
      this.modalAberto = false
      this.produtoEditando = null
    },

    async salvarProduto(produto) {
      this.salvando = true
      
      let resultado
      
      if (produto.id) {
        // Atualizar produto existente
        resultado = await ProdutoService.atualizar(produto.id, produto)
      } else {
        // Criar novo produto
        resultado = await ProdutoService.criar(produto)
      }
      
      if (resultado.sucesso) {
        this.mostrarToast('success', resultado.mensagem)
        this.fecharModal()
        await this.carregarProdutos()
      } else {
        this.mostrarToast('error', resultado.mensagem)
      }
      
      this.salvando = false
    },

    async confirmarExclusao(produto) {
      const confirmou = confirm(
        `Tem certeza que deseja excluir o produto "${produto.nome}"?`
      )
      
      if (confirmou) {
        await this.excluirProduto(produto.id)
      }
    },

    async excluirProduto(id) {
      this.excluindo = id
      
      const resultado = await ProdutoService.excluir(id)
      
      if (resultado.sucesso) {
        this.mostrarToast('success', resultado.mensagem)
        await this.carregarProdutos()
      } else {
        this.mostrarToast('error', resultado.mensagem)
      }
      
      this.excluindo = null
    },

    mostrarToast(tipo, mensagem) {
      this.toast = {
        visivel: true,
        tipo,
        mensagem
      }
      
      // Auto-hide após 5 segundos
      setTimeout(() => {
        this.toast.visivel = false
      }, 5000)
    }
  }
}
</script>

<style scoped>
.produto-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.produto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
```

---

### Componente Modal de Formulário

#### `src/components/ModalProduto.vue`
```vue
<template>
  <div class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <form @submit.prevent="handleSubmit">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-box me-2"></i>
              {{ produto.id ? 'Editar Produto' : 'Novo Produto' }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="$emit('cancelar')"
              :disabled="salvando"
            ></button>
          </div>
          
          <div class="modal-body">
            <div class="row g-3">
              <!-- Nome do produto -->
              <div class="col-12">
                <label class="form-label">
                  Nome do Produto <span class="text-danger">*</span>
                </label>
                <input 
                  v-model.trim="form.nome"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': erros.nome }"
                  placeholder="Digite o nome do produto"
                  maxlength="100"
                  required
                >
                <div class="invalid-feedback" v-if="erros.nome">
                  {{ erros.nome }}
                </div>
              </div>

              <!-- Preço -->
              <div class="col-md-6">
                <label class="form-label">
                  Preço <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text">R$</span>
                  <input 
                    v-model.number="form.preco"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': erros.preco }"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    required
                  >
                </div>
                <div class="invalid-feedback" v-if="erros.preco">
                  {{ erros.preco }}
                </div>
              </div>

              <!-- Estoque -->
              <div class="col-md-6">
                <label class="form-label">
                  Quantidade em Estoque <span class="text-danger">*</span>
                </label>
                <input 
                  v-model.number="form.estoque"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': erros.estoque }"
                  min="0"
                  placeholder="0"
                  required
                >
                <div class="invalid-feedback" v-if="erros.estoque">
                  {{ erros.estoque }}
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="mt-4">
              <h6>Preview:</h6>
              <div class="card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="card-title">{{ form.nome || 'Nome do produto' }}</h6>
                      <span class="h5 text-primary">R$ {{ form.preco?.toFixed(2) || '0.00' }}</span>
                    </div>
                    <span 
                      class="badge"
                      :class="form.estoque > 10 ? 'bg-success' : form.estoque > 0 ? 'bg-warning' : 'bg-danger'"
                    >
                      {{ form.estoque || 0 }} un.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="$emit('cancelar')"
              :disabled="salvando"
            >
              Cancelar
            </button>
            
            <button 
              type="submit"
              class="btn btn-primary"
              :disabled="!formularioValido || salvando"
            >
              <span v-if="salvando" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-save me-2"></i>
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalProduto',
  props: {
    produto: {
      type: Object,
      required: true
    },
    salvando: {
      type: Boolean,
      default: false
    }
  },
  emits: ['salvar', 'cancelar'],
  data() {
    return {
      form: {
        nome: '',
        preco: 0,
        estoque: 0
      },
      erros: {}
    }
  },
  computed: {
    formularioValido() {
      return this.form.nome.trim().length > 0 && 
             this.form.preco >= 0 && 
             this.form.estoque >= 0 &&
             Object.keys(this.erros).length === 0
    }
  },
  watch: {
    produto: {
      immediate: true,
      handler(novoProduto) {
        this.form = {
          id: novoProduto.id,
          nome: novoProduto.nome || '',
          preco: novoProduto.preco || 0,
          estoque: novoProduto.estoque || 0
        }
        this.erros = {}
      }
    },
    'form.nome'() {
      this.validarNome()
    },
    'form.preco'() {
      this.validarPreco()
    },
    'form.estoque'() {
      this.validarEstoque()
    }
  },
  methods: {
    validarNome() {
      if (!this.form.nome.trim()) {
        this.erros.nome = 'Nome é obrigatório'
      } else if (this.form.nome.trim().length < 2) {
        this.erros.nome = 'Nome deve ter pelo menos 2 caracteres'
      } else {
        delete this.erros.nome
      }
    },

    validarPreco() {
      if (this.form.preco < 0) {
        this.erros.preco = 'Preço não pode ser negativo'
      } else if (this.form.preco === 0) {
        this.erros.preco = 'Preço deve ser maior que zero'
      } else {
        delete this.erros.preco
      }
    },

    validarEstoque() {
      if (this.form.estoque < 0) {
        this.erros.estoque = 'Estoque não pode ser negativo'
      } else {
        delete this.erros.estoque
      }
    },

    handleSubmit() {
      // Validar tudo antes de enviar
      this.validarNome()
      this.validarPreco()
      this.validarEstoque()

      if (this.formularioValido) {
        this.$emit('salvar', { ...this.form })
      }
    }
  }
}
</script>

<style scoped>
.modal {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-dialog {
  animation: slideIn 0.15s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
  }
  to {
    transform: translateY(0);
  }
}
</style>
```

---

### Exercícios Práticos

#### Exercício 1: Bulk Operations
Implementar funcionalidades de operação em lote:
- Seleção múltipla de produtos (checkboxes)
- Exclusão em lote
- Atualização de preços em lote (desconto/acréscimo percentual)
- Export/Import via CSV

#### Exercício 2: Filtros Avançados
Expandir o sistema de filtros:
- Filtro por data de criação
- Ordenação por nome, preço, estoque
- Filtros salvos (favoritos)
- Busca por código de barras

#### Exercício 3: Histórico de Alterações
Implementar auditoria:
- Log de todas as operações (criar, editar, excluir)
- Comparação entre versões
- Desfazer última operação
- Relatório de atividades

---

### Melhorias de UX/UI

#### Loading States Inteligentes
```vue
<!-- Skeleton loading para lista -->
<template v-if="carregando">
  <div class="row">
    <div v-for="i in 6" :key="i" class="col-lg-4 col-md-6 mb-4">
      <div class="card">
        <div class="card-body">
          <div class="placeholder-glow">
            <span class="placeholder col-8 mb-2"></span>
            <span class="placeholder col-4 mb-3"></span>
            <span class="placeholder col-6 mb-2"></span>
            <span class="placeholder col-12"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

#### Confirmações Visuais
```vue
<button 
  @click="excluirProduto(produto)"
  class="btn btn-outline-danger btn-sm"
  :class="{ 'btn-danger': confirmandoExclusao === produto.id }"
>
  <span v-if="confirmandoExclusao !== produto.id">
    <i class="fas fa-trash"></i> Excluir
  </span>
  <span v-else>
    <i class="fas fa-question-circle"></i> Confirmar?
  </span>
</button>
```

---

### Integração com Backend Flask

#### Testando a API
Certifique-se de que o backend Flask está rodando e teste os endpoints:

```bash
# Testar listagem
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:5000/api/produtos

# Testar criação
curl -X POST -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" \
     -d '{"nome":"Produto Teste","preco":99.99,"estoque":10}' \
     http://localhost:5000/api/produtos
```

#### Tratamento de Erros da API Flask
```javascript
// Em ProdutoService.js
static tratarErroFlask(error) {
  if (error.response?.data?.message) {
    // Erro específico do Flask
    return error.response.data.message
  } else if (error.response?.data?.error) {
    // Erro de validação do Flask-WTF
    return error.response.data.error
  } else {
    return this.tratarErro(error)
  }
}
```

---

### Branch Git e Deploy
```bash
# Criar branch da aula
git checkout master
git pull origin master
git checkout -b aula-06-crud

# Adicionar arquivos
git add .
git commit -m "Aula 6 - CRUD completo de Produtos integrado com Flask"

# Push da branch
git push -u origin aula-06-crud
```

---

### Checklist de Verificação

- [ ] Serviço ProdutoService funcionando
- [ ] Listagem de produtos carregando da API
- [ ] Criação de produtos salvando no banco
- [ ] Edição de produtos funcionando
- [ ] Exclusão de produtos com confirmação
- [ ] Estados de loading implementados
- [ ] Tratamento de erros funcionando
- [ ] Validações client-side implementadas
- [ ] UX responsiva e intuitiva
- [ ] Filtros e pesquisa funcionando

---

### Próxima Aula

Na **Aula 7** veremos:
- Sistema completo de autenticação
- Login e logout com JWT
- Proteção de rotas
- Guards de autenticação
- Gestão de sessão de usuário