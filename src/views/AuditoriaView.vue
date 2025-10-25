<template>
  <div>
    <h2>Histórico de Auditoria</h2>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <label class="form-label">Produto:</label>
            <select v-model="filtros.produtoId" class="form-select">
              <option value="">Todos</option>
              <option v-for="p in produtos" :key="p.id" :value="p.id">
                {{ p.nome }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Tipo de Operação:</label>
            <select v-model="filtros.operacao" class="form-select">
              <option value="">Todas</option>
              <option value="CREATE">Criar</option>
              <option value="UPDATE">Editar</option>
              <option value="DELETE">Deletar</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">&nbsp;</label>
            <button @click="carregarAuditorias" class="btn btn-primary w-100">Carregar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Auditoria -->
    <div v-if="auditoriasCarregadas.length === 0" class="alert alert-info">
      Nenhuma auditoria encontrada
    </div>

    <div v-for="auditoria in auditoriasCarregadas" :key="auditoria.id" class="card mb-3">
      <div class="card-body">
        <div class="row">
          <div class="col-md-8">
            <h6>{{ obterTipoOperacao(auditoria.operacao) }}</h6>
            <p><small class="text-muted">
              Produto #{{ auditoria.produtoId }} - 
              {{ new Date(auditoria.timestamp).toLocaleString() }}
            </small></p>
            
            <div v-if="auditoria.operacao === 'UPDATE'" class="mt-2">
              <details>
                <summary style="cursor: pointer; color: #007bff;">Ver alterações</summary>
                <div style="background: #f8f9fa; padding: 10px; margin-top: 10px; border-radius: 4px; font-size: 12px;">
                  <div v-for="(valor, chave) in auditoria.dadosAnteriores" :key="chave" class="mb-2">
                    <strong>{{ chave }}:</strong><br>
                    <span style="color: red;">❌ {{ valor }}</span> → 
                    <span style="color: green;">✓ {{ auditoria.dadosNovos[chave] }}</span>
                  </div>
                </div>
              </details>
            </div>
          </div>
          <div class="col-md-4 text-end">
            <button v-if="auditoria.operacao !== 'CREATE'" @click="desfazer(auditoria)" class="btn btn-warning btn-sm">
              ↶ Desfazer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="mensagem" :class="['alert', 'position-fixed', { 'alert-success': tipoMensagem === 'sucesso', 'alert-danger': tipoMensagem === 'erro' }]" style="bottom: 20px; right: 20px; z-index: 9999; width: 350px;">
      {{ mensagem }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuditoriaView',
  data() {
    return {
      produtos: [
        { id: 1, nome: 'Notebook' },
        { id: 2, nome: 'Mouse' },
        { id: 3, nome: 'Teclado' },
        { id: 4, nome: 'Monitor' },
        { id: 5, nome: 'Webcam' }
      ],
      filtros: {
        produtoId: '',
        operacao: ''
      },
      auditorias: [
        {
          id: 1,
          produtoId: 1,
          operacao: 'CREATE',
          dadosAnteriores: {},
          dadosNovos: { nome: 'Notebook', preco: 2500 },
          timestamp: '2025-10-15T10:00:00'
        },
        {
          id: 2,
          produtoId: 1,
          operacao: 'UPDATE',
          dadosAnteriores: { preco: 2500 },
          dadosNovos: { preco: 2300 },
          timestamp: '2025-10-16T14:30:00'
        },
        {
          id: 3,
          produtoId: 2,
          operacao: 'CREATE',
          dadosAnteriores: {},
          dadosNovos: { nome: 'Mouse', preco: 50 },
          timestamp: '2025-10-15T10:15:00'
        },
        {
          id: 4,
          produtoId: 3,
          operacao: 'UPDATE',
          dadosAnteriores: { estoque: 10 },
          dadosNovos: { estoque: 5 },
          timestamp: '2025-10-17T09:00:00'
        }
      ],
      mensagem: '',
      tipoMensagem: ''
    }
  },
  computed: {
    auditoriasCarregadas() {
      let resultado = this.auditorias

      if (this.filtros.produtoId) {
        resultado = resultado.filter(a => a.produtoId === parseInt(this.filtros.produtoId))
      }

      if (this.filtros.operacao) {
        resultado = resultado.filter(a => a.operacao === this.filtros.operacao)
      }

      return resultado.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    }
  },
  methods: {
    carregarAuditorias() {
      this.mostrarToast('sucesso', 'Auditoria carregada')
    },
    obterTipoOperacao(operacao) {
      const tipos = {
        'CREATE': '➕ Produto Criado',
        'UPDATE': '✏️ Produto Editado',
        'DELETE': '🗑️ Produto Deletado'
      }
      return tipos[operacao] || operacao
    },
    desfazer(auditoria) {
      if (confirm('Desfazer esta operação?')) {
        this.mostrarToast('sucesso', `Operação desfeita: ${this.obterTipoOperacao(auditoria.operacao)}`)
      }
    },
    mostrarToast(tipo, mensagem) {
      this.tipoMensagem = tipo
      this.mensagem = mensagem
      setTimeout(() => {
        this.mensagem = ''
      }, 3000)
    }
  }
}
</script>
