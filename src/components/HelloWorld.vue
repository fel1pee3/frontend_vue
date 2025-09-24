<template>
  <div class="hello-world">
    <!-- Seção principal -->
    <div class="card mb-4">
      <div class="card-header bg-success text-white">
        <h3 class="mb-0">
          <i class="fas fa-star me-2"></i>
          {{ titulo }}
        </h3>
      </div>
      <div class="card-body">
        <p class="lead">{{ descricao }}</p>
        
        <!-- Demonstração de reatividade -->
        <div class="row">
          <div class="col-md-6">
            <h5>🔄 Reatividade em Ação</h5>
            <div class="d-flex align-items-center gap-2 mb-3">
              <button 
                class="btn btn-primary btn-sm" 
                @click="incrementar"
              >
                <i class="fas fa-plus"></i> +1
              </button>
              <button 
                class="btn btn-secondary btn-sm" 
                @click="decrementar"
              >
                <i class="fas fa-minus"></i> -1
              </button>
              <button 
                class="btn btn-warning btn-sm" 
                @click="resetar"
              >
                <i class="fas fa-undo"></i> Reset
              </button>
            </div>
            <div class="alert alert-info">
              <strong>Contador:</strong> {{ contador }}
              <br>
              <small class="text-muted">
                {{ mensagemContador }}
              </small>
            </div>
          </div>
          
          <div class="col-md-6">
            <h5>📝 Data Binding</h5>
            <div class="mb-3">
              <label class="form-label">Digite seu nome:</label>
              <input 
                v-model="nome" 
                type="text" 
                class="form-control"
                placeholder="Seu nome aqui..."
              >
            </div>
            <div class="alert alert-success" v-if="nome.trim()">
              <i class="fas fa-user me-2"></i>
              Olá, <strong>{{ nome }}</strong>! 👋
            </div>
            <div class="alert alert-light" v-else>
              <i class="fas fa-info-circle me-2"></i>
              Digite seu nome para ver a mágica da reatividade!
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Demonstração de computed properties -->
    <div class="card mb-4">
      <div class="card-header">
        <h4 class="mb-0">
          <i class="fas fa-calculator me-2"></i>
          Propriedades Computadas
        </h4>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <h6>Lista de Compras</h6>
            <ul class="list-group">
              <li 
                v-for="(item, index) in listaCompras" 
                :key="index"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                {{ item.nome }}
                <span class="badge bg-primary rounded-pill">
                  R$ {{ item.preco.toFixed(2) }}
                </span>
              </li>
            </ul>
            <button 
              class="btn btn-success mt-2"
              @click="adicionarItem"
            >
              <i class="fas fa-plus"></i> Adicionar Item Aleatório
            </button>
          </div>
          
          <div class="col-md-6">
            <div class="alert alert-info">
              <h6>📊 Resumo (Computed)</h6>
              <p><strong>Total de Itens:</strong> {{ totalItens }}</p>
              <p><strong>Valor Total:</strong> R$ {{ valorTotal.toFixed(2) }}</p>
              <p><strong>Ticket Médio:</strong> R$ {{ ticketMedio.toFixed(2) }}</p>
            </div>
            
            <div class="progress mb-2">
              <div 
                class="progress-bar"
                :class="progressoClass"
                :style="{ width: progressoPercentual + '%' }"
              >
                {{ progressoPercentual.toFixed(1) }}%
              </div>
            </div>
            <small class="text-muted">Progresso até R$ 100,00</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Handling -->
    <div class="card mb-4">
      <div class="card-header">
        <h4 class="mb-0">
          <i class="fas fa-hand-pointer me-2"></i>
          Manipulação de Eventos
        </h4>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="d-grid gap-2">
              <button 
                class="btn btn-outline-primary"
                @click="mostrarAlerta('Olá!')"
              >
                <i class="fas fa-bell"></i> Alerta Simples
              </button>
              
              <button 
                class="btn btn-outline-success"
                @click="alterarCor"
              >
                <i class="fas fa-palette"></i> Mudar Cor do Fundo
              </button>
              
              <button 
                class="btn btn-outline-info"
                @mouseenter="aoPassarMouse"
                @mouseleave="aoSairMouse"
              >
                <i class="fas fa-mouse-pointer"></i> Passe o Mouse Aqui
              </button>
            </div>
          </div>
          
          <div class="col-md-6">
            <div 
              class="p-3 rounded"
              :style="{ backgroundColor: corFundo }"
              style="min-height: 120px; transition: all 0.3s ease;"
            >
              <h6>Área Interativa</h6>
              <p class="mb-0">{{ mensagemMouse }}</p>
              <small class="text-muted">Cor atual: {{ corFundo }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulário com validação -->
    <div class="card">
      <div class="card-header">
        <h4 class="mb-0">
          <i class="fas fa-edit me-2"></i>
          Formulário Reativo
        </h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="enviarFormulario">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Email:</label>
                <input 
                  v-model="formulario.email"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': formulario.email && !emailValido }"
                  required
                >
                <div class="invalid-feedback" v-if="formulario.email && !emailValido">
                  Por favor, digite um email válido.
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Idade:</label>
                <input 
                  v-model.number="formulario.idade"
                  type="number"
                  class="form-control"
                  min="1"
                  max="120"
                  required
                >
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Cidade:</label>
                <select v-model="formulario.cidade" class="form-select" required>
                  <option value="">Selecione uma cidade</option>
                  <option value="sao-paulo">São Paulo</option>
                  <option value="rio-janeiro">Rio de Janeiro</option>
                  <option value="belo-horizonte">Belo Horizonte</option>
                  <option value="salvador">Salvador</option>
                </select>
              </div>
              
              <div class="mb-3">
                <div class="form-check">
                  <input 
                    v-model="formulario.newsletter"
                    type="checkbox"
                    class="form-check-input"
                    id="newsletter"
                  >
                  <label class="form-check-label" for="newsletter">
                    Receber newsletter
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center">
            <button 
              type="submit"
              class="btn btn-primary"
              :disabled="!formularioValido"
            >
              <i class="fas fa-paper-plane"></i> Enviar
            </button>
            
            <div class="text-muted small">
              Formulário {{ formularioValido ? 'válido' : 'inválido' }}
            </div>
          </div>
        </form>
        
        <!-- Preview dos dados -->
        <div class="mt-4 p-3 bg-light rounded" v-if="formularioEnviado">
          <h6>📋 Dados Enviados:</h6>
          <pre>{{ JSON.stringify(ultimoEnvio, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      titulo: 'Bem-vindo ao Vue.js!',
      descricao: 'Este componente demonstra os conceitos fundamentais do Vue.js abordados na Aula 1.',
      contador: 0,
      nome: '',
      listaCompras: [
        { nome: 'Notebook', preco: 2500.00 },
        { nome: 'Mouse', preco: 45.90 },
        { nome: 'Teclado', preco: 120.50 }
      ],
      corFundo: '#f8f9fa',
      mensagemMouse: 'Passe o mouse no botão ao lado!',
      cores: ['#ffebee', '#e8f5e8', '#fff3e0', '#e3f2fd', '#fce4ec'],
      formulario: {
        email: '',
        idade: null,
        cidade: '',
        newsletter: false
      },
      formularioEnviado: false,
      ultimoEnvio: null
    }
  },
  computed: {
    mensagemContador() {
      if (this.contador === 0) {
        return 'Comece clicando nos botões!'
      } else if (this.contador < 5) {
        return 'Continue assim!'
      } else if (this.contador < 10) {
        return 'Você está indo bem!'
      } else {
        return 'Impressionante! 🎉'
      }
    },
    totalItens() {
      return this.listaCompras.length
    },
    valorTotal() {
      return this.listaCompras.reduce((total, item) => total + item.preco, 0)
    },
    ticketMedio() {
      return this.totalItens > 0 ? this.valorTotal / this.totalItens : 0
    },
    progressoPercentual() {
      return Math.min((this.valorTotal / 100) * 100, 100)
    },
    progressoClass() {
      if (this.progressoPercentual < 30) return 'bg-danger'
      if (this.progressoPercentual < 70) return 'bg-warning'
      return 'bg-success'
    },
    emailValido() {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return regex.test(this.formulario.email)
    },
    formularioValido() {
      return this.formulario.email && 
             this.emailValido && 
             this.formulario.idade && 
             this.formulario.cidade
    }
  },
  methods: {
    incrementar() {
      this.contador++
    },
    decrementar() {
      if (this.contador > 0) {
        this.contador--
      }
    },
    resetar() {
      this.contador = 0
    },
    adicionarItem() {
      const produtos = [
        'Caderno', 'Caneta', 'Lápis', 'Borracha', 'Régua',
        'Mochila', 'Estojo', 'Livro', 'Agenda', 'Marcador'
      ]
      const produto = produtos[Math.floor(Math.random() * produtos.length)]
      const preco = Math.random() * 50 + 10 // Entre 10 e 60 reais
      
      this.listaCompras.push({
        nome: produto,
        preco: preco
      })
    },
    mostrarAlerta(mensagem) {
      alert(`🎯 ${mensagem}\n\nEste é um exemplo de event handling no Vue.js!`)
    },
    alterarCor() {
      const novasCores = this.cores.filter(cor => cor !== this.corFundo)
      this.corFundo = novasCores[Math.floor(Math.random() * novasCores.length)]
    },
    aoPassarMouse() {
      this.mensagemMouse = '🐭 Mouse detectado! Hover funcionando.'
    },
    aoSairMouse() {
      this.mensagemMouse = '👋 Mouse saiu da área.'
    },
    enviarFormulario() {
      this.ultimoEnvio = { ...this.formulario }
      this.formularioEnviado = true
      
      console.log('📋 Formulário enviado:', this.ultimoEnvio)
      
      // Simular envio
      alert('✅ Formulário enviado com sucesso!\nVerifique o console e a seção de preview.')
    }
  }
}
</script>

<style scoped>
.hello-world {
  max-width: 100%;
}

.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.progress {
  height: 20px;
}

pre {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Animação para itens da lista */
.list-group-item {
  transition: all 0.3s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>