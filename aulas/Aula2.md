## Aula 2 — Componentes e Diretivas

### Objetivos
- Dominar as diretivas essenciais do Vue.js
- Criar componentes reutilizáveis
- Entender comunicação entre componentes (props e emits)
- Trabalhar com listas e renderização condicional
- Aplicar conceitos na prática com exercícios

---

### Diretivas Fundamentais

#### 1. **v-if / v-else-if / v-else**
Renderização condicional que adiciona/remove elementos do DOM.

```vue
<template>
  <div>
    <div v-if="usuario.tipo === 'admin'" class="alert alert-success">
      <i class="fas fa-crown"></i> Bem-vindo, Administrador!
    </div>
    <div v-else-if="usuario.tipo === 'moderador'" class="alert alert-info">
      <i class="fas fa-user-tie"></i> Bem-vindo, Moderador!
    </div>
    <div v-else class="alert alert-primary">
      <i class="fas fa-user"></i> Bem-vindo, Usuário!
    </div>

    <!-- Exemplo com múltiplas condições -->
    <div v-if="usuario.logado && usuario.ativo">
      <h3>Dashboard</h3>
      <p>Conteúdo disponível apenas para usuários logados e ativos</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      usuario: {
        tipo: 'admin',
        logado: true,
        ativo: true
      }
    }
  }
}
</script>
```

#### 2. **v-show**
Controla a visibilidade (CSS display) sem remover do DOM.

```vue
<template>
  <div>
    <button @click="toggleMenu" class="btn btn-primary">
      {{ menuVisivel ? 'Ocultar' : 'Mostrar' }} Menu
    </button>
    
    <!-- v-show é melhor para elementos que alternam frequentemente -->
    <nav v-show="menuVisivel" class="mt-3">
      <ul class="list-group">
        <li class="list-group-item">Home</li>
        <li class="list-group-item">Produtos</li>
        <li class="list-group-item">Sobre</li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuVisivel: false
    }
  },
  methods: {
    toggleMenu() {
      this.menuVisivel = !this.menuVisivel
    }
  }
}
</script>
```

#### 3. **v-for**
Renderização de listas com diferentes tipos de dados.

```vue
<template>
  <div>
    <!-- Lista simples -->
    <h4>Frutas</h4>
    <ul class="list-group mb-4">
      <li 
        v-for="(fruta, index) in frutas" 
        :key="index"
        class="list-group-item d-flex justify-content-between"
      >
        {{ index + 1 }}. {{ fruta }}
        <button @click="removerFruta(index)" class="btn btn-sm btn-outline-danger">
          <i class="fas fa-trash"></i>
        </button>
      </li>
    </ul>

    <!-- Lista de objetos -->
    <h4>Produtos</h4>
    <div class="row">
      <div 
        v-for="produto in produtos" 
        :key="produto.id"
        class="col-md-4 mb-3"
      >
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ produto.nome }}</h5>
            <p class="card-text">{{ produto.descricao }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="h5 text-primary">R$ {{ produto.preco.toFixed(2) }}</span>
              <span 
                class="badge"
                :class="produto.estoque > 0 ? 'bg-success' : 'bg-danger'"
              >
                {{ produto.estoque > 0 ? 'Em estoque' : 'Esgotado' }}
              </span>
            </div>
            <button 
              class="btn btn-primary w-100 mt-2"
              :disabled="produto.estoque === 0"
              @click="adicionarAoCarrinho(produto)"
            >
              <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Iteração sobre propriedades de um objeto -->
    <h4>Informações do Sistema</h4>
    <table class="table">
      <tbody>
        <tr v-for="(valor, chave) in infoSistema" :key="chave">
          <td><strong>{{ chave }}:</strong></td>
          <td>{{ valor }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      frutas: ['Maçã', 'Banana', 'Laranja', 'Uva', 'Morango'],
      produtos: [
        { id: 1, nome: 'Notebook', descricao: 'Computador portátil', preco: 2500.00, estoque: 5 },
        { id: 2, nome: 'Mouse', descricao: 'Mouse óptico sem fio', preco: 45.90, estoque: 0 },
        { id: 3, nome: 'Teclado', descricao: 'Teclado mecânico RGB', preco: 320.50, estoque: 3 }
      ],
      infoSistema: {
        'Versão': '1.0.0',
        'Framework': 'Vue.js 3',
        'Node.js': 'v18.17.0',
        'Ambiente': 'Desenvolvimento'
      }
    }
  },
  methods: {
    removerFruta(index) {
      this.frutas.splice(index, 1)
    },
    adicionarAoCarrinho(produto) {
      alert(`${produto.nome} adicionado ao carrinho!`)
      produto.estoque--
    }
  }
}
</script>
```

