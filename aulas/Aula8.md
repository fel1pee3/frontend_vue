## Aula 8 — Gerenciamento de Estado com Pinia

### Objetivos
- Entender o conceito de estado global
- Configurar e usar o Pinia
- Criar stores organizadas
- Implementar actions assíncronas
- Trabalhar com getters computados
- Configurar persistência de estado
- Integrar com APIs
- Gerenciar estado complexo

---

### Introdução ao Pinia

O Pinia é o gerenciador de estado oficial do Vue.js, substituindo o Vuex. Oferece:
- **TypeScript support** nativo
- **Modular** por design
- **DevTools** integrado
- **Hot Module Replacement**
- **Server-side rendering** pronto

#### Instalação e Configuração

```bash
npm install pinia
```

#### `src/main.js`

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

---

### Estrutura de Stores

#### `src/stores/user.js`

```javascript
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useUserStore = defineStore('user', {
  // State
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    permissions: [],
    preferences: {
      theme: 'light',
      language: 'pt-BR',
      notifications: true
    },
    loginAttempts: 0,
    lastLogin: null
  }),

  // Getters (computadas globais)
  getters: {
    // Getter simples
    fullName: (state) => {
      return state.user ? `${state.user.firstName} ${state.user.lastName}` : ''
    },

    // Getter com parâmetros
    hasPermission: (state) => {
      return (permission) => state.permissions.includes(permission)
    },

    // Getter que usa outros getters
    canManageUsers: (state) => {
      return state.permissions.includes('admin') || 
             state.permissions.includes('user-management')
    },

    // Getter computado
    userStats() {
      if (!this.user) return null
      
      return {
        totalLogins: this.user.totalLogins || 0,
        daysActive: Math.ceil(
          (Date.now() - new Date(this.user.createdAt)) / (1000 * 60 * 60 * 24)
        ),
        lastLoginFormatted: this.lastLogin ? 
          new Intl.DateTimeFormat('pt-BR').format(new Date(this.lastLogin)) : 
          'Nunca'
      }
    },

    // Getter reativo
    isDarkMode: (state) => state.preferences.theme === 'dark'
  },

  // Actions
  actions: {
    // Action síncrona
    updatePreferences(newPreferences) {
      this.preferences = { ...this.preferences, ...newPreferences }
    },

    // Action assíncrona - Login
    async login(credentials) {
      this.loading = true
      this.loginAttempts++
      
      try {
        const response = await api.post('/auth/login', credentials)
        
        this.user = response.data.user
        this.permissions = response.data.permissions || []
        this.isAuthenticated = true
        this.lastLogin = new Date().toISOString()
        this.loginAttempts = 0 // Reset attempts on success
        
        // Salvar token
        localStorage.setItem('authToken', response.data.token)
        
        return { success: true, user: this.user }
      } catch (error) {
        console.error('Login failed:', error)
        
        // Tratar diferentes tipos de erro
        if (error.response?.status === 401) {
          throw new Error('Credenciais inválidas')
        } else if (error.response?.status === 429) {
          throw new Error('Muitas tentativas. Tente novamente em alguns minutos.')
        } else {
          throw new Error('Erro interno. Tente novamente.')
        }
      } finally {
        this.loading = false
      }
    },

    // Action assíncrona - Logout
    async logout() {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Limpar estado local
        this.user = null
        this.isAuthenticated = false
        this.permissions = []
        this.lastLogin = null
        
        // Remover token
        localStorage.removeItem('authToken')
      }
    },

    // Action assíncrona - Refresh token
    async refreshAuth() {
      const token = localStorage.getItem('authToken')
      if (!token) return false

      try {
        const response = await api.post('/auth/refresh', { token })
        
        this.user = response.data.user
        this.permissions = response.data.permissions || []
        this.isAuthenticated = true
        
        localStorage.setItem('authToken', response.data.token)
        return true
      } catch (error) {
        console.error('Token refresh failed:', error)
        await this.logout()
        return false
      }
    },

    // Action para carregar perfil
    async loadUserProfile() {
      if (!this.isAuthenticated) return

      try {
        const response = await api.get('/user/profile')
        this.user = { ...this.user, ...response.data }
      } catch (error) {
        console.error('Failed to load profile:', error)
        if (error.response?.status === 401) {
          await this.logout()
        }
      }
    },

    // Action para atualizar perfil
    async updateProfile(profileData) {
      this.loading = true
      
      try {
        const response = await api.put('/user/profile', profileData)
        this.user = { ...this.user, ...response.data }
        return { success: true, message: 'Perfil atualizado com sucesso' }
      } catch (error) {
        console.error('Profile update failed:', error)
        throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil')
      } finally {
        this.loading = false
      }
    }
  }
})
```

