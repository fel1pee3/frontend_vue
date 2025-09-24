## Aula 10 — Performance e Otimização

### Objetivos
- Otimizar performance de aplicações Vue
- Implementar lazy loading e code splitting
- Configurar bundle optimization
- Usar virtual scrolling
- Aplicar memoização e caching
- Otimizar renderização de listas
- Configurar tree shaking
- Implementar PWA features

---

### Análise de Performance

#### Ferramentas de Análise

##### Vue DevTools Performance Tab
```javascript
// Ativar profiling em development
app.config.performance = true

// Medir performance de componentes
const app = createApp({
  created() {
    performance.mark('app-created-start')
  },
  mounted() {
    performance.mark('app-created-end')
    performance.measure('app-created', 'app-created-start', 'app-created-end')
  }
})
```

##### Bundle Analyzer
```bash
# Instalar webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# Analisar build
npm run build -- --report
```

#### `src/utils/performance.js`

```javascript
/**
 * Utilitários de performance
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = new Map()
  }

  /**
   * Marcar início de uma operação
   */
  startMeasure(name) {
    performance.mark(`${name}-start`)
    this.metrics.set(name, { startTime: performance.now() })
  }

  /**
   * Finalizar medição
   */
  endMeasure(name) {
    const startTime = this.metrics.get(name)?.startTime
    if (!startTime) return

    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measure = performance.getEntriesByName(name, 'measure')[0]
    this.metrics.set(name, {
      ...this.metrics.get(name),
      duration: measure.duration,
      endTime: performance.now()
    })

    return measure.duration
  }

  /**
   * Obter métricas
   */
  getMetric(name) {
    return this.metrics.get(name)
  }

  /**
   * Observer de performance
   */
  observePerformance(callback) {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        callback(entries)
      })

      observer.observe({ 
        entryTypes: ['measure', 'navigation', 'resource', 'paint'] 
      })
      
      return observer
    }
  }

  /**
   * Métricas de Core Web Vitals
   */
  measureWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('LCP:', lastEntry.startTime)
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ type: 'first-input', buffered: true })

      // Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        console.log('CLS:', clsValue)
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
    }
  }

  /**
   * Debounce para otimizar eventos
   */
  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * Throttle para otimizar scroll events
   */
  static throttle(func, limit) {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

// Instância global
export const performanceMonitor = new PerformanceMonitor()
```

---

### Lazy Loading e Code Splitting

#### Lazy Loading de Rotas

##### `src/router/index.js`

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/products',
      name: 'Products',
      component: () => import('@/views/Products.vue'),
      children: [
        {
          path: 'list',
          name: 'ProductList',
          component: () => import('@/views/ProductList.vue')
        },
        {
          path: 'details/:id',
          name: 'ProductDetails',
          component: () => import('@/views/ProductDetails.vue')
        }
      ]
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'UserManagement',
          component: () => import('@/views/admin/UserManagement.vue')
        }
      ]
    }
  ]
})

export default router
```

#### Lazy Loading de Componentes

##### `src/components/LazyComponents.js`

```javascript
import { defineAsyncComponent } from 'vue'

// Componente lazy simples
export const LazyProductCard = defineAsyncComponent(() =>
  import('@/components/ProductCard.vue')
)

// Componente lazy com loading state
export const LazyChart = defineAsyncComponent({
  loader: () => import('@/components/Chart.vue'),
  loadingComponent: {
    template: `
      <div class="loading-placeholder">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Carregando gráfico...</span>
        </div>
      </div>
    `
  },
  errorComponent: {
    template: `
      <div class="error-placeholder">
        <p>Erro ao carregar gráfico</p>
        <button @click="$emit('retry')">Tentar novamente</button>
      </div>
    `
  },
  delay: 200,
  timeout: 30000
})

// Componente lazy com retry logic
export const LazyDataTable = defineAsyncComponent({
  loader: () => import('@/components/DataTable.vue'),
  loadingComponent: {
    template: `
      <div class="table-skeleton">
        <div v-for="n in 5" :key="n" class="skeleton-row">
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
        </div>
      </div>
    `
  }
})

// Dynamic import com cache
const componentCache = new Map()

