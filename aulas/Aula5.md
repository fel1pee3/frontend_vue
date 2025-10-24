# Aula 5 - Formulários e Validação em Vue.js

## Objetivo da Aula

Entender como implementar **formulários reativos e validados** em Vue 3, utilizando componentes modulares e validadores reutilizáveis. Esta aula documenta a implementação prática do `FormularioCompleto.vue` que você está executando agora.

## Arquitetura da Solução

### Como Os Arquivos Funcionam Juntos

```
┌─────────────────────────────────────────────┐
│           src/App.vue                       │
│  (Componente Principal - Exibe o layout)   │
│         ↓                                   │
│    Importa FormularioCompleto.vue           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    src/components/FormularioCompleto.vue    │
│  (Componente do Formulário com 6 campos)   │
│         ↓                                   │
│    Importa FormValidator (utils)            │
│    Usa v-model para sincronização           │
│    Valida @blur em cada campo              │
│    Mostra erros dinamicamente               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     src/utils/validators.js                 │
│  (Classe FormValidator - Lógica Pura)      │
│         ↓                                   │
│    Define regras por campo                  │
│    Valida contra essas regras               │
│    Rastreia erros                           │
└─────────────────────────────────────────────┘
```

### O Que é um Formulário Reativo?

Um formulário reativo é aquele que:
- **Sincroniza automaticamente** entrada do usuário com dados (v-model)
- **Valida em tempo real** quando o usuário sai de cada campo (@blur)
- **Mostra feedback** imediato (mensagens de erro em vermelho)
- **Ativa/desativa botões** baseado no estado da validação
- **Integra** componentes separados de forma modular

### Por Que Essa Arquitetura?

**FormValidator em arquivo separado:**
- Pode ser testado independentemente
- Pode ser reutilizado em outras páginas
- Lógica de validação não fica misturada com template
- Fácil de manter e atualizar regras

**Componente FormularioCompleto:**
- Responsável apenas pela apresentação
- Gerencia estado da validação
- Coordena interação com o usuário
- Usa FormValidator para fazer validações

## Conceitos Técnicos Fundamentais

### 1. v-model - Sincronização de Dados (Two-Way Binding)

O `v-model` mantém o campo HTML e a propriedade JavaScript sempre sincronizados:

```vue
<!-- Template -->
<input v-model="nome" type="text">

<!-- Script -->
data() {
  return {
    nome: '' // Começa vazio
  }
}
```

**Fluxo em tempo real:**

1. User digita "João" no input
2. Propriedade `dados.nome` fica "João" automaticamente
3. Se a propriedade mudar no JavaScript, o input também muda
4. Tudo acontece sem recarregar a página

### 2. Evento @blur - Validação ao Sair do Campo

```vue
<input
  v-model="nome"
  @blur="validarCampo('nome')"
>
```

**O que acontece:**
- User escreve no campo (sem validar ainda)
- User clica em outro campo (sai do atual)
- @blur dispara e executa `validarCampo('nome')`
- Campo fica vermelho se tiver erro, verde se válido
- Mensagem de erro aparece embaixo

### 3. Classes Dinâmicas - Mudar Estilo Baseado em Estado

```vue
<input
  :class="{ 
    'is-invalid': erros.nome,    <!-- vermelho se tem erro -->
    'is-valid': validado.nome && !erros.nome  <!-- verde se válido -->
  }"
  v-model="nome"
>
```

### 4. Propriedades Computadas - Valores Derivados

```javascript
computed: {
  formValid() {
    // Retorna true se TODOS os campos são válidos
    return Object.values(this.erros).every(erro => !erro)
  }
}
```

**Por que usar:**
- Calcula em tempo real conforme dados mudam
- Fica armazenada em cache (eficiente)
- Reutilizável no template

---

## Estrutura do Projeto

```
src/
├── main.js                     ← Inicializa aplicação
├── App.vue                     ← Layout principal
├── components/
│   └── FormularioCompleto.vue  ← Formulário com 6 campos
├── utils/
│   └── validators.js           ← Classe FormValidator
└── services/
    └── api.js                  ← Integrações futuras
```

---

