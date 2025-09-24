## Aula 3 — Comunicação com API (Integrando com Flask)

### Objetivos
- Compreender requisições HTTP no frontend
- Configurar Axios para comunicação com APIs
- Implementar interceptadores para tratamento global
- Conectar com os endpoints do Flask backend
- Gerenciar estados de loading, sucesso e erro
- Trabalhar com dados assíncronos de forma reativa

---

### Introdução às APIs REST

#### Conceitos Fundamentais

**REST (Representational State Transfer)** é um estilo arquitetural para APIs web:

| Método HTTP | Propósito | Exemplo |
|-------------|-----------|---------|
| **GET** | Buscar dados | `GET /api/produtos` |
| **POST** | Criar recurso | `POST /api/produtos` |
| **PUT** | Atualizar completo | `PUT /api/produtos/1` |
| **PATCH** | Atualização parcial | `PATCH /api/produtos/1` |
| **DELETE** | Remover recurso | `DELETE /api/produtos/1` |

#### Status HTTP Importantes
- **200**: Sucesso
- **201**: Criado com sucesso  
- **400**: Erro de validação
- **401**: Não autorizado
- **404**: Não encontrado
- **500**: Erro interno do servidor

---

### Configuração do Axios

#### Instalação e Configuração Base

```javascript
// src/services/api.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000'

// Instância base do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptador de requisições
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Fazendo requisição:', config.method?.toUpperCase(), config.url)
    
    // Adicionar token JWT se existir
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Adicionar timestamp para debug
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    console.error('❌ Erro na configuração da requisição:', error)
    return Promise.reject(error)
  }
)

// Interceptador de respostas
api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime
    console.log(
      '✅ Resposta recebida:', 
      response.status, 
      response.config.url,
      `(${duration}ms)`
    )
    return response
  },
  (error) => {
    const duration = error.config?.metadata ? 
      new Date() - error.config.metadata.startTime : 0
    
    console.error(
      '❌ Erro na resposta:', 
      error.response?.status || 'Network Error',
      error.config?.url,
      `(${duration}ms)`
    )
    
    // Tratamento global de erros
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api
```

---

### Serviço para Dados Básicos

#### `src/services/DadosService.js`

```javascript
import api from './api'

export class DadosService {
  /**
   * Busca dados básicos da API (equivalente ao endpoint Flask /api/dados)
   */
  static async obterDados() {
    try {
      const response = await api.get('/api/dados')
      return {
        sucesso: true,
        dados: response.data,
        mensagem: 'Dados carregados com sucesso'
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
   * Testa conectividade com o backend
   */
  static async testarConexao() {
    try {
      const response = await api.get('/api/dados', { 
        timeout: 3000 // Timeout menor para teste rápido
      })
      return {
        sucesso: true,
        conectado: true,
        status: response.status,
        mensagem: 'Backend conectado e funcionando'
      }
    } catch (error) {
      return {
        sucesso: false,
        conectado: false,
        status: error.response?.status || 0,
        mensagem: error.code === 'ECONNREFUSED' ? 
          'Backend não está rodando' : 
          'Erro de conectividade'
      }
    }
  }

  /**
   * Simula requisição com delay (para demonstração)
   */
  static async dadosComDelay(delayMs = 2000) {
    try {
      // Simular loading state
      await new Promise(resolve => setTimeout(resolve, delayMs))
      
      const response = await api.get('/api/dados')
      return {
        sucesso: true,
        dados: response.data,
        mensagem: `Dados carregados após ${delayMs}ms`
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
   * Trata erros de forma padronizada
   */
  static tratarErro(error) {
    if (error.response) {
      // Erro da API
      const status = error.response.status
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     'Erro desconhecido'
      
      switch (status) {
        case 400: return `Erro de validação: ${message}`
        case 401: return 'Não autorizado - Faça login'
        case 403: return 'Acesso negado'
        case 404: return 'Endpoint não encontrado'
        case 500: return 'Erro interno do servidor'
        default: return `Erro HTTP ${status}: ${message}`
      }
    } else if (error.request) {
      // Erro de rede
      if (error.code === 'ECONNREFUSED') {
        return 'Conexão recusada - Backend não está rodando'
      } else if (error.code === 'TIMEOUT') {
        return 'Timeout - Servidor demorou para responder'
      } else {
        return 'Erro de conexão - Verifique sua internet'
      }
    } else {
      return `Erro inesperado: ${error.message}`
    }
  }
}
```

