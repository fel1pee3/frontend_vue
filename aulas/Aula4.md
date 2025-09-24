## Aula 4 — Roteamento com Vue Router

### Objetivos
- Configurar Vue Router para navegação SPA
- Criar rotas estáticas e dinâmicas
- Implementar guards de navegação
- Trabalhar com parâmetros de rota e query strings
- Criar navegação programática e declarativa
- Implementar lazy loading para otimização

---

### Introdução ao Vue Router

#### O que é SPA (Single Page Application)?

Uma **SPA** é uma aplicação web que carrega uma única página HTML e dinamicamente atualiza o conteúdo conforme o usuário interage, sem recarregar a página inteira.

**Vantagens:**
- ✅ Navegação mais rápida (sem reload)
- ✅ Melhor experiência do usuário
- ✅ Menos requisições ao servidor
- ✅ Interface mais fluida

**Vue Router** é a biblioteca oficial para roteamento em aplicações Vue.js.

---

### Configuração Básica do Vue Router

#### `src/router/index.js`

```javascript
import { createRouter, createWebHistory } from 'vue-router'

// Importar views/componentes
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Contact from '@/views/Contact.vue'
import NotFound from '@/views/NotFound.vue'

// Definição das rotas
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { 
      title: 'Página Inicial',
      description: 'Bem-vindo ao nosso sistema'
    }
  },
  {
    path: '/sobre',
    name: 'About',
    component: About,
    meta: { 
      title: 'Sobre Nós',
      requiresAuth: false
    }
  },
  {
    path: '/contato',
    name: 'Contact',
    component: Contact,
    meta: { 
      title: 'Contato',
      requiresAuth: false
    }
  },
  {
    // Rota com parâmetro
    path: '/usuario/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'), // Lazy loading
    props: true, // Passar parâmetros como props
    meta: { 
      title: 'Perfil do Usuário',
      requiresAuth: true
    }
  },
  {
    // Rotas aninhadas
    path: '/produtos',
    name: 'Products',
    component: () => import('@/views/products/ProductsLayout.vue'),
    children: [
      {
        path: '',
        name: 'ProductsList',
        component: () => import('@/views/products/ProductsList.vue')
      },
      {
        path: ':id',
        name: 'ProductDetail',
        component: () => import('@/views/products/ProductDetail.vue'),
        props: true
      },
      {
        path: 'categoria/:categoria',
        name: 'ProductsByCategory',
        component: () => import('@/views/products/ProductsByCategory.vue'),
        props: true
      }
    ]
  },
  {
    // Redirecionamento
    path: '/admin',
    redirect: '/dashboard'
  },
  {
    // Rota catch-all para 404
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

// Criar instância do router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Comportamento de scroll
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash }
    } else {
      return { top: 0 }
    }
  }
})

// Guards globais
router.beforeEach((to, from, next) => {
  // Atualizar título da página
  document.title = to.meta.title || 'Minha App Vue'
  
  // Verificar autenticação (simulado)
  const isAuthenticated = localStorage.getItem('authToken')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

// Guard após navegação
router.afterEach((to, from) => {
  console.log(`Navegou de ${from.name} para ${to.name}`)
})

export default router
```

---

### Views/Páginas Principais

#### `src/views/Home.vue`

