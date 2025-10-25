# Exercício 3: Melhorias de UX

## Objetivo
Adicionar animações e melhorias de experiência do usuário ao blog.

## O que Fazer

### 1. Animações de Transição
- Adicione transições entre páginas
- Use `<Transition>` ou `<TransitionGroup>`
- Crie efeito fade ou slide

### 2. Loading Bar
- Mostre loading bar durante navegação
- Use `router.beforeEach()` para iniciar
- Use `router.afterEach()` para terminar
- Componente simples com CSS

### 3. Breadcrumbs
- Componente Breadcrumb para navegação
- Mostre caminho: Home > Categoria > Post
- Links funcionais para cada nível

## Exemplo de Breadcrumb
```
Home > Tech > Post 1
```

## Dicas
- Use router hooks para loading
- Transition com CSS transitions
- Breadcrumbs baseadas em $route.path
