# Modelo de Avaliação - Projeto Final
## Sistema de Gerenciamento Vue.js

---

## Informações do Aluno

**Nome do Grupo:** _______________________________________  
**Participantes:**______________________________________________________________________________  
**Data de Entrega:** ___/___/______  
**URL do Repositório:** _______________________________________  
**URL da Aplicação (se hospedada):** _______________________________________

---

## Critérios de Avaliação

**Pontuação Total: 100 pontos**

---

### 1. Autenticação e Segurança (20 pontos)

#### 1.1 Sistema de Login (8 pontos)
- [ ] Formulário de login funcional (2 pts)
- [ ] Validação de campos (email válido, senha obrigatória) (2 pts)
- [ ] Feedback visual de erros (2 pts)
- [ ] Redirecionamento após login bem-sucedido (2 pts)

#### 1.2 Gestão de Sessão (6 pontos)
- [ ] Token JWT armazenado corretamente (2 pts)
- [ ] Token enviado em requisições protegidas (2 pts)
- [ ] Logout funcional com limpeza de dados (2 pts)

#### 1.3 Proteção de Rotas (6 pontos)
- [ ] Guards de roteamento implementados (3 pts)
- [ ] Redirecionamento automático para login (2 pts)
- [ ] Verificação de autenticação ao carregar app (1 pt)

**Subtotal Autenticação:** _____ / 20

---

### 2. CRUD de Entidades (25 pontos)

#### 2.1 Listagem (7 pontos)
- [ ] Exibição de dados em grid/lista (3 pts)
- [ ] Dados carregados da API corretamente (2 pts)
- [ ] Loading state durante carregamento (1 pt)
- [ ] Tratamento de lista vazia (1 pt)

#### 2.2 Criação (6 pontos)
- [ ] Formulário de criação funcional (2 pts)
- [ ] Validação de campos obrigatórios (2 pts)
- [ ] Dados salvos na API com sucesso (2 pts)

#### 2.3 Edição (6 pontos)
- [ ] Formulário pré-preenchido com dados existentes (2 pts)
- [ ] Atualização na API funcional (2 pts)
- [ ] Atualização refletida na interface (2 pts)

#### 2.4 Exclusão (6 pontos)
- [ ] Modal/dialog de confirmação antes de deletar (2 pts)
- [ ] Exclusão na API funcional (2 pts)
- [ ] Item removido da interface (2 pts)

**Subtotal CRUD:** _____ / 25

---

### 3. Gerenciamento de Estado (15 pontos)

#### 3.1 Pinia Stores (8 pontos)
- [ ] Store de autenticação implementada (3 pts)
- [ ] Store principal do domínio implementada (3 pts)
- [ ] Actions e getters corretos (2 pts)

#### 3.2 Integração com Componentes (4 pontos)
- [ ] Componentes consomem stores corretamente (2 pts)
- [ ] Estado atualizado reativamente (2 pts)

#### 3.3 Persistência (3 pontos)
- [ ] Dados persistidos quando necessário (localStorage/sessionStorage) (3 pts)

**Subtotal Estado:** _____ / 15

---

### 4. Interface e Experiência do Usuário (20 pontos)

#### 4.1 Responsividade (10 pontos)
- [ ] Funciona em desktop (1920px+) (4 pts)
- [ ] Funciona em tablet (768px-1024px) (3 pt)
- [ ] Funciona em mobile (até 767px) (3 pt)

#### 4.2 Feedback Visual (5 pontos)
- [ ] Toasts/notificações de sucesso e erro (2 pts)
- [ ] Loading spinners durante requisições (2 pts)
- [ ] Mensagens de validação claras (1 pt)

#### 4.3 Navegação (5 pontos)
- [ ] Rotas funcionando corretamente (2 pts)
- [ ] Links de navegação claros (2 pt)
- [ ] Breadcrumbs ou indicador de localização (1 pt)

**Subtotal Interface:** _____ / 20

---

### 5. Integração com Backend (15 pontos)

#### 5.1 Serviços de API (6 pontos)
- [ ] Axios ou fetch configurado corretamente (2 pts)
- [ ] Interceptors para token (se aplicável) (2 pts)
- [ ] Tratamento de erros HTTP (2 pts)

#### 5.2 Requisições (6 pontos)
- [ ] GET (listar/buscar) funcional (2 pts)
- [ ] POST (criar) funcional (2 pts)
- [ ] PUT/PATCH (atualizar) funcional (1 pt)
- [ ] DELETE (excluir) funcional (1 pt)

#### 5.3 Tratamento de Respostas (3 pontos)
- [ ] Parsing correto de dados (1 pt)
- [ ] Tratamento de erros da API (1 pt)
- [ ] Mensagens de erro amigáveis (1 pt)

**Subtotal Backend:** _____ / 15

---

### 6. Qualidade do Código (5 pontos)

- [ ] Código organizado em componentes reutilizáveis (1 pt)
- [ ] Nomenclatura consistente e descritiva (1 pt)
- [ ] Sem código duplicado excessivo (1 pt)
- [ ] Comentários em partes complexas (1 pt)
- [ ] Estrutura de pastas organizada (1 pt)

**Subtotal Qualidade:** _____ / 5

---

## Funcionalidades Extras (Bônus - até 20 pontos)

- [ ] Sistema de busca/filtros avançados (+6 pts)
- [ ] Paginação implementada (+4 pts)
- [ ] Tema claro/escuro (+4 pts)
- [ ] Upload de arquivos/imagens (+4 pts)
- [ ] Dashboard com estatísticas (+6 pts)
- [ ] Exportação de dados (CSV/PDF) (+4 pts)
- [ ] Gráficos ou visualizações (+4 pts)
- [ ] Testes unitários implementados (+6 pts)
- [ ] Aplicação hospedada (Netlify/Vercel) (+4 pts)
- [ ] Documentação README completa (+2 pt)

**Subtotal Bônus:** _____ / 10 (máximo)

---

## Penalidades

- [ ] Aplicação não roda (-20 pts)
- [ ] Erros no console não tratados (-5 pts)
- [ ] Faltam dependências no package.json (-3 pts)
- [ ] Sem arquivo de ambiente (.env.example) (-2 pts)
- [ ] **Código plagiado/copiado sem adaptação (-100 pts)**

**Subtotal Penalidades:** _____ 

---

## Pontuação Final

| Categoria | Pontos |
|-----------|--------|
| 1. Autenticação e Segurança | _____ / 20 |
| 2. CRUD de Entidades | _____ / 25 |
| 3. Gerenciamento de Estado | _____ / 15 |
| 4. Interface e UX | _____ / 20 |
| 5. Integração com Backend | _____ / 15 |
| 6. Qualidade do Código | _____ / 5 |
| **Subtotal** | _____ / 100 |
| Bônus | _____ / 10 |
| Penalidades | _____ |
| **TOTAL FINAL** | _____ / 110 |

---

**Nota Final:** _______

---

## Checklist de Entrega Obrigatória

O grupo deve entregar:

- [ ] Link do repositório Git (público ou com acesso concedido para rodrigo.viana@multiversa.com)
- [ ] Arquivo README.md com:
  - [ ] Descrição do projeto
  - [ ] Instruções de instalação
  - [ ] Instruções para rodar (frontend e backend)
  - [ ] Credenciais de teste (se aplicável)
  - [ ] Tecnologias utilizadas
- [ ] Arquivo de ambiente (.env.example) com variáveis necessárias
- [ ] package.json com todas as dependências
- [ ] Código fonte organizado
- [ ] Backend funcional (pode ser o da disciplina Backend com Flask aula ou outro criado pelo grupo)

---