## Entendendo o FormularioCompleto.vue

### Estrutura Geral do Componente

O `FormularioCompleto.vue` é um formulário com **6 campos organizados em 2 seções:**

**Seção 1: Dados Pessoais**
- Nome (obrigatório, mínimo 3 caracteres)
- Email (obrigatório, formato válido)
- CPF (obrigatório, 11 dígitos)
- Telefone (obrigatório, formato válido)

**Seção 2: Endereço**
- CEP (obrigatório)
- Logradouro (obrigatório)

### Dados Iniciais (data())

```javascript
data() {
  return {
    form: {
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      cep: '',
      logradouro: ''
    },
    validator: null,              // Instância FormValidator
    validatedFields: new Set(),   // Quais campos já foram validados
    submitting: false             // Se está enviando
  }
}
```

**Por que `validatedFields` é um Set?**
- Rastreia quais campos o usuário JÁ tentou preencher
- Não mostra erro em campo que usuário não tocou
- Melhora experiência: só mostra erros relevantes

### Método setupValidation()

```javascript
setupValidation() {
  this.validator = new FormValidator()
  
  this.validator.setRules({
    nome: ['required', 'min:3'],
    email: ['required', 'email'],
    cpf: ['required', 'cpf'],
    telefone: ['required'],
    cep: ['required'],
    logradouro: ['required']
  })
}
```

**O que acontece aqui:**
1. Cria nova instância de `FormValidator`
2. Define QUAIS regras cada campo deve seguir
3. Regras são strings: `'required'`, `'min:3'`, `'email'`, `'cpf'`
4. FormValidator interpreta essas strings e aplica validações

### Método validateField(fieldName)

```javascript
validateField(fieldName) {
  // Marca que este campo foi tocado pelo usuário
  this.validatedFields.add(fieldName)
  
  // Pede ao validator para validar
  const isValid = this.validator.validateField(
    fieldName,
    this.form[fieldName]
  )
  
  return isValid
}
```

**Fluxo:**
1. User sai de um campo (dispara @blur)
2. Método é chamado com o nome do campo
3. Marca campo como "já visto pelo usuário"
4. Pede ao validator para checá-lo
5. Validator retorna true/false

### Método handleSubmit()

```javascript
handleSubmit() {
  // Valida TODOS os campos
  const allValid = this.validator.validate(this.form)
  
  if (!allValid) {
    alert('Por favor, corrija os erros')
    return
  }
  
  this.submitting = true
  // Aqui enviaria para servidor
  setTimeout(() => {
    this.submitting = false
  }, 1000)
}
```

**Responsabilidades:**
1. Valida tudo antes de enviar
2. Se houver erro, mostra alerta
3. Se tudo OK, simula envio (1 segundo)
4. Desabilita botão enquanto envia

### Propriedade Computada formValid

```javascript
computed: {
  formValid() {
    // Todos os 6 campos devem estar sem erros
    return !this.validator || 
           Object.values(this.form).every(val => val && val.trim()) &&
           !Object.keys(this.validator.errors).length
  }
}
```

**O que ela faz:**
- Retorna `true` se NENHUM campo tem erro
- Retorna `false` se qualquer campo tem erro
- Vue.js atualiza isso automaticamente conforme usuário digita
- Resultado é usado para habilitar/desabilitar botão Enviar

---

## Fluxo Completo de Uso

### Passo a Passo

**Situação:** User está na página, campo Nome está vazio