export function createLazyComponent(importFunction, options = {}) {
  return defineAsyncComponent({
    loader: async () => {
      const cacheKey = importFunction.toString()
      
      if (componentCache.has(cacheKey)) {
        return componentCache.get(cacheKey)
      }
      
      try {
        const component = await importFunction()
        componentCache.set(cacheKey, component)
        return component
      } catch (error) {
        console.error('Failed to load component:', error)
        throw error
      }
    },
    ...options
  })
}
```

#### Code Splitting por Funcionalidade

##### `src/features/auth/index.js`

```javascript
// Auth feature bundle
export const AuthModule = {
  components: {
    LoginForm: () => import('./components/LoginForm.vue'),
    RegisterForm: () => import('./components/RegisterForm.vue'),
    ForgotPassword: () => import('./components/ForgotPassword.vue')
  },
  
  store: () => import('./store/authStore.js'),
  
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('./views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('./views/RegisterView.vue')
    }
  ]
}
```

---

### Bundle Optimization

#### Vite Configuration

##### `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  build: {
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['bootstrap', '@fortawesome/fontawesome-free'],
          
          // Feature chunks
          admin: [
            './src/views/admin/Dashboard.vue',
            './src/views/admin/UserManagement.vue'
          ],
          
          // Async chunks
          charts: ['chart.js', 'vue-chartjs'],
          utils: ['axios', 'lodash']
        },
        
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          
          if (facadeModuleId) {
            // Nome baseado na estrutura de pastas
            const name = facadeModuleId
              .split('/')
              .pop()
              .replace(/\.(vue|js|ts)$/, '')
            
            return `chunks/${name}-[hash].js`
          }
          
          return 'chunks/[name]-[hash].js'
        }
      }
    },
    
    // Compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Source maps
    sourcemap: false,
    
    // Asset optimization
    assetsInlineLimit: 4096, // 4kb
    
    // CSS optimization
    cssCodeSplit: true
  },
  
  // Alias para imports mais limpos
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  },
  
  // Otimização de dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
    exclude: ['@fortawesome/fontawesome-free']
  }
})
```

---

### Virtual Scrolling

#### `src/components/VirtualScroll.vue`

```vue
<template>
  <div class="virtual-scroll" ref="containerRef" @scroll="handleScroll">
    <div 
      class="virtual-scroll-spacer" 
      :style="{ height: totalHeight + 'px' }"
    >
      <div 
        class="virtual-scroll-content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="item in visibleItems"
          :key="getItemKey(item)"
          :style="{ height: itemHeight + 'px' }"
          class="virtual-scroll-item"
        >
          <slot :item="item.data" :index="item.index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'VirtualScroll',
  props: {
    items: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 50
    },
    containerHeight: {
      type: Number,
      default: 400
    },
    buffer: {
      type: Number,
      default: 5
    },
    keyField: {
      type: String,
      default: 'id'
    }
  },
  
  setup(props, { emit }) {
    const containerRef = ref(null)
    const scrollTop = ref(0)
    
    // Computed properties
    const totalHeight = computed(() => props.items.length * props.itemHeight)
    
    const startIndex = computed(() => {
      const index = Math.floor(scrollTop.value / props.itemHeight) - props.buffer
      return Math.max(0, index)
    })
    
    const endIndex = computed(() => {
      const visibleCount = Math.ceil(props.containerHeight / props.itemHeight)
      const index = startIndex.value + visibleCount + props.buffer * 2
      return Math.min(props.items.length - 1, index)
    })
    
    const visibleItems = computed(() => {
      const items = []
      for (let i = startIndex.value; i <= endIndex.value; i++) {
        if (props.items[i]) {
          items.push({
            index: i,
            data: props.items[i]
          })
        }
      }
      return items
    })
    
    const offsetY = computed(() => startIndex.value * props.itemHeight)
    
    // Methods
    const handleScroll = () => {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop
        
        // Emit scroll events for infinite loading
        const { scrollTop: top, scrollHeight, clientHeight } = containerRef.value
        
        if (top + clientHeight >= scrollHeight - 100) {
          emit('load-more')
        }
      }
    }
    
    const getItemKey = (item) => {
      return item.data[props.keyField] || item.index
    }
    
    const scrollToIndex = (index) => {
      if (containerRef.value) {
        const targetScrollTop = index * props.itemHeight
        containerRef.value.scrollTop = targetScrollTop
      }
    }
    
    const scrollToItem = (item) => {
      const index = props.items.findIndex(i => i[props.keyField] === item[props.keyField])
      if (index !== -1) {
        scrollToIndex(index)
      }
    }
    
    // Lifecycle
    onMounted(() => {
      if (containerRef.value) {
        containerRef.value.style.height = `${props.containerHeight}px`
      }
    })
    
    // Watchers
    watch(() => props.items.length, () => {
      // Reset scroll when items change significantly
      if (containerRef.value) {
        containerRef.value.scrollTop = 0
        scrollTop.value = 0
      }
    })
    
    return {
      containerRef,
      totalHeight,
      visibleItems,
      offsetY,
      handleScroll,
      getItemKey,
      scrollToIndex,
      scrollToItem
    }
  }
}
</script>