---

### Componente de Demonstração

#### `src/components/TesteAPI.vue`

```vue
<template>
  <div class="teste-api">
    <!-- Header -->
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">
          <i class="fas fa-plug me-2"></i>
          Teste de Comunicação com API Flask
        </h4>
      </div>
      <div class="card-body">
        <p class="mb-0">
          Esta seção demonstra como o Vue.js se comunica com o backend Flask
        </p>
      </div>
    </div>

    <!-- Status da Conexão -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-wifi me-2"></i>
              Status da Conexão
            </h5>
          </div>
          <div class="card-body">
            <div class="d-flex align-items-center gap-3">
              <div 
                class="status-indicator"
                :class="conexao.conectado ? 'online' : 'offline'"
              ></div>
              <div>
                <strong>{{ conexao.conectado ? 'Conectado' : 'Desconectado' }}</strong>
                <br>
                <small class="text-muted">{{ conexao.mensagem }}</small>
              </div>
            </div>
            
            <button 
              class="btn btn-outline-primary btn-sm mt-3"
              @click="testarConexao"
              :disabled="testando"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': testando }"></i>
              {{ testando ? 'Testando...' : 'Testar Conexão' }}
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-chart-line me-2"></i>
              Estatísticas de Requisições
            </h5>
          </div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-4">
                <div class="h4 text-success">{{ stats.sucesso }}</div>
                <small class="text-muted">Sucessos</small>
              </div>
              <div class="col-4">
                <div class="h4 text-danger">{{ stats.erro }}</div>
                <small class="text-muted">Erros</small>
              </div>
              <div class="col-4">
                <div class="h4 text-info">{{ stats.total }}</div>
                <small class="text-muted">Total</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ações de Teste -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-flask me-2"></i>
          Testes de Requisições
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <button 
              class="btn btn-primary w-100"
              @click="carregarDados"
              :disabled="carregandoDados"
            >
              <i class="fas fa-download" v-if="!carregandoDados"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
              {{ carregandoDados ? 'Carregando...' : 'Carregar Dados' }}
            </button>
          </div>
          
          <div class="col-md-4">
            <button 
              class="btn btn-warning w-100"
              @click="carregarComDelay"
              :disabled="carregandoComDelay"
            >
              <i class="fas fa-clock" v-if="!carregandoComDelay"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
              {{ carregandoComDelay ? 'Carregando...' : 'Com Delay (2s)' }}
            </button>
          </div>
          
          <div class="col-md-4">
            <button 
              class="btn btn-danger w-100"
              @click="simularErro"
              :disabled="simulandoErro"
            >
              <i class="fas fa-exclamation-triangle" v-if="!simulandoErro"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
              {{ simulandoErro ? 'Testando...' : 'Simular Erro' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resultado das Requisições -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="fas fa-terminal me-2"></i>
          Log de Requisições
        </h5>
        <button 
          class="btn btn-sm btn-outline-secondary"
          @click="limparLog"
        >
          <i class="fas fa-trash"></i> Limpar
        </button>
      </div>
      <div class="card-body">
        <!-- Loading State -->
        <div v-if="carregandoDados || carregandoComDelay || simulandoErro" class="text-center py-4">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <p class="text-muted">Processando requisição...</p>
        </div>

        <!-- Log de Requisições -->
        <div v-else-if="logRequisicoes.length > 0" class="log-container">
          <div 
            v-for="(log, index) in logRequisicoes.slice().reverse()" 
            :key="index"
            class="log-entry"
            :class="log.tipo"
          >
            <div class="log-header">
              <i class="fas" :class="{
                'fa-check-circle text-success': log.tipo === 'sucesso',
                'fa-exclamation-circle text-danger': log.tipo === 'erro',
                'fa-info-circle text-info': log.tipo === 'info'
              }"></i>
              <strong>{{ log.titulo }}</strong>
              <small class="text-muted ms-auto">{{ formatarTempo(log.timestamp) }}</small>
            </div>
            <div class="log-body">
              <p class="mb-1">{{ log.mensagem }}</p>
              <div v-if="log.dados && log.dados.length > 0" class="mt-2">
                <small class="text-muted">Dados recebidos ({{ log.dados.length }} itens):</small>
                <div class="dados-preview">
                  <div 
                    v-for="(pessoa, i) in log.dados.slice(0, 3)" 
                    :key="i"
                    class="badge bg-secondary me-1 mb-1"
                  >
                    {{ pessoa.nome }}
                  </div>
                  <span v-if="log.dados.length > 3" class="text-muted small">
                    +{{ log.dados.length - 3 }} mais...
                  </span>
                </div>
              </div>
              <div v-if="log.detalhes" class="mt-2">
                <details>
                  <summary class="text-muted small">Detalhes técnicos</summary>
                  <pre class="small text-muted mt-1">{{ JSON.stringify(log.detalhes, null, 2) }}</pre>
                </details>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vazio -->
        <div v-else class="text-center py-4 text-muted">
          <i class="fas fa-clipboard-list fa-3x mb-3"></i>
          <p>Nenhuma requisição feita ainda.</p>
          <p class="small">Use os botões acima para testar a comunicação com a API.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DadosService } from '@/services/DadosService'

export default {
  name: 'TesteAPI',
  data() {
    return {
      // Estados de loading
      testando: false,
      carregandoDados: false,
      carregandoComDelay: false,
      simulandoErro: false,
      
      // Conexão
      conexao: {
        conectado: false,
        mensagem: 'Status não verificado'
      },
      
      // Estatísticas
      stats: {
        sucesso: 0,
        erro: 0,
        total: 0
      },
      
      // Log de requisições
      logRequisicoes: []
    }
  },
  async mounted() {
    await this.testarConexao()
  },
  methods: {
    async testarConexao() {
      this.testando = true
      
      const resultado = await DadosService.testarConexao()
      
      this.conexao = {
        conectado: resultado.conectado,
        mensagem: resultado.mensagem
      }
      
      this.adicionarLog(
        resultado.sucesso ? 'sucesso' : 'erro',
        'Teste de Conexão',
        resultado.mensagem,
        null,
        { status: resultado.status }
      )
      
      this.testando = false
    },

    async carregarDados() {
      this.carregandoDados = true
      
      const resultado = await DadosService.obterDados()
      
      this.adicionarLog(
        resultado.sucesso ? 'sucesso' : 'erro',
        'Carregar Dados',
        resultado.mensagem,
        resultado.dados
      )
      
      this.carregandoDados = false
    },

    async carregarComDelay() {
      this.carregandoComDelay = true
      
      const inicio = Date.now()
      const resultado = await DadosService.dadosComDelay(2000)
      const duracao = Date.now() - inicio
      
      this.adicionarLog(
        resultado.sucesso ? 'sucesso' : 'erro',
        'Carregar com Delay',
        `${resultado.mensagem} (duração real: ${duracao}ms)`,
        resultado.dados
      )
      
      this.carregandoComDelay = false
    },

    async simularErro() {
      this.simulandoErro = true
      
      try {
        // Tentar acessar endpoint inexistente
        await DadosService.api.get('/api/endpoint-inexistente')
      } catch (error) {
        this.adicionarLog(
          'erro',
          'Simular Erro 404',
          'Endpoint não encontrado (esperado)',
          null,
          { 
            status: error.response?.status,
            mensagem: error.response?.data?.message || error.message
          }
        )
      }
      
      this.simulandoErro = false
    },

    adicionarLog(tipo, titulo, mensagem, dados = null, detalhes = null) {
      this.logRequisicoes.push({
        tipo,
        titulo,
        mensagem,
        dados,
        detalhes,
        timestamp: Date.now()
      })
      
      // Atualizar estatísticas
      this.stats.total++
      if (tipo === 'sucesso') {
        this.stats.sucesso++
      } else if (tipo === 'erro') {
        this.stats.erro++
      }
      
      // Manter apenas os últimos 50 logs
      if (this.logRequisicoes.length > 50) {
        this.logRequisicoes = this.logRequisicoes.slice(-50)
      }
    },

    limparLog() {
      this.logRequisicoes = []
      this.stats = { sucesso: 0, erro: 0, total: 0 }
    },

    formatarTempo(timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    }
  }
}
</script>

<style scoped>
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.online {
  background-color: #28a745;
  box-shadow: 0 0 8px rgba(40, 167, 69, 0.5);
}

.status-indicator.offline {
  background-color: #dc3545;
  box-shadow: 0 0 8px rgba(220, 53, 69, 0.5);
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
}

.log-entry {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin-bottom: 10px;
  padding: 12px;
  background: #f8f9fa;
}

.log-entry.sucesso {
  border-left: 4px solid #28a745;
}

.log-entry.erro {
  border-left: 4px solid #dc3545;
}

.log-entry.info {
  border-left: 4px solid #17a2b8;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.log-body p {
  margin: 0;
}

.dados-preview {
  margin-top: 6px;
}

pre {
  max-height: 200px;
  overflow-y: auto;
  background: #f1f3f4;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px;
}

/* Animações */
.log-entry {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
```