---

### Criando Componentes Reutilizáveis

#### Component: CartaoProduto.vue
```vue
<template>
  <div class="card h-100 shadow-sm">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h5 class="card-title">{{ produto.nome }}</h5>
        <span 
          class="badge"
          :class="badgeClass"
        >
          {{ statusTexto }}
        </span>
      </div>
      
      <p class="card-text text-muted">{{ produto.descricao }}</p>
      
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <span class="h4 text-primary">R$ {{ produto.preco.toFixed(2) }}</span>
          <small class="text-muted d-block">Em estoque: {{ produto.estoque }}</small>
        </div>
        
        <div>
          <button 
            class="btn btn-outline-primary btn-sm me-2"
            @click="$emit('visualizar', produto)"
          >
            <i class="fas fa-eye"></i>
          </button>
          
          <button 
            class="btn btn-primary btn-sm"
            :disabled="produto.estoque === 0"
            @click="adicionarCarrinho"
          >
            <i class="fas fa-cart-plus"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartaoProduto',
  props: {
    produto: {
      type: Object,
      required: true,
      validator(produto) {
        return produto && produto.nome && produto.preco >= 0
      }
    }
  },
  emits: ['adicionar-carrinho', 'visualizar'],
  computed: {
    statusTexto() {
      if (this.produto.estoque === 0) return 'Esgotado'
      if (this.produto.estoque <= 5) return 'Últimas unidades'
      return 'Disponível'
    },
    badgeClass() {
      if (this.produto.estoque === 0) return 'bg-danger'
      if (this.produto.estoque <= 5) return 'bg-warning'
      return 'bg-success'
    }
  },
  methods: {
    adicionarCarrinho() {
      this.$emit('adicionar-carrinho', this.produto)
    }
  }
}
</script>
```

#### Component: ListaProdutos.vue
```vue
<template>
  <div class="lista-produtos">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>
        <i class="fas fa-shopping-bag me-2"></i>
        Produtos ({{ produtosFiltrados.length }})
      </h2>
      
      <div class="d-flex gap-2">
        <select v-model="filtroCategoria" class="form-select">
          <option value="">Todas as categorias</option>
          <option value="eletronicos">Eletrônicos</option>
          <option value="escritorio">Escritório</option>
          <option value="casa">Casa</option>
        </select>
        
        <input 
          v-model="pesquisa"
          type="text"
          class="form-control"
          placeholder="Pesquisar produtos..."
        >
      </div>
    </div>

    <div class="row">
      <div 
        v-for="produto in produtosFiltrados" 
        :key="produto.id"
        class="col-lg-4 col-md-6 mb-4"
      >
        <CartaoProduto 
          :produto="produto"
          @adicionar-carrinho="adicionarAoCarrinho"
          @visualizar="visualizarProduto"
        />
      </div>
    </div>

    <div v-if="produtosFiltrados.length === 0" class="text-center py-5">
      <i class="fas fa-search fa-3x text-muted mb-3"></i>
      <h4 class="text-muted">Nenhum produto encontrado</h4>
      <p class="text-muted">Tente ajustar os filtros de busca</p>
    </div>

    <!-- Modal de visualização -->
    <div v-if="produtoSelecionado" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ produtoSelecionado.nome }}</h5>
            <button @click="produtoSelecionado = null" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <p>{{ produtoSelecionado.descricao }}</p>
            <div class="row">
              <div class="col-6">
                <strong>Preço:</strong><br>
                R$ {{ produtoSelecionado.preco.toFixed(2) }}
              </div>
              <div class="col-6">
                <strong>Estoque:</strong><br>
                {{ produtoSelecionado.estoque }} unidades
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="produtoSelecionado = null" class="btn btn-secondary">Fechar</button>
            <button 
              @click="adicionarAoCarrinho(produtoSelecionado)"
              class="btn btn-primary"
              :disabled="produtoSelecionado.estoque === 0"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CartaoProduto from './CartaoProduto.vue'

export default {
  name: 'ListaProdutos',
  components: {
    CartaoProduto
  },
  data() {
    return {
      pesquisa: '',
      filtroCategoria: '',
      produtoSelecionado: null,
      produtos: [
        { id: 1, nome: 'Notebook Dell', descricao: 'Notebook para trabalho', preco: 2500.00, estoque: 5, categoria: 'eletronicos' },
        { id: 2, nome: 'Mouse Logitech', descricao: 'Mouse sem fio', preco: 45.90, estoque: 0, categoria: 'eletronicos' },
        { id: 3, nome: 'Cadeira Gamer', descricao: 'Cadeira ergonômica', preco: 850.00, estoque: 3, categoria: 'escritorio' },
        { id: 4, nome: 'Mesa de Escritório', descricao: 'Mesa em MDF', preco: 320.50, estoque: 8, categoria: 'escritorio' },
        { id: 5, nome: 'Luminária LED', descricao: 'Luminária de mesa', preco: 125.90, estoque: 2, categoria: 'casa' }
      ]
    }
  },
  computed: {
    produtosFiltrados() {
      return this.produtos.filter(produto => {
        const matchPesquisa = produto.nome.toLowerCase().includes(this.pesquisa.toLowerCase())
        const matchCategoria = !this.filtroCategoria || produto.categoria === this.filtroCategoria
        return matchPesquisa && matchCategoria
      })
    }
  },
  methods: {
    adicionarAoCarrinho(produto) {
      if (produto.estoque > 0) {
        produto.estoque--
        alert(`${produto.nome} adicionado ao carrinho!`)
        this.produtoSelecionado = null
      }
    },
    visualizarProduto(produto) {
      this.produtoSelecionado = produto
    }
  }
}
</script>
```

