# Exercício 2: Painel Administrativo

## Objetivo
Estender o exercício 1 adicionando funcionalidades de administração.

## O que Fazer

### 1. Formulário para Adicionar Posts
- Crie componente `AdminPanel.vue`
- Form com campos: título, conteúdo, categoria
- Botão para adicionar novo post
- Nova rota: `/admin`

### 2. Adicionar Categorias
- Cada post tem uma categoria
- Mostre categoria no card do post
- Permita selecionar categoria no form

### 3. Implementar Busca
- Campo de busca na home
- Filtre posts por título ou categoria
- Atualize em tempo real enquanto digita

## Funcionalidades Esperadas
- Adicionar novos posts
- Filtrar por categoria
- Buscar por texto

## Dicas
- Use v-model para o form
- Computed properties para filtrar
- Armazene posts em componente pai ou state global
