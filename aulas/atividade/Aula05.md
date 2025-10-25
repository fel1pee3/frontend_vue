Aula 6 - CRUD de Produtos: Integração Completa com API
Objetivo da Aula
Entender como implementar operações CRUD completas (Create, Read, Update, Delete) em Vue.js, integrando com uma API backend. Esta aula documenta a implementação prática do sistema de gerenciamento de produtos.

Visão Geral: O Que é CRUD?
CRUD significa:

Create (Criar): POST - Adiciona novo produto
Read (Ler): GET - Busca produtos existentes
Update (Atualizar): PUT - Modifica produto existente
Delete (Deletar): DELETE - Remove produto
Endpoints da API Flask
Operação	Método	Endpoint	Descrição
Listar todos	GET	/api/produtos	Retorna lista de produtos
Buscar um	GET	/api/produtos/{id}	Retorna um produto específico
Criar	POST	/api/produtos	Adiciona novo produto
Atualizar	PUT	/api/produtos/{id}	Modifica produto existente
Excluir	DELETE	/api/produtos/{id}	Remove produto
Arquitetura da Solução
Fluxo de Dados
Frontend Vue.js
    ↓
ProdutoService.js (utilitário)
    ↓
axios (HTTP client)
    ↓
API Flask Backend
    ↓
Banco de Dados
Componentes Necessários
src/services/ProdutoService.js - Lógica de comunicação com API
src/views/ProdutosView.vue - Página principal com listagem
src/components/ModalProduto.vue - Modal para criar/editar
src/components/ToastNotificacao.vue - Notificações visuais
1. Serviço de Produtos (ProdutoService.js)
O arquivo src/services/ProdutoService.js centraliza toda a comunicação com a API.

Por Que Separar em Serviço?
Lógica de API fica isolada
Fácil de testar
Pode ser reutilizado em múltiplos componentes
Mudanças na API afetam apenas um arquivo
Implementação Completa
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

// Configuração do axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptador: adiciona token JWT automaticamente
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

// Interceptador: trata erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirou ou inválido
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export class ProdutoService {
  
  // Método 1: Listar todos os produtos
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

  // Método 2: Buscar produto por ID
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

  // Método 3: Criar novo produto
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

  // Método 4: Atualizar produto existente
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

  // Método 5: Excluir produto
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

  // Método auxiliar: Interpreta erros da API
  static tratarErro(error) {
    if (error.response) {
      // Erro da API com resposta
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
      // Erro de rede (sem resposta do servidor)
      return 'Erro de conexão. Verifique se o backend está rodando.'
    } else {
      // Outro tipo de erro
      return 'Erro inesperado'
    }
  }
}
Entendendo os Métodos
Cada método segue o mesmo padrão:

static async metodoExemplo() {
  try {
    // Tenta fazer a requisição
    const response = await api.get('/endpoint')
    return {
      sucesso: true,
      dados: response.data,
      mensagem: 'Sucesso!'
    }
  } catch (error) {
    // Se falhar, trata o erro
    return {
      sucesso: false,
      dados: null,
      mensagem: this.tratarErro(error)
    }
  }
}
Por que sempre retorna um objeto com sucesso, dados e mensagem?

Componente sabe se funcionou (sucesso: true/false)
Tem os dados para exibir (dados)
Tem mensagem para mostrar ao usuário (mensagem)
2. Componente de Listagem (ProdutosView.vue)
Localização: src/views/ProdutosView.vue

Este é o componente principal que:

Carrega a lista de produtos
Exibe em grid/tabela
Permite criar, editar e deletar
Implementa filtros e busca
Estrutura do Estado (data)
data() {
  return {
    produtos: [],           // Array com todos os produtos
    carregando: false,      // Enquanto busca da API
    erro: null,            // Mensagem de erro se falhar
    salvando: false,       // Enquanto salva novo produto
    excluindo: null,       // ID do produto sendo excluído
    modalAberto: false,    // Se modal de criar/editar está visível
    produtoEditando: null, // Produto sendo editado
    filtros: {
      pesquisa: '',        // Texto de busca
      precoMin: null,      // Preço mínimo
      precoMax: null       // Preço máximo
    },
    toast: {
      visivel: false,
      tipo: 'success',
      mensagem: ''
    }
  }
}
Ciclo de Vida (mounted)
async mounted() {
  // Quando componente carrega, busca os produtos
  await this.carregarProdutos()
}
Método: Carregar Produtos
async carregarProdutos() {
  this.carregando = true    // Mostra loading
  this.erro = null          // Limpa erro anterior
  
  const resultado = await ProdutoService.listarTodos()
  
  if (resultado.sucesso) {
    this.produtos = resultado.dados  // Armazena produtos
  } else {
    this.erro = resultado.mensagem   // Armazena erro
  }
  
  this.carregando = false   // Esconde loading
}
Computada: Filtrar Produtos
computed: {
  produtosFiltrados() {
    return this.produtos.filter(produto => {
      // Filtro 1: Pesquisa por nome
      const matchPesquisa = produto.nome.toLowerCase()
        .includes(this.filtros.pesquisa.toLowerCase())
      
      // Filtro 2: Preço mínimo
      const matchPrecoMin = !this.filtros.precoMin || 
        produto.preco >= this.filtros.precoMin
      
      // Filtro 3: Preço máximo
      const matchPrecoMax = !this.filtros.precoMax || 
        produto.preco <= this.filtros.precoMax
      
      // Retorna true se passa em TODOS os filtros
      return matchPesquisa && matchPrecoMin && matchPrecoMax
    })
  }
}
Método: Salvar Produto
async salvarProduto(produto) {
  this.salvando = true
  
  let resultado
  
  if (produto.id) {
    // EDITAR produto existente
    resultado = await ProdutoService.atualizar(produto.id, produto)
  } else {
    // CRIAR novo produto
    resultado = await ProdutoService.criar(produto)
  }
  
  if (resultado.sucesso) {
    this.mostrarToast('success', resultado.mensagem)
    this.fecharModal()
    await this.carregarProdutos()  // Recarrega lista
  } else {
    this.mostrarToast('error', resultado.mensagem)
  }
  
  this.salvando = false
}
Método: Excluir Produto
async confirmarExclusao(produto) {
  // Pede confirmação ao usuário
  const confirmou = confirm(
    `Tem certeza que deseja excluir "${produto.nome}"?`
  )
  
  if (confirmou) {
    await this.excluirProduto(produto.id)
  }
}

async excluirProduto(id) {
  this.excluindo = id  // Marca qual está sendo excluído
  
  const resultado = await ProdutoService.excluir(id)
  
  if (resultado.sucesso) {
    this.mostrarToast('success', resultado.mensagem)
    await this.carregarProdutos()  // Recarrega lista
  } else {
    this.mostrarToast('error', resultado.mensagem)
  }
  
  this.excluindo = null  // Desmarca
}
3. Modal de Produto (ModalProduto.vue)
Localização: src/components/ModalProduto.vue

Este componente é responsável por criar e editar produtos.

Props Recebidas
props: {
  produto: {           // Produto para editar (null = novo)
    type: Object,
    required: true
  },
  salvando: {          // Se está salvando
    type: Boolean,
    default: false
  }
}
Estados do Modal
data() {
  return {
    form: {
      nome: '',
      preco: 0,
      estoque: 0
    },
    erros: {}  // Erros de validação por campo
  }
}
Watch: Monitorar Mudanças
watch: {
  // Quando prop 'produto' muda, atualiza form
  produto: {
    immediate: true,  // Executa logo ao montar
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
  
  // Valida enquanto digita
  'form.nome'() { this.validarNome() },
  'form.preco'() { this.validarPreco() },
  'form.estoque'() { this.validarEstoque() }
}
Validações
validarNome() {
  if (!this.form.nome.trim()) {
    this.erros.nome = 'Nome é obrigatório'
  } else if (this.form.nome.trim().length < 2) {
    this.erros.nome = 'Nome deve ter pelo menos 2 caracteres'
  } else {
    delete this.erros.nome
  }
}

validarPreco() {
  if (this.form.preco < 0) {
    this.erros.preco = 'Preço não pode ser negativo'
  } else if (this.form.preco === 0) {
    this.erros.preco = 'Preço deve ser maior que zero'
  } else {
    delete this.erros.preco
  }
}

validarEstoque() {
  if (this.form.estoque < 0) {
    this.erros.estoque = 'Estoque não pode ser negativo'
  } else {
    delete this.erros.estoque
  }
}
Computada: Formulário Válido
computed: {
  formularioValido() {
    return (
      this.form.nome.trim().length > 0 &&
      this.form.preco > 0 &&
      this.form.estoque >= 0 &&
      Object.keys(this.erros).length === 0
    )
  }
}
Emissão de Eventos
// Quando clica em Salvar
handleSubmit() {
  // Valida tudo antes de enviar
  this.validarNome()
  this.validarPreco()
  this.validarEstoque()

  if (this.formularioValido) {
    // Emite evento 'salvar' para ProdutosView
    this.$emit('salvar', { ...this.form })
  }
}

// Quando clica em Cancelar
// Template faz: @click="$emit('cancelar')"
4. Toast de Notificação (ToastNotificacao.vue)
Localização: src/components/ToastNotificacao.vue

Componente simples para mostrar mensagens de sucesso/erro.

Props
props: {
  tipo: {           // 'success' ou 'error'
    type: String,
    default: 'success'
  },
  mensagem: {       // Texto a exibir
    type: String,
    required: true
  }
}
Implementação Básica
<template>
  <div class="toast-container">
    <div class="alert" :class="classe">
      {{ mensagem }}
      <button class="btn-close" @click="$emit('fechar')"></button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tipo: { type: String, default: 'success' },
    mensagem: { type: String, required: true }
  },
  emits: ['fechar'],
  computed: {
    classe() {
      return this.tipo === 'success' 
        ? 'alert-success' 
        : 'alert-danger'
    }
  }
}
</script>
Fluxo Completo: Criando um Produto
Passo 1: User clica "Novo Produto"
// Em ProdutosView.vue
abrirModal(produto = null) {
  this.produtoEditando = produto ? { ...produto } : {
    nome: '',
    preco: 0,
    estoque: 0
  }
  this.modalAberto = true
}
Passo 2: Modal abre
<!-- Em ProdutosView.vue template -->
<ModalProduto 
  v-if="modalAberto"
  :produto="produtoEditando"
  :salvando="salvando"
  @salvar="salvarProduto"
  @cancelar="fecharModal"