---

### Store de Produtos

#### `src/stores/products.js`

```javascript
import { defineStore } from 'pinia'
import api from '@/services/api'
import { useUserStore } from './user'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [],
    loading: false,
    error: null,
    filters: {
      category: '',
      priceRange: [0, 1000],
      searchTerm: '',
      sortBy: 'name',
      sortOrder: 'asc'
    },
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    },
    favorites: [],
    cart: [],
    selectedProduct: null
  }),

  getters: {
    // Produtos filtrados
    filteredProducts() {
      let filtered = [...this.products]

      // Filtrar por categoria
      if (this.filters.category) {
        filtered = filtered.filter(p => p.category === this.filters.category)
      }

      // Filtrar por preço
      filtered = filtered.filter(p => 
        p.price >= this.filters.priceRange[0] && 
        p.price <= this.filters.priceRange[1]
      )

      // Filtrar por busca
      if (this.filters.searchTerm) {
        const term = this.filters.searchTerm.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        )
      }

      // Ordenar
      filtered.sort((a, b) => {
        const field = this.filters.sortBy
        const order = this.filters.sortOrder === 'asc' ? 1 : -1
        
        if (typeof a[field] === 'string') {
          return a[field].localeCompare(b[field]) * order
        }
        return (a[field] - b[field]) * order
      })

      return filtered
    },

    // Estatísticas
    productStats() {
      return {
        total: this.products.length,
        categories: [...new Set(this.products.map(p => p.category))].length,
        avgPrice: this.products.length > 0 ? 
          this.products.reduce((sum, p) => sum + p.price, 0) / this.products.length : 0,
        inStock: this.products.filter(p => p.stock > 0).length,
        outOfStock: this.products.filter(p => p.stock === 0).length
      }
    },

    // Carrinho
    cartTotal() {
      return this.cart.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      )
    },

    cartItemCount() {
      return this.cart.reduce((count, item) => count + item.quantity, 0)
    },

    // Favoritos
    favoriteProducts() {
      return this.products.filter(p => this.favorites.includes(p.id))
    },

    // Produto em detalhes
    productById: (state) => {
      return (id) => state.products.find(p => p.id === id)
    }
  },

  actions: {
    // Carregar produtos
    async fetchProducts(params = {}) {
      this.loading = true
      this.error = null

      try {
        const queryParams = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.filters,
          ...params
        }

        const response = await api.get('/products', { params: queryParams })
        
        this.products = response.data.products
        this.pagination = {
          ...this.pagination,
          ...response.data.pagination
        }
      } catch (error) {
        this.error = 'Erro ao carregar produtos'
        console.error('Fetch products error:', error)
      } finally {
        this.loading = false
      }
    },

    // Carregar categorias
    async fetchCategories() {
      try {
        const response = await api.get('/categories')
        this.categories = response.data
      } catch (error) {
        console.error('Fetch categories error:', error)
      }
    },

    // Carregar produto específico
    async fetchProduct(id) {
      this.loading = true

      try {
        const response = await api.get(`/products/${id}`)
        this.selectedProduct = response.data
        
        // Atualizar na lista se existir
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = response.data
        }
      } catch (error) {
        this.error = 'Produto não encontrado'
        console.error('Fetch product error:', error)
      } finally {
        this.loading = false
      }
    },

    // Criar produto (Admin)
    async createProduct(productData) {
      const userStore = useUserStore()
      
      if (!userStore.hasPermission('admin')) {
        throw new Error('Permissão negada')
      }

      try {
        const response = await api.post('/products', productData)
        this.products.push(response.data)
        return response.data
      } catch (error) {
        console.error('Create product error:', error)
        throw new Error('Erro ao criar produto')
      }
    },

    // Atualizar produto
    async updateProduct(id, productData) {
      try {
        const response = await api.put(`/products/${id}`, productData)
        
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = response.data
        }
        
        return response.data
      } catch (error) {
        console.error('Update product error:', error)
        throw new Error('Erro ao atualizar produto')
      }
    },

    // Gerenciar filtros
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.pagination.page = 1 // Reset page on filter change
    },

    clearFilters() {
      this.filters = {
        category: '',
        priceRange: [0, 1000],
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc'
      }
      this.pagination.page = 1
    },

    // Gerenciar favoritos
    toggleFavorite(productId) {
      const index = this.favorites.indexOf(productId)
      if (index > -1) {
        this.favorites.splice(index, 1)
      } else {
        this.favorites.push(productId)
      }
    },

    // Gerenciar carrinho
    addToCart(product, quantity = 1) {
      const existingItem = this.cart.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.cart.push({
          ...product,
          quantity
        })
      }
    },

    removeFromCart(productId) {
      const index = this.cart.findIndex(item => item.id === productId)
      if (index > -1) {
        this.cart.splice(index, 1)
      }
    },

    updateCartItemQuantity(productId, quantity) {
      const item = this.cart.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else {
          item.quantity = quantity
        }
      }
    },

    clearCart() {
      this.cart = []
    },

    // Checkout
    async checkout(orderData) {
      const userStore = useUserStore()
      
      if (!userStore.isAuthenticated) {
        throw new Error('Login necessário')
      }

      try {
        const response = await api.post('/orders', {
          items: this.cart,
          total: this.cartTotal,
          ...orderData
        })
        
        this.clearCart()
        return response.data
      } catch (error) {
        console.error('Checkout error:', error)
        throw new Error('Erro ao processar pedido')
      }
    }
  }
})
```

