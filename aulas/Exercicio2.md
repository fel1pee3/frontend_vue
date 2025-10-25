# Exercício 2: Buscar e Exibir Dados

## Objetivo
Criar um componente que busca uma lista de dados de uma API e exibe em cards.

## Passo a Passo

### 1. Fazer Requisição à API
- API: `https://jsonplaceholder.typicode.com/posts`
- Buscar lista de posts
- Fazer isso no lifecycle `mounted`

### 2. Armazenar os Dados
- Guardar em `data.posts`
- Mostrar loading enquanto busca

### 3. Exibir em Cards
- Use `v-for` para listar os dados
- Mostre título e primeiras linhas do conteúdo
- Um card por item

## Dicas
- Trate erros de requisição
- Mostre mensagem de carregamento
- Limpe os dados se necessário

## Conceitos Vue.js
- fetch/axios
- v-for
- v-if para loading
- Lifecycle hooks
