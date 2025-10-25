import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CadastroView from '../views/CadastroView.vue'
import PesquisaView from '../views/PesquisaView.vue'
import WizardView from '../views/WizardView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/cadastro',
    name: 'Cadastro',
    component: CadastroView
  },
  {
    path: '/pesquisa',
    name: 'Pesquisa',
    component: PesquisaView
  },
  {
    path: '/wizard',
    name: 'Wizard',
    component: WizardView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
