# Exercício 3: CRUD Simples

## Objetivo
Criar uma aplicação completa de cadastro de produtos com operações CRUD.

## Operações Necessárias

### 1. Listar Produtos
- Mostrar todos os produtos em uma lista
- Cada produto com suas informações

### 2. Criar Novo Produto
- Form com campos: nome, preço, descrição
- Botão adicionar
- Limpar form após adicionar

### 3. Editar Produto
- Carregar dados do produto em um form
- Permitir alteração
- Botão salvar alterações

### 4. Deletar Produto
- Botão deletar em cada produto
- Remover da lista

## Dados Locais
- Use um array em `data.produtos`
- Cada produto: `{id, nome, preco, descricao}`
- Gere IDs automaticamente

## Dicas
- Form único para criar e editar
- Use v-if/v-show para mostrar/esconder form
- Valide campos vazios

## Conceitos Vue.js
- v-for para listar
- v-model para form
- Array methods (push, splice, find)
- Computed properties opcionais
