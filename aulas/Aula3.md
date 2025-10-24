# Aula 3 — Comunicação com API (Axios)

## Objetivos
- Entender o que são APIs e como funcionam
- Instalar e configurar o Axios
- Fazer requisições GET e POST
- Trabalhar com estados de loading e erro
- Gerenciar dados assíncronos em componentes Vue

---

## O que é uma API?

**API** (Application Programming Interface) é uma forma de dois sistemas se comunicarem. No nosso caso:
- **Frontend (Vue.js)**: Interface que o usuário vê
- **Backend (Servidor)**: Onde ficam os dados e a lógica de negócio

### Analogia do Restaurante
- **Cliente (Frontend)**: Você fazendo o pedido
- **Garçom (API)**: Leva seu pedido para a cozinha e traz a comida
- **Cozinha (Backend)**: Prepara seu pedido

---

## Métodos HTTP Principais

| Método | Ação | Exemplo |
|--------|------|---------|
| **GET** | Buscar dados | Listar produtos |
| **POST** | Criar novo dado | Cadastrar produto |
| **PUT** | Atualizar completamente | Editar produto inteiro |
| **PATCH** | Atualizar parcialmente | Mudar só o preço |
| **DELETE** | Deletar | Remover produto |

---

## Instalando Axios

O **Axios** é uma biblioteca JavaScript para fazer requisições HTTP de forma fácil.

```bash
npm install axios
```

### Por que usar Axios?

✅ Mais fácil que `fetch` nativo  
✅ Conversão automática para JSON  
✅ Suporta interceptadores (adicionar token, tratar erros)  
✅ Funciona no navegador e Node.js  

---

## Configuração Básica do Axios

### 1. Criar instância configurada

Crie o arquivo `src/services/api.js`:

```javascript
import axios from 'axios'

// Cria uma instância do axios com configuração padrão
const api = axios.create({
  baseURL: 'http://localhost:5000', // URL do seu backend
  timeout: 5000, // Tempo máximo de espera (5 segundos)
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
```

**Explicação:**
- `baseURL`: URL base do seu backend (não precisa repetir em todas as requisições)
- `timeout`: Cancela requisição se demorar mais que 5 segundos
- `headers`: Informações extras enviadas em toda requisição

---

### 2. Criar Service (Camada de Serviço)

Crie o arquivo `src/services/ProdutosService.js`:

```javascript
import api from './api'

export default {
  // Buscar todos os produtos
  async listar() {
    try {
      const response = await api.get('/api/produtos')
      return { sucesso: true, dados: response.data }
    } catch (erro) {
      return { 
        sucesso: false, 
        mensagem: erro.response?.data?.mensagem || erro.message 
      }
    }
  },

  // Buscar produto específico
  async buscarPorId(id) {
    try {
      const response = await api.get(`/api/produtos/${id}`)
      return { sucesso: true, dados: response.data }
    } catch (erro) {
      return { sucesso: false, mensagem: erro.message }
    }
  },

  // Criar novo produto
  async criar(produto) {
    try {
      const response = await api.post('/api/produtos', produto)
      return { sucesso: true, dados: response.data }
    } catch (erro) {
      return { sucesso: false, mensagem: erro.message }
    }
  },

  // Atualizar produto
  async atualizar(id, produto) {
    try {
      const response = await api.put(`/api/produtos/${id}`, produto)
      return { sucesso: true, dados: response.data }
    } catch (erro) {
      return { sucesso: false, mensagem: erro.message }
    }
  },

  // Deletar produto
  async deletar(id) {
    try {
      await api.delete(`/api/produtos/${id}`)
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, mensagem: erro.message }
    }
  }
}
```

**Vantagens do Service:**
- Centraliza toda a lógica de API em um só lugar
- Facilita manutenção (se mudar a URL, muda só aqui)
- Padroniza tratamento de erros
- Facilita testes

---

## Usando no Componente Vue