---

### Exercícios Práticos

#### Exercício 1: Sistema de Avaliações
Crie um componente `AvaliacaoProduto` que:
- Receba um produto como prop
- Permita dar notas de 1 a 5 estrelas
- Calcule e exiba a média das avaliações
- Emita evento quando uma nova avaliação for feita

#### Exercício 2: Lista de Tarefas Avançada
Evolua a lista de tarefas da Aula 1 com:
- Componente `ItemTarefa` separado
- Filtros: Todas, Pendentes, Concluídas
- Edição inline de tarefas
- Drag and drop para reordenar

#### Exercício 3: Carrinho de Compras
Implemente um componente de carrinho que:
- Liste produtos adicionados
- Calcule subtotais e total
- Permita alterar quantidades
- Tenha botão para finalizar compra

---

### Comunicação entre Componentes

#### Props (Dados do pai para filho)
```vue
<!-- Componente Pai -->
<template>
  <ComponenteFilho 
    :usuario="usuarioAtual"
    :configuracoes="{ tema: 'dark', idioma: 'pt-BR' }"
    mensagem="Bem-vindo ao sistema!"
  />
</template>

<!-- Componente Filho -->
<script>
export default {
  props: {
    usuario: {
      type: Object,
      required: true
    },
    configuracoes: {
      type: Object,
      default: () => ({ tema: 'light', idioma: 'pt-BR' })
    },
    mensagem: {
      type: String,
      default: 'Olá!'
    }
  }
}
</script>
```

#### Emits (Eventos do filho para pai)
```vue
<!-- Componente Filho -->
<template>
  <button @click="notificarClique">Clique aqui</button>
</template>

<script>
export default {
  emits: ['botao-clicado', 'dados-alterados'],
  methods: {
    notificarClique() {
      this.$emit('botao-clicado', {
        timestamp: Date.now(),
        usuario: this.usuario.nome
      })
    }
  }
}
</script>

<!-- Componente Pai -->
<template>
  <ComponenteFilho @botao-clicado="handleBotaoClicado" />
</template>

<script>
export default {
  methods: {
    handleBotaoClicado(dados) {
      console.log('Botão clicado por:', dados.usuario, 'em:', dados.timestamp)
    }
  }
}
</script>
```

---

### Arquivos da Aula 2

1. `src/components/CartaoProduto.vue`
2. `src/components/ListaProdutos.vue`
3. `src/components/AvaliacaoProduto.vue`
4. `src/components/ItemTarefa.vue`
5. `src/components/CarrinhoCompras.vue`

---

### Branch Git
```bash
git checkout -b aula-02-componentes
git add .
git commit -m "Aula 2 - Componentes e Diretivas"
```

---

### Checklist de Verificação

- [ ] v-if, v-else, v-show funcionando
- [ ] v-for com arrays e objetos
- [ ] Componentes reutilizáveis criados
- [ ] Props e emits implementados
- [ ] Sistema de filtros funcionando
- [ ] Comunicação pai-filho estabelecida
- [ ] Exercícios práticos concluídos

---

### Próxima Aula

Na **Aula 3** veremos:
- Integração com APIs
- Axios e requisições HTTP
- Loading states e error handling
- Consumo da API Flask
- Interceptors e configurações globais