```vue
<template>
  <div class="home">
    <div class="hero-section">
      <div class="container text-center py-5">
        <h1 class="display-4 text-primary mb-4">
          <i class="fas fa-home me-3"></i>
          Bem-vindo ao Vue Router
        </h1>
        <p class="lead mb-4">
          Explore as funcionalidades de roteamento do Vue.js
        </p>
        
        <!-- Navegação com router-link -->
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <router-link to="/sobre" class="btn btn-primary">
            <i class="fas fa-info-circle me-2"></i>
            Sobre Nós
          </router-link>
          
          <router-link to="/produtos" class="btn btn-outline-primary">
            <i class="fas fa-shopping-bag me-2"></i>
            Ver Produtos
          </router-link>
          
          <router-link to="/contato" class="btn btn-success">
            <i class="fas fa-envelope me-2"></i>
            Contato
          </router-link>
        </div>
      </div>
    </div>

    <!-- Navegação Programática -->
    <div class="container mt-5">
      <div class="card">
        <div class="card-header">
          <h3>
            <i class="fas fa-code me-2"></i>
            Navegação Programática
          </h3>
        </div>
        <div class="card-body">
          <p>Teste diferentes formas de navegação:</p>
          
          <div class="row g-3">
            <div class="col-md-4">
              <button 
                @click="navegarPara('/sobre')" 
                class="btn btn-info w-100"
              >
                <i class="fas fa-arrow-right me-2"></i>
                Push: Sobre
              </button>
            </div>
            
            <div class="col-md-4">
              <button 
                @click="substituirRota('/produtos')" 
                class="btn btn-warning w-100"
              >
                <i class="fas fa-exchange-alt me-2"></i>
                Replace: Produtos
              </button>
            </div>
            
            <div class="col-md-4">
              <button 
                @click="voltarPagina()" 
                class="btn btn-secondary w-100"
              >
                <i class="fas fa-arrow-left me-2"></i>
                Voltar
              </button>
            </div>
          </div>

          <!-- Navegação com parâmetros -->
          <div class="mt-4">
            <h5>Navegação com Parâmetros:</h5>
            <div class="input-group mb-3">
              <input 
                v-model="userId" 
                type="number" 
                class="form-control" 
                placeholder="ID do usuário (ex: 123)"
              >
              <button 
                @click="verPerfil" 
                class="btn btn-primary"
                :disabled="!userId"
              >
                Ver Perfil
              </button>
            </div>
          </div>

          <!-- Query Strings -->
          <div class="mt-3">
            <h5>Navegação com Query:</h5>
            <div class="row g-2">
              <div class="col-md-6">
                <select v-model="selectedCategory" class="form-select">
                  <option value="">Selecione categoria</option>
                  <option value="eletronicos">Eletrônicos</option>
                  <option value="roupas">Roupas</option>
                  <option value="casa">Casa</option>
                </select>
              </div>
              <div class="col-md-6">
                <button 
                  @click="buscarPorCategoria" 
                  class="btn btn-success w-100"
                  :disabled="!selectedCategory"
                >
                  Buscar Categoria
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Informações da Rota Atual -->
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h4>
            <i class="fas fa-info me-2"></i>
            Informações da Rota Atual
          </h4>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Path:</strong> <code>{{ $route.path }}</code></p>
              <p><strong>Name:</strong> <code>{{ $route.name }}</code></p>
              <p><strong>Hash:</strong> <code>{{ $route.hash || 'Nenhum' }}</code></p>
            </div>
            <div class="col-md-6">
              <p><strong>Params:</strong> <code>{{ JSON.stringify($route.params) }}</code></p>
              <p><strong>Query:</strong> <code>{{ JSON.stringify($route.query) }}</code></p>
              <p><strong>Meta:</strong> <code>{{ JSON.stringify($route.meta) }}</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      userId: '',
      selectedCategory: ''
    }
  },
  methods: {
    // Navegação programática
    navegarPara(path) {
      this.$router.push(path)
    },
    
    substituirRota(path) {
      this.$router.replace(path)
    },
    
    voltarPagina() {
      this.$router.go(-1)
    },
    
    verPerfil() {
      if (this.userId) {
        this.$router.push({
          name: 'UserProfile',
          params: { id: this.userId }
        })
      }
    },
    
    buscarPorCategoria() {
      this.$router.push({
        name: 'ProductsByCategory',
        params: { categoria: this.selectedCategory },
        query: { 
          ordenar: 'nome',
          limite: 10 
        }
      })
    }
  },
  
  // Watchers para mudanças de rota
  watch: {
    '$route'(to, from) {
      console.log('Rota mudou:', { from: from.name, to: to.name })
    }
  },
  
  // Guards locais do componente
  beforeRouteEnter(to, from, next) {
    console.log('Entrando na Home')
    next()
  },
  
  beforeRouteLeave(to, from, next) {
    if (confirm('Tem certeza que deseja sair da página inicial?')) {
      next()
    } else {
      next(false)
    }
  }
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: -20px -15px 0;
}

.hero-section h1 {
  color: white !important;
}

.btn {
  transition: transform 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  color: #e83e8c;
}
</style>
```

#### `src/views/products/ProductsLayout.vue`

