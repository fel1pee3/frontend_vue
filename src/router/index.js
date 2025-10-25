import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProdutosView from '../views/ProdutosView.vue'
import AuditoriaView from '../views/AuditoriaView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: ProdutosView
  },
  {
    path: '/auditoria',
    name: 'Auditoria',
    component: AuditoriaView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