---

### Store UI/UX

#### `src/stores/ui.js`

```javascript
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    // Layout
    sidebarOpen: false,
    mobileMenuOpen: false,
    theme: 'light',
    
    // Loading states
    globalLoading: false,
    loadingStates: {}, // { componentName: boolean }
    
    // Notifications
    notifications: [],
    
    // Modals
    modals: {
      confirmDelete: false,
      userProfile: false,
      productDetails: false
    },
    
    // Breadcrumbs
    breadcrumbs: [],
    
    // Form states
    unsavedChanges: false,
    
    // Device detection
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  }),

  getters: {
    // Theme
    isDarkMode: (state) => state.theme === 'dark',
    
    // Device queries
    isMobileOrTablet: (state) => state.isMobile || state.isTablet,
    
    // Loading
    isLoading: (state) => (componentName) => {
      return state.loadingStates[componentName] || false
    },
    
    // Notifications
    hasNotifications: (state) => state.notifications.length > 0,
    unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    
    // Modal helpers
    anyModalOpen: (state) => Object.values(state.modals).some(Boolean)
  },

  actions: {
    // Theme management
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', this.theme)
      localStorage.setItem('theme', this.theme)
    },

    setTheme(theme) {
      this.theme = theme
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    },

    initTheme() {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      this.theme = savedTheme || (prefersDark ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', this.theme)
    },

    // Sidebar management
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },

    closeSidebar() {
      this.sidebarOpen = false
    },

    // Mobile menu
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },

    closeMobileMenu() {
      this.mobileMenuOpen = false
    },

    // Loading management
    setLoading(componentName, loading = true) {
      this.loadingStates[componentName] = loading
    },

    clearLoading(componentName) {
      delete this.loadingStates[componentName]
    },

    setGlobalLoading(loading) {
      this.globalLoading = loading
    },

    // Notification system
    addNotification(notification) {
      const id = Date.now() + Math.random()
      const newNotification = {
        id,
        type: 'info', // info, success, warning, error
        title: '',
        message: '',
        read: false,
        timestamp: new Date().toISOString(),
        autoClose: true,
        duration: 5000,
        ...notification
      }

      this.notifications.unshift(newNotification)

      // Auto remove notification
      if (newNotification.autoClose) {
        setTimeout(() => {
          this.removeNotification(id)
        }, newNotification.duration)
      }

      return id
    },

    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },

    markNotificationAsRead(id) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.read = true
      }
    },

    clearAllNotifications() {
      this.notifications = []
    },

    // Quick notification helpers
    showSuccess(message, title = 'Sucesso') {
      return this.addNotification({
        type: 'success',
        title,
        message
      })
    },

    showError(message, title = 'Erro') {
      return this.addNotification({
        type: 'error',
        title,
        message,
        autoClose: false
      })
    },

    showWarning(message, title = 'Atenção') {
      return this.addNotification({
        type: 'warning',
        title,
        message
      })
    },

    showInfo(message, title = 'Informação') {
      return this.addNotification({
        type: 'info',
        title,
        message
      })
    },

    // Modal management
    openModal(modalName) {
      this.modals[modalName] = true
    },

    closeModal(modalName) {
      this.modals[modalName] = false
    },

    closeAllModals() {
      Object.keys(this.modals).forEach(key => {
        this.modals[key] = false
      })
    },

    // Breadcrumb management
    setBreadcrumbs(breadcrumbs) {
      this.breadcrumbs = breadcrumbs
    },

    addBreadcrumb(breadcrumb) {
      this.breadcrumbs.push(breadcrumb)
    },

    clearBreadcrumbs() {
      this.breadcrumbs = []
    },

    // Form state management
    setUnsavedChanges(hasChanges) {
      this.unsavedChanges = hasChanges
    },

    // Device management
    updateDeviceInfo() {
      const width = window.innerWidth
      this.isMobile = width < 768
      this.isTablet = width >= 768 && width < 1024
      this.isDesktop = width >= 1024
    },

    // Initialize store
    init() {
      this.initTheme()
      this.updateDeviceInfo()

      // Listen for window resize
      window.addEventListener('resize', () => {
        this.updateDeviceInfo()
      })

      // Listen for theme preference changes
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          if (!localStorage.getItem('theme')) {
            this.setTheme(e.matches ? 'dark' : 'light')
          }
        })
    }
  }
})
```

