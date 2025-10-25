# Exercício 1: Testar Conexão com API

## Objetivo
Criar um componente simples que testa a conexão com uma API pública.

## Passo a Passo

### 1. Escolher uma API Pública
- Usaremos: `https://jsonplaceholder.typicode.com/posts/1`
- Esta API retorna um post simples em JSON

### 2. Fazer uma Requisição HTTP
- Use `fetch()` ou `axios`
- Faça a requisição quando o componente for montado (lifecycle `mounted`)

### 3. Exibir o Resultado
- Botão para testar conexão
- Mostrar se funcionou ou se houver erro
- Exibir os dados recebidos

## Exemplo de Resposta
```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident...",
  "body": "quia et suscipit..."
}
```

## Conceitos Vue.js
- Lifecycle Hooks: `mounted`
- Data binding
- Event handling
- Tratamento de erros com try/catch
