Exercicio 3 - Histórico de Alterações e Auditoria
Objetivo
Implementar um sistema de auditoria que rastreia todas as operações (criar, editar, excluir):

Log de todas as alterações
Comparação entre versões
Undo da última operação
Relatório de atividades
O Que Você Vai Implementar
1. Tabela de Auditoria no Backend
Seu backend (Flask) deve ter uma tabela de auditoria:

class Auditoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    produto_id = db.Column(db.Integer, db.ForeignKey('produto.id'))
    usuario_id = db.Column(db.Integer)
    operacao = db.Column(db.String(20))  # CREATE, UPDATE, DELETE
    dados_anteriores = db.Column(db.JSON)
    dados_novos = db.Column(db.JSON)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
2. Endpoints de Auditoria
Adicione no backend:

GET /api/auditorias
GET /api/auditorias?produto_id=1
GET /api/auditorias/comparar?id1=100&id2=101
POST /api/operacoes/desfazer
3. Serviço de Auditoria
Crie src/services/AuditoriaService.js:

export class AuditoriaService {
  
  static async listarAuditorias(filtros = {}) {
    try {
      // GET /api/auditorias?produto_id=1&limite=50
      const response = await api.get('/auditorias', { params: filtros })
      return {
        sucesso: true,
        dados: response.data,
        mensagem: 'Auditoria carregada'
      }
    } catch (error) {
      return this.tratarErro(error)
    }
  }

  static async compararVersoes(id1, id2) {
    try {
      // GET /api/auditorias/comparar?id1=100&id2=101
      const response = await api.get('/auditorias/comparar', {
        params: { id1, id2 }
      })
      return {
        sucesso: true,
        dados: response.data,
        mensagem: 'Comparação feita'
      }
    } catch (error) {
      return this.tratarErro(error)
    }
  }

  static async desfazerOperacao(auditId) {
    try {
      // POST /api/operacoes/desfazer
      const response = await api.post('/operacoes/desfazer', {
        auditoria_id: auditId
      })
      return {
        sucesso: true,
        dados: response.data,
        mensagem: 'Operação desfeita com sucesso'
      }
    } catch (error) {
      return this.tratarErro(error)
    }
  }
}
4. Componente de Visualização de Auditoria
Crie src/components/PainelAuditoria.vue:

<template>
  <div class="painel-auditoria">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Histórico de Alterações</h5>
      </div>
      
      <div class="card-body">
        <!-- Filtros -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Produto:</label>
            <select v-model="filtros.produtoId" class="form-select">
              <option value="">Todos</option>
              <option v-for="p in produtos" :key="p.id" :value="p.id">
                {{ p.nome }}
              </option>
            </select>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">Tipo de Operação:</label>
            <select v-model="filtros.operacao" class="form-select">
              <option value="">Todas</option>
              <option value="CREATE">Criar</option>
              <option value="UPDATE">Atualizar</option>
              <option value="DELETE">Deletar</option>
            </select>
          </div>
        </div>

        <!-- Timeline de auditoria -->
        <div v-if="auditorias.length > 0" class="timeline">
          <div 
            v-for="(aud, index) in auditorias" 
            :key="aud.id"
            class="timeline-item"
          >
            <div class="timeline-marker" :class="`operacao-${aud.operacao}`">
              {{ aud.operacao[0] }}
            </div>
            
            <div class="timeline-content">
              <h6>
                <span :class="`badge bg-${getBadgeColor(aud.operacao)}`">
                  {{ aud.operacao }}
                </span>
                {{ getNomeProduto(aud.produto_id) }}
              </h6>
              
              <small class="text-muted">
                {{ formatarData(aud.timestamp) }}
              </small>
              
              <div class="mt-2">
                <button 
                  class="btn btn-sm btn-outline-primary"
                  @click="mostrarDetalhes(aud)"
                >
                  Ver Detalhes
                </button>
                
                <button 
                  v-if="index === 0 && aud.operacao !== 'DELETE'"
                  class="btn btn-sm btn-outline-warning ms-2"
                  @click="desfazer(aud)"
                >
                  Desfazer
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center text-muted py-4">
          Nenhuma alteração encontrada
        </div>
      </div>
    </div>

    <!-- Modal de detalhes -->
    <ModalDetalhesAuditoria 
      v-if="detalhesAberto"
      :auditoria="auditoriaSelecionada"
      @fechar="detalhesAberto = false"
      @comparar="compararVersoes"
    />
  </div>