---

### Atualização do App.vue para Aula 3

#### `src/App.vue` (versão Aula 3)

```vue
<template>
  <div id="app">
    <!-- Header da aplicação -->
    <header class="bg-primary text-white py-3 mb-4">
      <div class="container">
        <h1 class="mb-0">
          <i class="fas fa-graduation-cap me-2"></i>
          Frontend Vue.js - Aula 3
        </h1>
        <p class="mb-0 opacity-75">Comunicação com API Flask</p>
      </div>
    </header>

    <!-- Conteúdo principal -->
    <div class="container">
      <TesteAPI />
    </div>

    <!-- Footer -->
    <footer class="bg-light text-center py-3 mt-5">
      <div class="container">
        <p class="text-muted mb-0">
          Aula 3 - Comunicação com API | 
          <a href="https://axios-http.com/" target="_blank" class="text-decoration-none">
            Documentação Axios
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import TesteAPI from './components/TesteAPI.vue'

export default {
  name: 'App',
  components: {
    TesteAPI
  }
}
</script>

<style>
/* Reutilizar estilos da aula anterior */
</style>
```

---

### Exercícios Práticos da Aula 3

#### Exercício 1: Cache de Requisições
Implementar um sistema simples de cache:
- Armazenar respostas em memória por 5 minutos
- Mostrar indicador quando dados vêm do cache
- Botão para limpar cache manualmente