```vue
<template>
  <div class="products-layout">
    <div class="container mt-4">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/">Home</router-link>
          </li>
          <li class="breadcrumb-item active">Produtos</li>
        </ol>
      </nav>

      <!-- Header com navegação de produtos -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h2>
              <i class="fas fa-shopping-bag me-2"></i>
              Produtos
            </h2>
            
            <!-- Sub-navegação -->
            <div class="btn-group" role="group">
              <router-link 
                to="/produtos" 
                class="btn btn-outline-primary"
                :class="{ active: $route.name === 'ProductsList' }"
              >
                <i class="fas fa-list me-2"></i>
                Todos
              </router-link>
              
              <router-link 
                to="/produtos/categoria/eletronicos" 
                class="btn btn-outline-primary"
                :class="{ active: $route.params.categoria === 'eletronicos' }"
              >
                <i class="fas fa-laptop me-2"></i>
                Eletrônicos
              </router-link>
              
              <router-link 
                to="/produtos/categoria/roupas" 
                class="btn btn-outline-primary"
                :class="{ active: $route.params.categoria === 'roupas' }"
              >
                <i class="fas fa-tshirt me-2"></i>
                Roupas
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Conteúdo das rotas filhas -->
      <div class="products-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductsLayout'
}
</script>

<style scoped>
.btn-group .btn.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.products-content {
  min-height: 400px;
}
</style>
```

#### `src/views/products/ProductsList.vue`

```vue
<template>
  <div class="products-list">
    <div class="row">
      <div class="col-md-8">
        <h3>Lista de Produtos</h3>
        <p class="text-muted">Todos os produtos disponíveis</p>
        
        <div class="row">
          <div 
            v-for="produto in produtos" 
            :key="produto.id"
            class="col-md-6 mb-3"
          >
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ produto.nome }}</h5>
                <p class="card-text">{{ produto.descricao }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <strong class="text-primary">R$ {{ produto.preco.toFixed(2) }}</strong>
                  <router-link 
                    :to="{ name: 'ProductDetail', params: { id: produto.id } }"
                    class="btn btn-sm btn-primary"
                  >
                    Ver Detalhes
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5>Filtros</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Buscar:</label>
              <input v-model="filtros.busca" type="text" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">Preço máximo:</label>
              <input v-model="filtros.precoMax" type="number" class="form-control">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductsList',
  data() {
    return {
      produtos: [
        { id: 1, nome: 'Smartphone', descricao: 'Celular moderno', preco: 899.99 },
        { id: 2, nome: 'Notebook', descricao: 'Laptop para trabalho', preco: 2499.99 },
        { id: 3, nome: 'Headphone', descricao: 'Fone de ouvido sem fio', preco: 299.99 },
        { id: 4, nome: 'Monitor', descricao: 'Tela 24 polegadas', preco: 599.99 }
      ],
      filtros: {
        busca: '',
        precoMax: null
      }
    }
  }
}
</script>
```

---

### Guards de Navegação

#### Guards Globais

```javascript
// router/index.js - Guards globais

// Antes de cada navegação
router.beforeEach(async (to, from, next) => {
  console.log('Navegando para:', to.name)
  
  // Loading global
  showLoadingBar()
  
  // Verificar autenticação
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('authToken')
    if (!token) {
      next('/login')
      return
    }
    
    // Verificar se token ainda é válido
    try {
      await validateToken(token)
    } catch (error) {
      localStorage.removeItem('authToken')
      next('/login')
      return
    }
  }
  
  // Verificar permissões específicas
  if (to.meta.role && !hasPermission(to.meta.role)) {
    next('/unauthorized')
    return
  }
  
  next()
})

// Resolver guards
router.beforeResolve(async (to, from, next) => {
  // Carregar dados necessários antes da navegação
  if (to.meta.preloadData) {
    try {
      await preloadRouteData(to)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }
  next()
})

// Após navegação
router.afterEach((to, from, failure) => {
  hideLoadingBar()
  
  if (failure) {
    console.error('Falha na navegação:', failure)
  }
  
  // Analytics
  trackPageView(to.path)
})
```

#### Guards por Rota

```javascript
// Nas definições de rota
{
  path: '/admin',
  component: AdminPanel,
  beforeEnter: (to, from, next) => {
    if (isAdmin()) {
      next()
    } else {
      next('/unauthorized')
    }
  }
}
```

#### Guards de Componente

```javascript
export default {
  beforeRouteEnter(to, from, next) {
    // Antes de entrar na rota
    // 'this' não está disponível
    next(vm => {
      // Acesso ao componente via 'vm'
      vm.loadData()
    })
  },
  
  beforeRouteUpdate(to, from, next) {
    // Quando a rota muda mas o componente é reutilizado
    this.id = to.params.id
    this.loadUserData()
    next()
  },
  
  beforeRouteLeave(to, from, next) {
    // Antes de sair da rota
    if (this.hasUnsavedChanges()) {
      const answer = confirm('Tem alterações não salvas. Deseja continuar?')
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  }
}
```