```
1. User digita "Jo" no campo
   └─ v-model atualiza form.nome = "Jo"
   └─ Template atualiza em tempo real

2. User sai do campo (clica em Email)
   └─ @blur dispara validateField('nome')
   └─ validatedFields.add('nome')
   └─ validator.validateField('nome', 'Jo')
      └─ Testa regra 'required': ✓ Passou
      └─ Testa regra 'min:3': ✗ Falhou!
      └─ Retorna erro: "Mínimo 3 caracteres"
   └─ Campo fica VERMELHO (is-invalid)
   └─ Mensagem de erro aparece

3. User continua digitando: "João"
   └─ v-model atualiza form.nome = "João"
   └─ Mas não valida ainda (só valida @blur)

4. User sai de novo de Nome (click em outro campo)
   └─ @blur dispara validateField('nome') de novo
   └─ validator.validateField('nome', 'João')
      └─ Testa regra 'required': ✓ Passou
      └─ Testa regra 'min:3': ✓ Passou!
      └─ Retorna true (sem erro)
   └─ Campo fica VERDE (is-valid)
   └─ Mensagem de erro desaparece

5. User clica no botão "Enviar"
   └─ @submit dispara handleSubmit()
   └─ validator.validate(form) valida TODOS
   └─ Se algum campo inválido: mostra alerta
   └─ Se todos válidos:
      └─ submitting = true
      └─ Botão fica desabilitado
      └─ Simula envio (1 segundo)
      └─ Mostra sucesso
```

---

## Tabela de Campos e Validações

| Campo | Tipo | Regras | Exemplo Válido |
|-------|------|--------|---|
| Nome | Texto | required, min:3 | "João Silva" |
| Email | Email | required, email | "joao@email.com" |
| CPF | Texto | required, cpf | "12345678901" |
| Telefone | Texto | required | "(11) 99999-9999" |
| CEP | Texto | required | "12345-678" |
| Logradouro | Texto | required | "Rua das Flores" |

---

## Entendendo a Classe FormValidator

A classe `FormValidator` em `src/utils/validators.js` é responsável por toda a validação.

### Como Funciona

```javascript
class FormValidator {
  constructor() {
    this.rules = {}        // Armazena {campo: ['regra1', 'regra2']}
    this.errors = {}       // Armazena {campo: 'mensagem erro'}
  }

  setRules(rules) {
    this.rules = rules
    return this            // Permite encadeamento
  }

  validateField(fieldName, fieldValue) {
    // 1. Pega as regras para este campo
    // 2. Aplica cada regra à fieldValue
    // 3. Se alguma falhar, retorna false
    // 4. Se todas passarem, retorna true
  }

  validate(formData) {
    // Valida TODOS os campos de uma vez
  }

  getErrors() {
    return this.errors
  }
}
```

### Regras Suportadas

- `'required'` → Campo não pode estar vazio
- `'email'` → Deve ser formato de email válido
- `'cpf'` → Deve ter 11 dígitos (CPF)
- `'min:3'` → Mínimo de 3 caracteres
- `'minLength:3'` → Mesmo que min

---

## Como Executar Este Projeto

### 1. Instale Dependências

```bash
npm install
```

### 2. Rode o Servidor de Desenvolvimento

```bash
npm run dev
```

### 3. Acesse no Navegador

```
http://localhost:5173
```

---

## Estrutura dos Arquivos

### src/main.js
```javascript
// Inicializa a aplicação Vue
createApp(App).mount('#app')
```

### src/App.vue
```javascript
// Importa e exibe FormularioCompleto.vue
// Usa Bootstrap para layout (grid)
// Header com título da aula
```

### src/components/FormularioCompleto.vue
```javascript
// Componente principal
// 6 campos + validação
// Métodos: setupValidation, validateField, handleSubmit, resetForm
// Propriedade computada: formValid
```

### src/utils/validators.js
```javascript
// Classe FormValidator
// Métodos: setRules, validateField, validate, getErrors
// Suporta regras customizadas
```

---

## Conceitos Importantes

### Reatividade em Vue
Quando você altera `form.nome`, Vue detecta e re-renderiza o template automaticamente.

### Validação em Duas Camadas
1. **Cliente** (JavaScript): Feedback imediato, melhor UX
2. **Servidor** (Backend): Seguro, não pode ser burlado

### Por Que Usar Classe FormValidator
- Pode ser testada independentemente
- Reutilizável em outros componentes
- Lógica separada da apresentação

---

## Exercícios

1. **Exercício 1 (Exercicio1.md):**
   - Refatore o formulário em 4 componentes separados
   - Cada seção em um componente diferente

2. **Exercício 2 (Exercicio2.md):**
   - Crie um formulário de busca com filtros dinâmicos

3. **Exercício 3 (Exercicio3.md):**
   - Crie um formulário em múltiplas etapas (wizard)