</template>

<script>
import { AuditoriaService } from '@/services/AuditoriaService'
import ModalDetalhesAuditoria from './ModalDetalhesAuditoria.vue'

export default {
  name: 'PainelAuditoria',
  components: {
    ModalDetalhesAuditoria
  },
  props: {
    produtos: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      auditorias: [],
      carregando: false,
      detalhesAberto: false,
      auditoriaSelecionada: null,
      filtros: {
        produtoId: '',
        operacao: ''
      }
    }
  },
  watch: {
    filtros: {
      deep: true,
      handler() {
        this.carregarAuditorias()
      }
    }
  },
  async mounted() {
    await this.carregarAuditorias()
  },
  methods: {
    async carregarAuditorias() {
      this.carregando = true
      
      const resultado = await AuditoriaService.listarAuditorias(
        this.filtros
      )
      
      if (resultado.sucesso) {
        this.auditorias = resultado.dados
      }
      
      this.carregando = false
    },

    mostrarDetalhes(auditoria) {
      this.auditoriaSelecionada = auditoria
      this.detalhesAberto = true
    },

    async compararVersoes(auditoria) {
      // Compara com versão anterior (se existir)
      const indexAnterior = this.auditorias.findIndex(
        a => a.id === auditoria.id
      ) + 1
      
      if (indexAnterior < this.auditorias.length) {
        const anterior = this.auditorias[indexAnterior]
        const resultado = await AuditoriaService.compararVersoes(
          anterior.id,
          auditoria.id
        )
        
        if (resultado.sucesso) {
          this.auditoriaSelecionada = {
            ...auditoria,
            comparacao: resultado.dados
          }
        }
      }
    },

    async desfazer(auditoria) {
      const confirmou = confirm('Desfazer essa operação?')
      
      if (confirmou) {
        const resultado = await AuditoriaService.desfazerOperacao(
          auditoria.id
        )
        
        if (resultado.sucesso) {
          this.$emit('alteracao')
          this.carregarAuditorias()
        }
      }
    },

    getNomeProduto(produtoId) {
      return this.produtos.find(p => p.id === produtoId)?.nome || 'Desconhecido'
    },

    getBadgeColor(operacao) {
      const cores = {
        CREATE: 'success',
        UPDATE: 'info',
        DELETE: 'danger'
      }
      return cores[operacao] || 'secondary'
    },

    formatarData(data) {
      return new Date(data).toLocaleString('pt-BR')
    }
  }
}
</script>

<style scoped>
.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-left: 2px solid #ddd;
  padding-left: 20px;
}

