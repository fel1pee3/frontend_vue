import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './style.css'

// Criar e montar a aplicação Vue
const app = createApp(App)
app.use(router)
app.mount('#app')

console.log('🚀 Aplicação Vue iniciada - Aula 6!')
console.log('📚 CRUD de Produtos com Auditoria')