---

### Persistência de Estado

#### Plugin de Persistência

```javascript
// src/plugins/pinia-persist.js
import { watch } from 'vue'

export function createPersistedState(options = {}) {
  return (context) => {
    const { store } = context
    const {
      key = store.$id,
      storage = localStorage,
      paths = null,
      beforeRestore = null,
      afterRestore = null
    } = options

    // Restore state from storage
    const savedState = storage.getItem(key)
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        
        if (beforeRestore) {
          beforeRestore(parsedState, store)
        }

        // Restore only specified paths or entire state
        if (paths) {
          paths.forEach(path => {
            if (parsedState[path] !== undefined) {
              store.$patch({ [path]: parsedState[path] })
            }
          })
        } else {
          store.$patch(parsedState)
        }

        if (afterRestore) {
          afterRestore(store)
        }
      } catch (error) {
        console.error(`Failed to restore state for store ${key}:`, error)
      }
    }

    // Watch for state changes and persist
    watch(
      () => store.$state,
      (state) => {
        try {
          let stateToSave = state
          
          // Save only specified paths
          if (paths) {
            stateToSave = {}
            paths.forEach(path => {
              stateToSave[path] = state[path]
            })
          }

          storage.setItem(key, JSON.stringify(stateToSave))
        } catch (error) {
          console.error(`Failed to persist state for store ${key}:`, error)
        }
      },
      { deep: true }
    )
  }
}
```

#### Uso do Plugin

```javascript
// src/stores/user.js (atualizado)
import { defineStore } from 'pinia'
import { createPersistedState } from '@/plugins/pinia-persist'

export const useUserStore = defineStore('user', {
  state: () => ({
    // ... estado
  }),
  
  // ... getters e actions
}, {
  // Plugin de persistência
  plugins: [
    createPersistedState({
      key: 'user-store',
      paths: ['user', 'isAuthenticated', 'preferences'], // Persistir apenas esses campos
      beforeRestore: (state) => {
        // Validar dados antes de restaurar
        if (state.user && !state.user.id) {
          delete state.user
          state.isAuthenticated = false
        }
      }
    })
  ]
})
```

---

### Composables para Stores

#### `src/composables/useStores.js`