.timeline-marker {
  position: absolute;
  left: -14px;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.operacao-CREATE {
  background-color: #28a745;
}

.operacao-UPDATE {
  background-color: #17a2b8;
}

.operacao-DELETE {
  background-color: #dc3545;
}
</style>
5. Modal de Detalhes
Crie src/components/ModalDetalhesAuditoria.vue:

<template>
  <div class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detalhes da Alteração</h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="$emit('fechar')"
          ></button>
        </div>
        
        <div class="modal-body">
          <!-- Info básica -->
          <div class="mb-3">
            <h6>Informações</h6>
            <p class="mb-1">
              <strong>Operação:</strong> 
              <span class="badge" :class="`bg-${getBadgeColor(auditoria.operacao)}`">
                {{ auditoria.operacao }}
              </span>
            </p>
            <p class="mb-1">
              <strong>Data:</strong> {{ formatarData(auditoria.timestamp) }}
            </p>
            <p class="mb-1">
              <strong>Produto ID:</strong> {{ auditoria.produto_id }}
            </p>
          </div>

          <!-- Dados anteriores e novos -->
          <div class="row">
            <div class="col-md-6">
              <h6>Dados Anteriores</h6>
              <pre class="bg-light p-2">{{ 
                JSON.stringify(auditoria.dados_anteriores, null, 2) 
              }}</pre>
            </div>
            
            <div class="col-md-6">
              <h6>Dados Novos</h6>
              <pre class="bg-light p-2">{{ 
                JSON.stringify(auditoria.dados_novos, null, 2) 
              }}</pre>
            </div>
          </div>

          <!-- Comparação visual -->
          <div v-if="auditoria.comparacao" class="mt-3">
            <h6>Diferenças</h6>
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Antes</th>
                  <th>Depois</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(diff, field) in auditoria.comparacao" :key="field">
                  <td><strong>{{ field }}</strong></td>
                  <td><code class="text-danger">{{ diff.antes }}</code></td>
                  <td><code class="text-success">{{ diff.depois }}</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary"
            @click="$emit('fechar')"
          >
            Fechar
          </button>
          
          <button 
            type="button" 
            class="btn btn-outline-primary"
            @click="$emit('comparar', auditoria)"
          >
            Comparar com Anterior
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalDetalhesAuditoria',
  props: {
    auditoria: {
      type: Object,
      required: true
    }
  },
  emits: ['fechar', 'comparar'],
  methods: {
    getBadgeColor(operacao) {
      const cores = {
        CREATE: 'success',
        UPDATE: 'info',
        DELETE: 'danger'
      }
      return cores[operacao] || 'secondary'
    },

    formatarData(data) {
      return new Date(data).toLocaleString('pt-BR')
    }
  }
}
</script>
6. Integração com ProdutosView
Adicione ao template de ProdutosView.vue:

<!-- Abas -->
<ul class="nav nav-tabs mb-4">
  <li class="nav-item">
    <a 
      class="nav-link" 
      :class="{ active: abaAtiva === 'produtos' }"
      @click="abaAtiva = 'produtos'"
    >
      Produtos
    </a>
  </li>
  
  <li class="nav-item">
    <a 
      class="nav-link" 
      :class="{ active: abaAtiva === 'auditoria' }"
      @click="abaAtiva = 'auditoria'"
    >
      Histórico
    </a>
  </li>
</ul>

<!-- Conteúdo das abas -->
<div v-show="abaAtiva === 'produtos'">
  <!-- Listagem de produtos (código anterior) -->
</div>

<div v-show="abaAtiva === 'auditoria'">
  <PainelAuditoria 
    :produtos="produtos"
    @alteracao="carregarProdutos"
  />
</div>
Fluxo de Auditoria
User cria produto "Sapato"
    ↓
POST /api/produtos
    ↓
Backend cria produto e LOG de auditoria:
  {
    produto_id: 1,
    operacao: "CREATE",
    dados_anteriores: null,
    dados_novos: { nome: "Sapato", preco: 99.99, ... }
  }
    ↓
User vê produto em listagem

User edita preço para 89.99
    ↓
PUT /api/produtos/1
    ↓
Backend atualiza e LOG de auditoria:
  {
    produto_id: 1,
    operacao: "UPDATE",
    dados_anteriores: { preco: 99.99, ... },
    dados_novos: { preco: 89.99, ... }
  }
    ↓
User clica "Desfazer"
    ↓
POST /api/operacoes/desfazer
    ↓
Backend executa undo restaurando dados_anteriores
Recursos Principais
Auditoria em banco de dados
Versionamento de dados
Timeline visual
Comparação de versões
Undo/Redo
localStorage para filtros