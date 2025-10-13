## Aula 1 — Introdução ao Vue.js

### Objetivos
- Entender o que é Vue.js e suas vantagens
- Configurar o ambiente de desenvolvimento
- Criar o primeiro componente Vue
- Entender a estrutura básica de um projeto Vue
- Conceitos fundamentais: reatividade, templates, data binding

---

### O que é Vue.js?

Vue.js é um framework JavaScript progressivo para construção de interfaces de usuário (UI). É conhecido por:

- **Reatividade**: Atualizações automáticas da UI quando dados mudam
- **Componentes**: Estrutura modular e reutilizável
- **Simplicidade**: Curva de aprendizado suave
- **Flexibilidade**: Pode ser adotado incrementalmente
- **Ecosystem**: Vue Router, Pinia, Vite, etc.

---

### Comparação com o Backend Flask

| Aspecto | Flask (Backend) | Vue.js (Frontend) |
|---------|----------------|-------------------|
| **Função** | Servidor, API, lógica de negócio | Interface do usuário, experiência |
| **Renderização** | Server-side (templates Jinja2) | Client-side (reativo) |
| **Estados** | Sessões, banco de dados | Estados locais e globais |
| **Comunicação** | HTTP requests/responses | Consume APIs via HTTP |

---

### Instalação e Configuração

#### Pré-requisitos
```bash
# Verificar Node.js (necessário 16+)
node --version
npm --version
```
#### Criando nosso projeto
```bash
#Isso vai criar o diretório do nosso projeto
npm create vue@latest "Primeira Aula Vue"
```

#### Instalando Dependências
```bash
# No diretório do projeto
npm install

# Verificar se foi instalado
npm list vue
```

#### Executando o Projeto
```bash
# Servidor de desenvolvimento
npm run dev

# Acesse: http://localhost:3000
```

---

### Estrutura Básica de um Projeto Vue

```
frontend_vue/
├── public/              # Arquivos estáticos
│   └── favicon.ico     
├── src/                # Código fonte
│   ├── components/     # Componentes reutilizáveis
│   ├── views/          # Páginas/telas
│   ├── assets/         # Recursos (CSS, imagens)
│   ├── App.vue         # Componente raiz
│   └── main.js         # Ponto de entrada
├── index.html          # HTML principal
├── package.json        # Configurações e dependências
└── vite.config.js      # Configurações do Vite
```

---

### Anatomia de um Componente Vue

Um arquivo `.vue` contém três seções:

```vue
<template>
  <!-- HTML do componente -->
  <div class="hello">
    <h1>{{ titulo }}</h1>
    <button @click="incrementar">Cliques: {{ contador }}</button>
  </div>
</template>

<script>
// Lógica JavaScript
export default {
  name: 'HelloWorld',
  data() {
    return {
      titulo: 'Minha Primeira Aula Vue!',
      contador: 0
    }
  },
  methods: {
    incrementar() {
      this.contador++
    }
  }
}
</script>

<style scoped>
/* CSS específico deste componente */
.hello {
  text-align: center;
  padding: 20px;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
}
</style>
```

---

### Conceitos Fundamentais

#### 1. **Data Binding**
```vue
<template>
  <!-- Interpolação de texto -->
  <p>{{ mensagem }}</p>
  
  <!-- Binding de atributo -->
  <img :src="imagemUrl" :alt="descricao">
  
  <!-- Two-way binding -->
  <input v-model="nome" placeholder="Digite seu nome">
  <p>Olá, {{ nome }}!</p>
</template>

<script>
export default {
  data() {
    return {
      mensagem: 'Hello Vue!',
      imagemUrl: '/logo.png',
      descricao: 'Logo Vue',
      nome: ''
    }
  }
}
</script>
```

#### 2. **Event Handling**
```vue
<template>
  <div>
    <button @click="saudar">Dizer Olá</button>
    <button @click="saudar('Vue.js')">Dizer Olá Vue</button>
    
    <form @submit.prevent="enviarFormulario">
      <input v-model="email" type="email" required>
      <button type="submit">Enviar</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: ''
    }
  },
  methods: {
    saudar(nome = 'Mundo') {
      alert(`Olá, ${nome}!`)
    },
    enviarFormulario() {
      console.log('Email enviado:', this.email)
    }
  }
}
</script>
```