<style scoped>
.virtual-scroll {
  overflow-y: auto;
  position: relative;
}

.virtual-scroll-spacer {
  position: relative;
}

.virtual-scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-scroll-item {
  overflow: hidden;
}
</style>
```

#### Uso do Virtual Scroll

```vue
<template>
  <div class="product-list">
    <VirtualScroll
      :items="products"
      :item-height="120"
      :container-height="600"
      @load-more="loadMoreProducts"
    >
      <template #default="{ item, index }">
        <div class="product-item">
          <img :src="item.image" :alt="item.name" />
          <div class="product-info">
            <h3>{{ item.name }}</h3>
            <p class="price">${{ item.price }}</p>
            <button @click="addToCart(item)">
              Add to Cart
            </button>
          </div>
        </div>
      </template>
    </VirtualScroll>
  </div>
</template>
```

---

### Memoização e Caching

#### `src/composables/useCache.js`

```javascript
import { ref, computed, watch } from 'vue'

/**
 * Sistema de cache reativo
 */
export function useCache(maxSize = 100) {
  const cache = ref(new Map())
  const accessOrder = ref([])
  
  const set = (key, value, ttl = null) => {
    // Remove oldest entries if cache is full
    if (cache.value.size >= maxSize && !cache.value.has(key)) {
      const oldestKey = accessOrder.value.shift()
      cache.value.delete(oldestKey)
    }
    
    const entry = {
      value,
      timestamp: Date.now(),
      ttl
    }
    
    cache.value.set(key, entry)
    
    // Update access order
    const existingIndex = accessOrder.value.indexOf(key)
    if (existingIndex > -1) {
      accessOrder.value.splice(existingIndex, 1)
    }
    accessOrder.value.push(key)
  }
  
  const get = (key) => {
    const entry = cache.value.get(key)
    
    if (!entry) return undefined
    
    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      cache.value.delete(key)
      const index = accessOrder.value.indexOf(key)
      if (index > -1) {
        accessOrder.value.splice(index, 1)
      }
      return undefined
    }
    
    // Update access order
    const index = accessOrder.value.indexOf(key)
    if (index > -1) {
      accessOrder.value.splice(index, 1)
      accessOrder.value.push(key)
    }
    
    return entry.value
  }
  
  const has = (key) => {
    const entry = cache.value.get(key)
    if (!entry) return false
    
    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      cache.value.delete(key)
      return false
    }
    
    return true
  }
  
  const clear = () => {
    cache.value.clear()
    accessOrder.value = []
  }
  
  const size = computed(() => cache.value.size)
  
  return {
    set,
    get,
    has,
    clear,
    size
  }
}

/**
 * Memoização de funções computadas
 */
export function useMemo(fn, dependencies = []) {
  const cache = ref(new Map())
  
  return computed(() => {
    const depsKey = JSON.stringify(dependencies.map(dep => 
      typeof dep === 'function' ? dep() : dep
    ))
    
    if (cache.value.has(depsKey)) {
      return cache.value.get(depsKey)
    }
    
    const result = fn()
    cache.value.set(depsKey, result)
    return result
  })
}

/**
 * Cache para requisições HTTP
 */
export function useHttpCache() {
  const cache = useCache(50)
  
  const cachedRequest = async (url, options = {}) => {
    const cacheKey = `${url}${JSON.stringify(options)}`
    
    // Return cached response if exists
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }
    
    // Make request and cache response
    try {
      const response = await fetch(url, options)
      const data = await response.json()
      
      // Cache for 5 minutes
      cache.set(cacheKey, data, 5 * 60 * 1000)
      
      return data
    } catch (error) {
      throw error
    }
  }
  
  return {
    cachedRequest,
    clearCache: cache.clear
  }
}
```

---

### Otimização de Renderização

#### `src/components/OptimizedList.vue`

```vue
<template>
  <div class="optimized-list">
    <!-- Use v-memo para listas grandes -->
    <div
      v-for="item in paginatedItems"
      :key="item.id"
      v-memo="[item.id, item.updatedAt]"
      class="list-item"
    >
      <ListItem :item="item" />
    </div>
    
    <!-- Pagination -->
    <div class="pagination">
      <button 
        @click="currentPage--"
        :disabled="currentPage === 1"
      >
        Anterior
      </button>
      
      <span>{{ currentPage }} de {{ totalPages }}</span>
      
      <button 
        @click="currentPage++"
        :disabled="currentPage === totalPages"
      >
        Próximo
      </button>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import ListItem from './ListItem.vue'