### Padrão de Estados Assíncronos

Todo componente que faz requisições deve ter 3 estados:

```javascript
data() {
  return {
    carregando: false,  // True quando está fazendo requisição
    erro: null,         // Mensagem de erro (se houver)
    dados: null         // Dados recebidos da API
  }
}
```

### Exemplo Completo - Listar Produtos

```vue
<template>
  <div class="lista-produtos">
    <h2>Produtos</h2>

    <!-- Estado: Carregando -->
    <div v-if="carregando" class="text-center">
      <div class="spinner"></div>
      <p>Carregando produtos...</p>
    </div>

    <!-- Estado: Erro -->
    <div v-else-if="erro" class="alert alert-danger">
      <strong>Erro:</strong> {{ erro }}
      <button @click="buscarProdutos">Tentar novamente</button>
    </div>

    <!-- Estado: Sucesso -->
    <div v-else-if="produtos.length > 0">
      <div v-for="produto in produtos" :key="produto.id" class="produto-card">
        <h4>{{ produto.nome }}</h4>
        <p>{{ produto.descricao }}</p>
        <p><strong>R$ {{ produto.preco.toFixed(2) }}</strong></p>
      </div>
    </div>

    <!-- Estado: Vazio -->
    <div v-else class="text-center">
      <p>Nenhum produto encontrado</p>
    </div>
  </div>
</template>

<script>
import ProdutosService from '../services/ProdutosService'

export default {
  name: 'ListaProdutos',
  data() {
    return {
      carregando: false,
      erro: null,
      produtos: []
    }
  },
  mounted() {
    // Busca produtos quando o componente é montado
    this.buscarProdutos()
  },
  methods: {
    async buscarProdutos() {
      // 1. Inicia loading e limpa erro anterior
      this.carregando = true
      this.erro = null

      // 2. Faz a requisição
      const resposta = await ProdutosService.listar()

      // 3. Trata a resposta
      if (resposta.sucesso) {
        this.produtos = resposta.dados
      } else {
        this.erro = resposta.mensagem
      }

      // 4. Finaliza loading
      this.carregando = false
    }
  }
}
</script>
```

**Explicação do Fluxo:**
1. **mounted()**: Executado quando o componente aparece na tela
2. **carregando = true**: Mostra spinner de loading
3. **await**: Espera a resposta da API
4. **if sucesso**: Armazena dados OU erro
5. **carregando = false**: Esconde spinner

---

## Exemplo - Criar Produto (POST)

```vue
<template>
  <form @submit.prevent="criarProduto">
    <input v-model="novoProduto.nome" placeholder="Nome" required>
    <input v-model="novoProduto.descricao" placeholder="Descrição" required>
    <input v-model.number="novoProduto.preco" type="number" step="0.01" placeholder="Preço" required>
    
    <button type="submit" :disabled="carregando">
      {{ carregando ? 'Salvando...' : 'Salvar Produto' }}
    </button>

    <p v-if="mensagem" :class="{ 'text-success': sucesso, 'text-danger': !sucesso }">
      {{ mensagem }}
    </p>
  </form>
</template>

<script>
import ProdutosService from '../services/ProdutosService'

export default {
  data() {
    return {
      carregando: false,
      mensagem: '',
      sucesso: false,
      novoProduto: {
        nome: '',
        descricao: '',
        preco: 0
      }
    }
  },
  methods: {
    async criarProduto() {
      this.carregando = true
      this.mensagem = ''

      const resposta = await ProdutosService.criar(this.novoProduto)

      if (resposta.sucesso) {
        this.sucesso = true
        this.mensagem = 'Produto criado com sucesso!'
        // Limpa o formulário
        this.novoProduto = { nome: '', descricao: '', preco: 0 }
        // Opcional: Emitir evento para atualizar lista
        this.$emit('produto-criado', resposta.dados)
      } else {
        this.sucesso = false
        this.mensagem = `Erro: ${resposta.mensagem}`
      }

      this.carregando = false
    }
  }
}
</script>
```