---

### Navegação Avançada

#### Navegação Programática Completa

```javascript
// Diferentes formas de navegação
methods: {
  // String simples
  navegarSimples() {
    this.$router.push('/produtos')
  },
  
  // Objeto com path
  navegarComPath() {
    this.$router.push({ path: '/produtos' })
  },
  
  // Objeto com nome e parâmetros
  navegarComNome() {
    this.$router.push({ 
      name: 'ProductDetail', 
      params: { id: 123 } 
    })
  },
  
  // Com query strings
  navegarComQuery() {
    this.$router.push({
      path: '/produtos',
      query: { categoria: 'eletronicos', ordenar: 'preco' }
    })
  },
  
  // Replace (não adiciona ao histórico)
  substituir() {
    this.$router.replace('/nova-rota')
  },
  
  // Navegar no histórico
  voltarFrente() {
    this.$router.go(-1) // Voltar
    this.$router.go(1)  // Avançar
  },
  
  // Navegação condicionada
  async navegarCondicional() {
    const canNavigate = await this.checkPermission()
    if (canNavigate) {
      this.$router.push('/rota-protegida')
    } else {
      this.$toast.error('Sem permissão para acessar')
    }
  }
}
```

---

### Exercícios Práticos

#### Exercício 1: Sistema de Blog
Crie uma estrutura de rotas para um blog:
- `/blog` - Lista de posts
- `/blog/:slug` - Post específico
- `/blog/categoria/:categoria` - Posts por categoria
- `/blog/autor/:autor` - Posts por autor

#### Exercício 2: Painel Administrativo
Implemente rotas protegidas:
- Guards de autenticação
- Verificação de roles (admin, editor, viewer)
- Redirecionamentos baseados em permissão

#### Exercício 3: E-commerce Completo
Estrutura de rotas para e-commerce:
- Produtos com categorias e subcategorias
- Carrinho de compras
- Checkout multi-etapas
- Histórico de pedidos

---

### Integração com App.vue

#### `src/App.vue` (versão com router)

```vue
<template>
  <div id="app">
    <!-- Loading Bar Global -->
    <div v-if="$route.meta.loading" class="loading-bar">
      <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated"></div>
      </div>
    </div>

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <i class="fas fa-graduation-cap me-2"></i>
          Vue Router Demo
        </router-link>
        
        <div class="navbar-nav ms-auto">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/sobre" class="nav-link">Sobre</router-link>
          <router-link to="/produtos" class="nav-link">Produtos</router-link>
          <router-link to="/contato" class="nav-link">Contato</router-link>
        </div>
      </div>
    </nav>

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- Footer -->
    <footer class="bg-light text-center py-3 mt-auto">
      <div class="container">
        <p class="text-muted mb-0">
          Aula 4 - Vue Router | Rota atual: {{ $route.name }}
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px 0;
}

/* Transições de página */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Navbar active links */
.navbar-nav .router-link-active {
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
}

/* Loading bar */
.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
}

.progress {
  height: 3px;
  border-radius: 0;
}
</style>
```

---

### Comandos Git

```bash
# Criar branch da aula 4
git checkout master
git checkout -b aula-04-roteamento

# Implementar todos os arquivos da aula
git add .
git commit -m "Aula 4 - Roteamento completo com Vue Router"
git push -u origin aula-04-roteamento
```

---

### Checklist de Verificação

- [ ] Vue Router configurado
- [ ] Rotas básicas funcionando
- [ ] Rotas com parâmetros implementadas
- [ ] Rotas aninhadas criadas
- [ ] Guards de navegação funcionando
- [ ] Navegação programática implementada
- [ ] Lazy loading configurado
- [ ] Transições de página aplicadas
- [ ] Breadcrumbs funcionando
- [ ] Links ativos destacados

---

### Próxima Aula

Na **Aula 5** veremos:
- Formulários reativos avançados
- Validações client-side
- Componentes de formulário customizados
- Integração com APIs de validação
- Upload de arquivos

### Conceitos Importantes

1. **SPA**: Uma página, múltiplas views
2. **Guards**: Controle de acesso às rotas
3. **Lazy Loading**: Carregamento sob demanda
4. **Transições**: Animações entre páginas
5. **Meta Fields**: Dados adicionais das rotas