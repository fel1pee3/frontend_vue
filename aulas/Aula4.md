## Aula 4 — Roteamento com Vue Router

### O que é SPA (Single Page Application)?

Uma **SPA** é uma aplicação web que carrega uma única página HTML e atualiza o conteúdo dinamicamente conforme o usuário interage, sem recarregar a página inteira.

**Vantagens:**
- Navegação mais rápida (sem reload)
- Melhor experiência do usuário
- Menos requisições ao servidor

O **Vue Router** é a biblioteca oficial de roteamento do Vue.js que nos permite criar SPAs.

### Instalação e Configuração

1. Instale o Vue Router:
```bash
npm install vue-router
```

2. Configure o Router:

No arquivo `src/router/index.js`:
```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/sobre',
    name: 'About',
    component: () => import('@/views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

3. Ative o Router:

No arquivo `src/main.js`:
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### Tipos de Navegação no Vue Router

O Vue Router oferece duas formas principais de navegação, cada uma com seus casos de uso específicos:

#### 1. Navegação Declarativa (router-link)

O componente `router-link` é ideal para links de navegação fixos e diretos:

```vue
<!-- Link simples -->
<router-link to="/">Home</router-link>

<!-- Link com parâmetros -->
<router-link :to="{ name: 'User', params: { id: 123 }}">
  Ver Usuário
</router-link>

<!-- Link com query params -->
<router-link :to="{ path: '/produtos', query: { categoria: 'eletronicos' }}">
  Eletrônicos
</router-link>
```

**Vantagens da Navegação Declarativa**:

- Sintaxe mais simples e direta
- Gerenciamento automático de classes ativas
- Comportamento de link nativo (clique direito, etc.)
- Melhor para SEO e acessibilidade

**Casos de Uso**:

- Menus de navegação
- Links consistentes
- Breadcrumbs
- Navegação principal do site

#### 2. Navegação Programática (via código)

Usar `this.$router` permite maior controle e navegação dinâmica:

```javascript
methods: {
  // Navegação simples
  irParaHome() {
    this.$router.push('/')
  },

  // Navegação com parâmetros
  verPerfil(userId) {
    this.$router.push({
      name: 'User',
      params: { id: userId }
    })
  },

  // Navegação com query
  buscarProdutos(filtros) {
    this.$router.push({
      path: '/produtos',
      query: {
        categoria: filtros.categoria,
        ordem: filtros.ordenacao,
        pagina: 1
      }
    })
  },

  // Controle de histórico
  voltar() {
    this.$router.go(-1)
  }
}
```

**Vantagens da Navegação Programática**:

- Maior flexibilidade e controle
- Navegação condicional
- Manipulação de estados complexos
- Integração com lógica de negócio

**Casos de Uso**:

- Formulários de busca
- Redirecionamentos após ações
- Navegação baseada em condições
- Fluxos de autenticação

### Monitoramento de Navegação

O Vue Router permite monitorar mudanças de rota de diferentes formas:

```javascript
export default {
  // 1. Usando watcher
  watch: {
    '$route'(to, from) {
      console.log('Rota mudou:', { 
        de: { nome: from.name, params: from.params }, 
        para: { nome: to.name, params: to.params } 
      })
    }
  },

  // 2. Usando guards do componente
  beforeRouteEnter(to, from, next) {
    // Chamado antes de entrar na rota
    next()
  },

  beforeRouteUpdate(to, from, next) {
    // Chamado quando a rota muda mas o componente é reutilizado
    next()
  },

  beforeRouteLeave(to, from, next) {
    // Chamado antes de sair da rota
    next()
  }
}
```

**Informações Disponíveis**:

- `$route.path`: Caminho atual
- `$route.name`: Nome da rota
- `$route.params`: Parâmetros da URL
- `$route.query`: Query strings
- `$route.hash`: Hash da URL
- `$route.meta`: Metadados da rota
```

### Rotas com Parâmetros

1. **Definindo a rota**:
```javascript
{
  path: '/usuario/:id',
  name: 'User',
  component: () => import('@/views/User.vue'),
  props: true  // Passa parâmetros como props
}
```

2. **Usando a rota**:
```vue
<router-link :to="{ name: 'User', params: { id: 123 }}">
  Ver usuário
</router-link>
```

3. **Acessando parâmetros**:
```javascript
// No componente User.vue
export default {
  props: ['id'],
  created() {
    console.log('ID do usuário:', this.id)
  }
}
```

### Estrutura dos Componentes

Nossa aplicação é dividida em três componentes principais, cada um com sua responsabilidade específica:

#### 1. Layout Principal (App.vue)

O componente App serve como nosso layout principal e implementa:

- **Navegação Global**: 
  - Barra de navegação consistente
  - Links principais do aplicativo
  - Estilos e animações de transição

