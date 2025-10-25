# Aula 01 - Exercícios Práticos

Este arquivo documenta os exercícios desenvolvidos na Aula 01 do curso de Vue.js.

## Exercício 1: Contador

### Requisitos Implementados:
- ✅ Contador que inicia em 0
- ✅ Botões para +1, -1, +5, -5
- ✅ Não permite valores negativos
- ✅ Mensagem especial quando chega a 10

### Conceitos Vue.js Aplicados:
- **Data Binding**: Exibição reativa do valor do contador
- **Event Handling**: Métodos vinculados aos cliques dos botões
- **Conditional Rendering**: Mensagem condicional com `v-if`
- **Computed Properties**: Lógica para desabilitar botões
- **CSS Scoped**: Estilos isolados do componente

### Arquivo: `src/components/Contador.vue`

## Exercício 2: Lista de Tarefas Simples

### Requisitos Implementados:
- ✅ Input para nova tarefa
- ✅ Lista de tarefas adicionadas
- ✅ Contador de tarefas total

### Funcionalidades Extras:
- ✅ Remoção individual de tarefas
- ✅ Botão para limpar todas as tarefas
- ✅ Validação de entrada (não permite tarefas vazias)
- ✅ Suporte ao Enter para adicionar tarefa
- ✅ Numeração automática das tarefas
- ✅ Confirmação antes de limpar todas

### Conceitos Vue.js Aplicados:
- **Two-way Data Binding**: `v-model` no input
- **List Rendering**: `v-for` para renderizar tarefas
- **Event Modifiers**: `@keyup.enter` para adicionar com Enter
- **Computed Properties**: Cálculo automático do total de tarefas
- **Array Methods**: `push()` e `splice()` para manipular lista
- **Conditional Rendering**: Mensagem quando lista está vazia

### Arquivo: `src/components/ListaTarefas.vue`

## Como Executar

1. Certifique-se de estar na branch `aula01`:
   ```bash
   git checkout aula01
   ```

2. Instale as dependências (se necessário):
   ```bash
   npm install
   ```

3. Execute o projeto:
   ```bash
   npm run dev
   ```

4. Acesse o navegador no endereço indicado (geralmente `http://localhost:5173`)

## Estrutura dos Componentes

### Contador.vue
```
template: Interface visual com botões e display
script: Lógica de incremento/decremento e validações
style: Estilos com animações e responsividade
```

### ListaTarefas.vue
```
template: Form de input, lista de tarefas e controles
script: Métodos para adicionar, remover e gerenciar tarefas
style: Layout flexível e visual limpo
```

## Próximos Passos

Estes exercícios servem como base para conceitos mais avançados como:
- Comunicação entre componentes
- Gerenciamento de estado
- Roteamento
- APIs e requisições HTTP
- Testes unitários