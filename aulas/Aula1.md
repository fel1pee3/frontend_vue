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

#### 1. < template> — o visual (HTML)

Aqui vai o que aparece na tela.
```vue
<template>
  <div class="hello">
    <h1>{{ titulo }}</h1>
    <button @click="incrementar">Cliques: {{ contador }}</button>
  </div>
</template>
```
Tudo dentro de <template> é o markup(Marcação).
As chaves {{ ... }} são interpolação: mostram valores dinâmicos do data() ou computed.
- {{ titulo }} → mostra o texto definido no JavaScript.
- {{ contador }} → mostra o número atual do contador.

O @click="incrementar" é um event binding, ou seja, quando clicar no botão, ele chama o método incrementar().

#### 2. < script> — A lógica (JavaScript)

Aqui fica o “cérebro” do componente.

```vue
<script>
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
```

- export default é obrigatório — define o que o Vue vai usar quando importar o componente.
- name: só dá um nome pro componente (útil pra debug e DevTools).
- data(): função que retorna um objeto com os dados do componente.

Esses dados são reativos — se mudarem, o Vue atualiza automaticamente o HTML.
- methods: funções que o componente pode usar, como o incrementar().

Quando o botão é clicado, this.contador++ muda o valor do contador e o Vue atualiza a tela sem recarregar a página.

#### 3. < style scoped> — O visual (CSS)

Aqui vem o estilo do componente:

```vue
<style scoped>
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
- O scoped faz o CSS valer só pra este componente, evitando que ele afete outros.
- Sem scoped, o CSS é global (pode vazar pra outros componentes).

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
As chaves duplas {{ }} mostram o valor de uma variável do data().

Se o valor mudar no JavaScript, o Vue atualiza o texto automaticamente na tela.

v-bind: (ou só :) serve pra ligar um atributo HTML a uma variável do Vue.

No exemplo acima:
- O src da imagem vem do imagemUrl
- O alt vem de descricao

É como se fosse:
```html
<img src="/logo.png" alt="Logo Vue">
```
Mas se imagemUrl mudar, o src muda na hora também.

```vue
<input v-model="nome" placeholder="Digite seu nome">
<p>Olá, {{ nome }}!</p>
```
Aqui é um binding de mão dupla:
- Quando o usuário digita no input → o valor de nome muda.
- Quando nome muda no JS → o input mostra o novo valor.

Então se você digitar “Rodrigo” no campo, o Vue atualiza nome automaticamente e o <p> mostra:

Olá, Rodrigo!

Sem precisar usar um document.querySelector ou onChange — o Vue cuida de tudo.

#### 2. **Event Handling**

O Event Handling (tratamento de eventos) é a forma de reagir a interações do usuário, como cliques e envios de formulários.
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
Explicações:

- @click é um atalho para v-on:click — usado pra escutar eventos.
- @submit.prevent evita que o formulário recarregue a página.
- Os métodos dentro de methods são chamados quando os eventos disparam.


#### 3. **Reatividade**

A reatividade é o coração do Vue.
Quando você altera um dado dentro do data(), qualquer lugar do template que dependa dele é atualizado automaticamente.
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
Explicações:
- data(): contém a lista de itens do carrinho.
- computed: propriedades reativas que calculam valores derivados dos dados:
- totalItens: quantidade de itens no carrinho.
- valorTotal: soma dos preços de todos os itens.
- methods: funções que alteram os dados.
- adicionarItem(): adiciona um novo produto à lista.

Quando clicamos em Adicionar Item, a lista itens é atualizada, e o Vue recalcula automaticamente totalItens e valorTotal, mostrando na tela sem precisar mexer no DOM manualmente.

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

### Arquivos Criados Nesta Aula

Após completar esta aula, você terá:

1. `src/main.js` - Ponto de entrada da aplicação
2. `src/App.vue` - Componente raiz
3. `src/components/HelloWorld.vue` - Primeiro componente
4. `src/components/Contador.vue` - Exercício 1
5. `src/components/ListaTarefas.vue` - Exercício 2
6. `src/components/CalculadoraIMC.vue` - Exercício 3

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