- **Painel de Informações da Rota**:
  - Exibição em tempo real dos dados da rota atual
  - Visualização de parâmetros e query strings
  - Monitoramento de mudanças via watcher

#### 2. Página Inicial (Home.vue)

O componente Home demonstra os diferentes tipos de navegação disponíveis no Vue Router:

- **Navegação Declarativa (router-link)**:
  - Links simples e diretos (`<router-link to="/sobre">`)
  - Links com parâmetros (`<router-link :to="{ name: 'User', params: { id: 1 } }">`)
  - Estilização e classes ativas automáticas

- **Navegação Programática (métodos)**:
  - Navegação via código (`this.$router.push()`)
  - Passagem de parâmetros complexos
  - Manipulação de histórico
  - Redirecionamentos condicionais

#### 2. Página Sobre (About.vue)

Um componente simples que demonstra:

- **Navegação Básica**:
  - Retorno à página inicial
  - Exemplo de conteúdo estático
  - Demonstração de transições

#### 3. Página de Usuário (User.vue)

Um componente que demonstra o uso de parâmetros:

- **Funcionalidades**:
  - Recebimento de ID via parâmetro
  - Exibição de dados dinâmicos
  - Navegação programática

### Estrutura do Projeto

Nossa aplicação está organizada da seguinte forma:

```plaintext
src/
  views/          # Componentes de página
    Home.vue      # Página inicial com exemplos de navegação
    About.vue     # Página "Sobre" com exemplo de conteúdo estático
    User.vue      # Página de usuário com exemplo de parâmetros
  router/
    index.js      # Configuração das rotas
  App.vue         # Componente principal com layout e monitoramento de rotas
```

### Padrões e Boas Práticas

2. **Organização dos Componentes**:
- Separação clara entre template, script e estilos
- Uso apropriado de props e métodos
- Implementação de guards quando necessário

3. **Padrões de Código**:
- Nomes descritivos para rotas e componentes
- Uso consistente de estilos
- Comentários explicativos em seções complexas

### Guards de Navegação

Os Guards são funções que permitem controlar o fluxo de navegação. Existem três tipos:

#### Guards Globais
- `beforeEach`: Executado antes de qualquer navegação
- `beforeResolve`: Executado após a resolução dos componentes
- `afterEach`: Executado após a conclusão da navegação

**Casos de Uso**:
- Verificação de autenticação
- Loading global
- Tracking de páginas
- Verificação de permissões

#### Guards por Rota
Úteis para:
- Verificação de permissões específicas
- Carregamento de dados necessários
- Validações específicas da rota

#### Guards de Componente
Implementados nos componentes:
- `beforeRouteEnter`: Antes de entrar na rota
- `beforeRouteUpdate`: Quando a rota é atualizada
- `beforeRouteLeave`: Antes de sair da rota

### Exercícios Práticos

#### Exercício 1: Sistema de Blog
Veja o arquivo `Exercicio1.md` para criar um blog usando Vue Router.

#### Exercício 2: Painel Administrativo
Estenda o exercício 1 adicionando:
- Crie um formulário para adicionar novos posts
- Adicione categorias aos posts
- Implemente uma busca de posts


#### Exercício 3: Melhorias de UX
Adicione ao seu blog:
- Animações de transição entre páginas
- Loading bar durante navegação
- Breadcrumbs para navegação


### Problemas Comuns e Soluções

#### 1. Páginas em Branco

Se suas páginas estão aparecendo em branco, verifique os seguintes pontos:

**Configuração do Router no main.js**:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'  // Não esqueça de importar
import './style.css'

const app = createApp(App)
app.use(router)  // Certifique-se de ativar o router
app.mount('#app')
```

**Caminhos de Importação**:

No `router/index.js`, se você não configurou o alias `@`, use caminhos relativos:

```javascript
// Ao invés de:
component: () => import('@/views/Home.vue')

// Use:
component: () => import('../views/Home.vue')
```

**Estrutura de Arquivos**:

Certifique-se de que todos os componentes existem nos caminhos corretos:

```plaintext
src/
  views/
    Home.vue
    About.vue
    User.vue
```

#### 2. Erros de Navegação

Para resolver problemas de navegação, verifique:

- Verifique se o `<router-view>` está presente no App.vue
- Certifique-se de que os nomes das rotas correspondem aos usados na navegação
- Confirme se os parâmetros obrigatórios estão sendo passados

### Próximos Passos

Agora que você entende os conceitos básicos do Vue Router e como resolver problemas comuns, você pode:

1. Explorar a documentação oficial para recursos avançados
2. Implementar autenticação em suas rotas
3. Criar layouts mais complexos com rotas aninhadas
4. Usar lazy loading para melhorar performance

Na **Aula 5** veremos:

- Formulários reativos
- Validações
- Integração com APIs
