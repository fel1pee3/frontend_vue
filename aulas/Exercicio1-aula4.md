# Exercício 1: Sistema de Blog

## Objetivo
Criar um blog usando Vue Router com páginas para listar posts e visualizar detalhes.

## O que Fazer

### 1. Configurar Vue Router
- Instale Vue Router
- Crie arquivo de rotas: `src/router/index.js`
- Defina rotas:
  - `/` - Home/Lista de posts
  - `/post/:id` - Detalhes do post

### 2. Componente Home (Lista de Posts)
- Exiba lista de posts com título e resumo
- Link para ver detalhes

### 3. Componente Post (Detalhes)
- Mostre post completo
- Use `route.params.id` para pegar o ID
- Link voltar para home

### 4. Posts de Exemplo
```javascript
const posts = [
  { id: 1, title: 'Post 1', content: 'Conteúdo do post 1', category: 'Tech' },
  { id: 2, title: 'Post 2', content: 'Conteúdo do post 2', category: 'Life' },
  { id: 3, title: 'Post 3', content: 'Conteúdo do post 3', category: 'Tech' }
]
```

## Conceitos
- Vue Router: rotas, componentes, navegação
- Router link e router view
- Route parameters