/>
Passo 3: User preenche formulário
Digita nome, preço, estoque
Watch valida cada campo
Botão Salvar fica habilitado se válido
Passo 4: User clica "Salvar"
// Em ModalProduto.vue
handleSubmit() {
  // Valida tudo
  this.validarNome()
  this.validarPreco()
  this.validarEstoque()

  if (this.formularioValido) {
    // Emite para ProdutosView
    this.$emit('salvar', { ...this.form })
  }
}
Passo 5: ProdutosView recebe evento
// Em ProdutosView.vue
async salvarProduto(produto) {
  this.salvando = true
  
  // Decide: criar ou atualizar?
  const resultado = produto.id
    ? await ProdutoService.atualizar(produto.id, produto)
    : await ProdutoService.criar(produto)
  
  if (resultado.sucesso) {
    // Mostra notificação
    this.mostrarToast('success', resultado.mensagem)
    // Fecha modal
    this.fecharModal()
    // Recarrega lista
    await this.carregarProdutos()
  }
  
  this.salvando = false
}
Passo 6: ProdutoService faz requisição
// Em ProdutoService.js
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
Passo 7: Backend recebe POST
POST /api/produtos
Content-Type: application/json

{
  "nome": "Novo Produto",
  "preco": 99.99,
  "estoque": 10
}
Backend cria no banco e retorna com ID.

Passo 8: Frontend atualiza lista
// Volta para ProdutosView.salvarProduto()
await this.carregarProdutos()
// Isso chama ProdutoService.listarTodos()
// Que faz GET /api/produtos
// Recebe lista atualizada com novo produto
Como Executar
1. Certifique-se que Backend Está Rodando
cd backend
python app.py
# Deve estar em http://localhost:5000
2. Instale Dependências Frontend
cd frontend_vue
npm install
3. Rode o Servidor Frontend
npm run dev
# Abre em http://localhost:5173
4. Testando a API
# Ver todos os produtos
curl -H "Authorization: Bearer SEU_TOKEN" \
     http://localhost:5000/api/produtos

# Criar novo produto
curl -X POST \
     -H "Authorization: Bearer SEU_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"nome":"Teste","preco":99.99,"estoque":10}' \
     http://localhost:5000/api/produtos
Estados de Loading
Padrão 1: Loading Global
<div v-if="carregando" class="spinner-border"></div>
<div v-else-if="erro" class="alert alert-danger">{{ erro }}</div>
<div v-else><!-- Conteúdo --></div>
Padrão 2: Loading por Item
<button 
  :disabled="excluindo === produto.id"
  @click="excluirProduto(produto.id)"
>
  <span v-if="excluindo === produto.id" class="spinner-border"></span>
  <span v-else>Excluir</span>
</button>
Padrão 3: Skeleton Loading
<div v-if="carregando" class="placeholder-glow">
  <span class="placeholder col-12 mb-2"></span>
  <span class="placeholder col-6"></span>
</div>
Tratamento de Erros
Erros de Rede
Ocorre quando backend não está acessível:

// Em ProdutoService.js
else if (error.request) {
  return 'Erro de conexão. Verifique se o backend está rodando.'
}
Erros da API
Quando backend retorna erro (4xx ou 5xx):

if (error.response?.status === 404) {
  return 'Produto não encontrado'
}
Erros de Validação
Quando dados são inválidos:

case 400:
  return error.response.data.message || 'Dados inválidos'
Exercícios
Exercício 1: Implementar bulk operations (ações em lote)
Exercício 2: Adicionar filtros avançados e ordenação
Exercício 3: Criar histórico de alterações