export default {
  name: 'OptimizedList',
  components: { ListItem },
  props: {
    items: Array,
    pageSize: {
      type: Number,
      default: 20
    }
  },
  
  setup(props) {
    const currentPage = ref(1)
    
    const totalPages = computed(() => 
      Math.ceil(props.items.length / props.pageSize)
    )
    
    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * props.pageSize
      const end = start + props.pageSize
      return props.items.slice(start, end)
    })
    
    return {
      currentPage,
      totalPages,
      paginatedItems
    }
  }
}
</script>
```

#### `src/components/ListItem.vue` (Otimizado)

```vue
<template>
  <div class="list-item-optimized">
    <!-- Usar v-once para dados estáticos -->
    <div v-once class="static-content">
      {{ item.staticData }}
    </div>
    
    <!-- Lazy load de imagens -->
    <img 
      v-if="imageLoaded"
      :src="item.image" 
      :alt="item.name"
      @load="onImageLoad"
      loading="lazy"
    />
    <div v-else class="image-placeholder">
      <div class="skeleton-image"></div>
    </div>
    
    <!-- Conteúdo dinâmico otimizado -->
    <div class="dynamic-content">
      <h3>{{ item.name }}</h3>
      <p>{{ formattedPrice }}</p>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'

export default {
  name: 'ListItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  
  setup(props) {
    const imageLoaded = ref(false)
    
    // Memoizar cálculos pesados
    const formattedPrice = computed(() => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(props.item.price)
    })
    
    const onImageLoad = () => {
      imageLoaded.value = true
    }
    
    // Lazy load de imagem com Intersection Observer
    onMounted(() => {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                imageLoaded.value = true
                observer.disconnect()
              }
            })
          },
          { threshold: 0.1 }
        )
        
        // Observar o componente
        observer.observe(document.querySelector('.list-item-optimized'))
      } else {
        // Fallback para navegadores sem suporte
        imageLoaded.value = true
      }
    })
    
    return {
      imageLoaded,
      formattedPrice,
      onImageLoad
    }
  }
}
</script>

<style scoped>
.skeleton-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
```

---

### PWA e Service Workers

#### `public/sw.js`

```javascript
const CACHE_NAME = 'vue-app-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/app.css',
  '/js/app.js'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
            .map(cacheName => caches.delete(cacheName))
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - Network First with Cache Fallback
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // API requests - Network first
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(event.request, responseClone)
            })
          return response
        })
        .catch(() => {
          return caches.match(event.request)
        })
    )
  } else {
    // Static assets - Cache first
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request)
            .then(fetchResponse => {
              const responseClone = fetchResponse.clone()
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(event.request, responseClone)
                })
              return fetchResponse
            })
        })
    )
  }
})
```

#### `public/manifest.json`

```json
{
  "name": "Vue.js App",
  "short_name": "VueApp",
  "description": "A progressive Vue.js application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007bff",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

### Otimização de CSS

#### CSS Critical Path

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Separate critical CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            if (assetInfo.name.includes('critical')) {
              return 'css/critical-[hash].css'
            }
            return 'css/[name]-[hash].css'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  
  css: {
    preprocessorOptions: {
      scss: {
        // Inject global variables
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

#### `src/styles/critical.scss`

```scss
/* Critical CSS - Above the fold */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.header {
  background: #007bff;
  color: white;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Skeleton loading */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

### Exercícios Práticos

#### Exercício 1: Performance Audit
Implementar monitoramento completo:
- Core Web Vitals tracking
- Bundle size analysis
- Performance budget
- Lighthouse CI integration

#### Exercício 2: Virtual Scrolling Avançado
Criar virtual scroll com:
- Variable item heights
- Horizontal scrolling
- Infinite loading
- Search filtering

#### Exercício 3: PWA Completa
Desenvolver PWA com:
- Offline functionality
- Background sync
- Push notifications
- Install prompt

---

### Comandos Git

```bash
git add .
git commit -m "Aula 10 - Performance e Otimização"
```

---

### Próxima Aula

Na **Aula 11** veremos:
- Deploy em diferentes plataformas
- CI/CD pipelines
- Environment configuration
- Production optimizations