```javascript
import { useUserStore } from '@/stores/user'
import { useProductsStore } from '@/stores/products'
import { useUIStore } from '@/stores/ui'

export function useStores() {
  const userStore = useUserStore()
  const productsStore = useProductsStore()
  const uiStore = useUIStore()

  return {
    userStore,
    productsStore,
    uiStore
  }
}

// Composable para operações comuns
export function useAuth() {
  const userStore = useUserStore()
  const uiStore = useUIStore()

  const login = async (credentials) => {
    try {
      uiStore.setGlobalLoading(true)
      const result = await userStore.login(credentials)
      uiStore.showSuccess('Login realizado com sucesso!')
      return result
    } catch (error) {
      uiStore.showError(error.message)
      throw error
    } finally {
      uiStore.setGlobalLoading(false)
    }
  }

  const logout = async () => {
    try {
      await userStore.logout()
      uiStore.showInfo('Você foi desconectado')
    } catch (error) {
      uiStore.showError('Erro ao fazer logout')
    }
  }

  return {
    user: computed(() => userStore.user),
    isAuthenticated: computed(() => userStore.isAuthenticated),
    permissions: computed(() => userStore.permissions),
    login,
    logout
  }
}
```

---

### Exemplo de Uso nos Componentes

#### `src/components/ProductList.vue`

```vue
<template>
  <div class="product-list">
    <!-- Loading state -->
    <div v-if="productsStore.loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      Carregando produtos...
    </div>

    <!-- Error state -->
    <div v-else-if="productsStore.error" class="error">
      {{ productsStore.error }}
      <button @click="loadProducts" class="btn btn-primary">
        Tentar novamente
      </button>
    </div>

    <!-- Products grid -->
    <div v-else class="products-grid">
      <div 
        v-for="product in productsStore.filteredProducts" 
        :key="product.id"
        class="product-card"
      >
        <img :src="product.image" :alt="product.name">
        <h3>{{ product.name }}</h3>
        <p class="price">${{ product.price }}</p>
        
        <div class="actions">
          <button 
            @click="addToCart(product)"
            class="btn btn-primary"
            :disabled="product.stock === 0"
          >
            {{ product.stock === 0 ? 'Sem estoque' : 'Adicionar ao carrinho' }}
          </button>
          
          <button 
            @click="toggleFavorite(product.id)"
            class="btn btn-outline-secondary"
            :class="{ active: isFavorite(product.id) }"
          >
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats" v-if="productsStore.productStats">
      <div class="stat">
        <span class="label">Total de produtos:</span>
        <span class="value">{{ productsStore.productStats.total }}</span>
      </div>
      <div class="stat">
        <span class="label">Preço médio:</span>
        <span class="value">${{ productsStore.productStats.avgPrice.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useProductsStore } from '@/stores/products'
import { useUIStore } from '@/stores/ui'

export default {
  name: 'ProductList',
  setup() {
    const productsStore = useProductsStore()
    const uiStore = useUIStore()

    const loadProducts = async () => {
      try {
        await productsStore.fetchProducts()
      } catch (error) {
        uiStore.showError('Erro ao carregar produtos')
      }
    }

    const addToCart = (product) => {
      productsStore.addToCart(product)
      uiStore.showSuccess(`${product.name} adicionado ao carrinho!`)
    }

    const toggleFavorite = (productId) => {
      productsStore.toggleFavorite(productId)
    }

    const isFavorite = (productId) => {
      return productsStore.favorites.includes(productId)
    }

    // Load products on mount
    onMounted(() => {
      loadProducts()
    })

    return {
      productsStore,
      uiStore,
      loadProducts,
      addToCart,
      toggleFavorite,
      isFavorite
    }
  }
}
</script>
```

---

### Exercícios Práticos

#### Exercício 1: Store de Pedidos
Criar store para gerenciar:
- Histórico de pedidos
- Status de entrega
- Filtros por data/status
- Integração com API

#### Exercício 2: Store de Configurações
Implementar:
- Configurações do sistema
- Preferências do usuário
- Cache de configurações
- Sincronização com servidor

#### Exercício 3: Store Complexa
Criar store com:
- Estado aninhado
- Ações em lote
- Otimistic updates
- Rollback em caso de erro

---

### Comandos Git

```bash
git add .
git commit -m "Aula 8 - Gerenciamento de Estado com Pinia"
```

---

### Próxima Aula

Na **Aula 9** veremos:
- Testes unitários com Vue Test Utils
- Mocking de stores e APIs
- Testes de componentes
- Cobertura de código