#### Exercício 2: Retry Automático
Criar sistema de retry para falhas:
- Tentar novamente até 3 vezes em caso de erro de rede
- Backoff exponencial (1s, 2s, 4s)
- Mostrar progresso do retry na UI

#### Exercício 3: WebSocket (Opcional)
Para alunos avançados, implementar comunicação em tempo real:
- Conectar via WebSocket com Flask-SocketIO
- Notificações em tempo real
- Status de conexão WebSocket

---

### Comandos e Verificação

#### Testando com Backend Flask
```bash
# Certifique-se que o Flask está rodando
cd ../backend_flask
python run.py

# Em outro terminal, rode o frontend
cd ../frontend_vue
npm run dev
```

#### Debug de Requisições
```javascript
// No console do navegador
console.log('Token atual:', localStorage.getItem('authToken'))

// Limpar token para teste
localStorage.removeItem('authToken')
```

---

### Branch Git
```bash
# Criar e configurar branch da aula 3
git checkout master
git checkout -b aula-03-api

# Implementar componentes da aula 3
# ...

git add .
git commit -m "Aula 3 - Comunicação com API Flask implementada"
git push -u origin aula-03-api
```

---

### Checklist de Verificação

- [ ] Axios configurado com interceptadores
- [ ] Serviço DadosService funcionando
- [ ] Componente TesteAPI implementado
- [ ] Estados de loading funcionando
- [ ] Tratamento de erro implementado
- [ ] Log de requisições funcionando
- [ ] Conexão com Flask testada
- [ ] Estatísticas de requisições exibidas

---

### Próxima Aula

Na **Aula 4** veremos:
- Vue Router para navegação SPA
- Rotas dinâmicas e parâmetros
- Guards de navegação
- Lazy loading de componentes
- Estrutura de múltiplas páginas

### Conceitos Importantes

1. **Interceptadores**: Fundamentais para tratamento global
2. **Estados Assíncronos**: Loading, sucesso, erro sempre visíveis
3. **Feedback Visual**: Usuário sempre sabe o que está acontecendo
4. **Tratamento de Erro**: Mensagens claras e ações de recuperação
5. **Debug**: Console logs para desenvolvimento