#### 3. **Reatividade**
```vue
<template>
  <div>
    <h2>Carrinho de Compras</h2>
    <p>Total de itens: {{ totalItens }}</p>
    <p>Valor total: R$ {{ valorTotal.toFixed(2) }}</p>
    
    <button @click="adicionarItem">Adicionar Item</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      itens: [
        { nome: 'Produto A', preco: 10.50 },
        { nome: 'Produto B', preco: 25.00 }
      ]
    }
  },
  computed: {
    totalItens() {
      return this.itens.length
    },
    valorTotal() {
      return this.itens.reduce((total, item) => total + item.preco, 0)
    }
  },
  methods: {
    adicionarItem() {
      this.itens.push({
        nome: `Produto ${this.itens.length + 1}`,
        preco: Math.random() * 50
      })
    }
  }
}
</script>
```

---

### Exercícios Práticos

#### Exercício 1: Contador Personalizado
Crie um componente que:
- Tenha um contador que inicia em 0
- Botões para +1, -1, +5, -5
- Não permita valores negativos
- Mostre uma mensagem quando chegar a 10

#### Exercício 2: Lista de Tarefas Simples
Crie um componente que:
- Tenha um input para nova tarefa
- Lista de tarefas adicionadas
- Contador de tarefas total

#### Exercício 3: Calculadora IMC
Crie um componente que:
- Inputs para peso e altura
- Calcule o IMC automaticamente
- Mostre a classificação (baixo peso, normal, sobrepeso, etc.)

---

### Conectando com o Backend Flask

Para esta aula, vamos fazer uma conexão simples:

```vue
<template>
  <div>
    <h2>Dados do Backend</h2>
    <div v-if="carregando">Carregando...</div>
    <ul v-else>
      <li v-for="pessoa in pessoas" :key="pessoa.id">
        {{ pessoa.nome }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pessoas: [],
      carregando: true
    }
  },
  async mounted() {
    try {
      // Simulando chamada à API Flask
      // Na Aula 3 veremos como fazer isso direito
      const response = await fetch('http://localhost:5000/api/dados')
      this.pessoas = await response.json()
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      this.pessoas = []
    } finally {
      this.carregando = false
    }
  }
}
</script>
```

---

### Arquivos Criados Nesta Aula

Após completar esta aula, você terá:

1. `src/main.js` - Ponto de entrada da aplicação
2. `src/App.vue` - Componente raiz
3. `src/components/HelloWorld.vue` - Primeiro componente
4. `src/components/Contador.vue` - Exercício 1
5. `src/components/ListaTarefas.vue` - Exercício 2
6. `src/components/CalculadoraIMC.vue` - Exercício 3

---

### Comandos Git para Esta Aula

```bash
# Adicionar arquivos ao git
git add .
git commit -m "Aula 1 - Introdução ao Vue.js"

# Criar branch da aula 1
git checkout -b aula-01-introducao
git push -u origin aula-01-introducao

# Voltar para main
git checkout main
```

---

### Checklist de Verificação

- [ ] Projeto Vue rodando sem erros
- [ ] Entendimento de template, script e style
- [ ] Data binding funcionando
- [ ] Event handling implementado
- [ ] Exercícios práticos concluídos
- [ ] Teste básico de conexão com Flask (opcional)

---

### Próxima Aula

Na **Aula 2** veremos:
- Diretivas condicionais (v-if, v-show)
- Loops com v-for
- Criação de componentes reutilizáveis
- Comunicação entre componentes
- Props e emissão de eventos

### Dicas Adicionais

- Use as **Vue DevTools** no navegador para debug
- O **Vite** oferece hot-reload automático
- Explore a documentação oficial: https://vuejs.org/
- Pratique os conceitos de reatividade - é fundamental!