---

## Tratamento de Erros Comuns

### 1. Erro de CORS

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**O que é:** O navegador bloqueia requisições de um domínio para outro por segurança.

**Solução:** Configurar CORS no backend (Flask/Express):

```python
# Flask
from flask_cors import CORS
CORS(app)
```

---

### 2. Erro 404 (Não encontrado)

```
Request failed with status code 404
```

**Causas comuns:**
- URL incorreta no `baseURL` ou na rota
- Backend não está rodando
- Endpoint não existe no backend

**Solução:**
- Verifique se o backend está rodando
- Teste a URL no navegador ou Postman

---

### 3. Erro de Timeout

```
timeout of 5000ms exceeded
```

**Causa:** Requisição demorou mais que o tempo configurado.

**Solução:**
- Aumentar o `timeout` no `api.js`
- Verificar se o backend está lento

---

### 4. Network Error

```
Network Error
```

**Causas:**
- Backend não está rodando
- URL errada
- Problemas de rede/firewall

**Solução:**
- Rode o backend
- Verifique a URL no `baseURL`

---

## Async/Await vs Promises

### Com Promises (.then)

```javascript
ProdutosService.listar()
  .then(resposta => {
    if (resposta.sucesso) {
      this.produtos = resposta.dados
    }
  })
  .catch(erro => {
    this.erro = erro.message
  })
```

### Com Async/Await (Recomendado)

```javascript
async buscarProdutos() {
  try {
    const resposta = await ProdutosService.listar()
    if (resposta.sucesso) {
      this.produtos = resposta.dados
    }
  } catch (erro) {
    this.erro = erro.message
  }
}
```

**Por que async/await é melhor?**
- Código mais limpo e legível
- Mais fácil de entender o fluxo
- Trata erros com try/catch

---

## Exercícios Práticos

### Exercício 1: Testar Conexão com API

Crie um componente simples que testa a conexão com uma API pública.

**Veja passo-a-passo completo em:** `Exercicio1.md`

---

### Exercício 2: Buscar e Exibir Dados

Crie um componente que busca uma lista de dados de uma API e exibe em cards.

**Veja dicas e orientações em:** `Exercicio2.md`

---

### Exercício 3: CRUD Simples

Crie uma aplicação completa de cadastro de produtos com:
- Listar produtos
- Criar novo produto
- Editar produto
- Deletar produto

**Veja dicas e orientações em:** `Exercicio3.md`

---

## Conceitos-Chave

✅ **API**: Interface para comunicação entre sistemas

✅ **Axios**: Biblioteca para fazer requisições HTTP

✅ **GET**: Buscar dados  
✅ **POST**: Criar dados  
✅ **PUT/PATCH**: Atualizar dados  
✅ **DELETE**: Deletar dados

✅ **Service**: Camada que centraliza lógica de API

✅ **Estados Assíncronos**:
- `carregando`: mostra spinner
- `erro`: mostra mensagem de erro
- `dados`: renderiza informações

✅ **Async/Await**: Forma moderna de trabalhar com código assíncrono

✅ **Try/Catch**: Trata erros em código assíncrono

---

## Próxima Aula

**Aula 4 - Vue Router e Navegação:**
- Configurar rotas
- Navegação entre páginas
- Parâmetros de rota
- Guards de navegação

---

## Recursos

📚 **Documentação:**
- [Axios](https://axios-http.com/docs/intro)
- [MDN - Fetch API](https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API)
- [HTTP Methods](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Methods)

🔧 **Ferramentas:**
- [JSON Placeholder](https://jsonplaceholder.typicode.com/) - API pública para testes
- [Postman](https://www.postman.com/) - Testar APIs
- [Vue DevTools](https://devtools.vuejs.org/) - Debug de componentes

💡 **Dica:** Sempre teste suas APIs com Postman antes de usar no Vue!
