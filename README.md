# Frontend Vue.js — Curso Completo

Projeto didático para aprendizado de Vue.js consumindo API Flask.

## Sobre o Curso

Nste curso de 12 aulas vamos aprender a usar o Vue.js de forma prática, construindo uma aplicação frontend que consome a API do projeto Backend Flask. 

## Pré-requisitos

- Node.js 16+ instalado
- Backend Flask rodando (projeto `backend_flask`)
- Git para controle de versão
- Editor de código (VS Code recomendado)

## Estrutura do Curso

### **Aula 1**: Introdução ao Vue.js
- Branch: `aula-01-introducao`
- Conceitos básicos, instalação, primeiro componente
- Estrutura de projeto Vue.js

### **Aula 2**: Componentes e Diretivas
- Branch: `aula-02-componentes`
- v-if, v-for, v-model, v-bind
- Criação de componentes reutilizáveis

### **Aula 3**: Comunicação com API
- Branch: `aula-03-api`
- Axios, fetch API
- Conexão com backend Flask

### **Aula 4**: Roteamento
- Branch: `aula-04-roteamento`
- Vue Router
- Navegação entre páginas

### **Aula 5**: Formulários e Validação
- Branch: `aula-05-formularios`
- Formulários reativos
- Validação de dados

### **Aula 6**: CRUD de Produtos
- Branch: `aula-06-crud`
- CRUD completo baseado na API Flask
- Gerenciamento de estado local

### **Aula 7**: Autenticação
- Branch: `aula-07-auth`
- Sistema de login
- Gerenciamento de tokens JWT
- Guards de rota

### **Aula 8**: Estado Global (Pinia)
- Branch: `aula-08-estado`
- Pinia para gerenciamento de estado
- Store de usuário e produtos

### **Aula 9**: Testes em Vue.js
Branch: `aula-09-testes`
- Fundamentos de testes unitários e E2E
- Configuração de Vitest e Cypress
- Testes de componentes, stores e validadores
- Mocking de APIs e interações do usuário

### **Aula 10**: Estilização
- Branch: `aula-10-estilizacao`
- CSS moderno, Bootstrap
- Componentes estilizados
- Responsividade

### **Aula 11**: Deploy e Build
- Branch: `aula-11-deploy`
- Build para produção
- Deploy, otimizações
- Variáveis de ambiente

### **Aula 12**: Revisão e Projeto Final
- Branch: `aula-12-projeto-final`
- Projeto integrado completo
- Boas práticas, revisão geral

## Instalação Rápida

```bash
# 1) Clone o repositório
git clone <URL_DO_SEU_REPO>
cd frontend_vue

# 2) Instale as dependências
npm install

# 3) Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em: `http://localhost:3000`

## Como Usar Este Curso

### Para Professores
1. Cada branch contém o código completo até aquela aula
2. Use `git checkout aula-XX-nome` para mostrar o progresso
3. Compare branches para mostrar evolução: `git diff aula-01-introducao aula-02-componentes`

### Para Alunos
1. Comece na branch `aula-01-introducao`
2. Faça os exercícios propostos
3. Compare sua solução com a próxima branch
4. Avance progressivamente pelas aulas

```bash
# Exemplo: trabalhando na Aula 1
git checkout aula-01-introducao
npm run dev

# Quando terminar, veja a solução da Aula 2
git checkout aula-02-componentes
```

## Backend Necessário

Este frontend consome a API do projeto Flask. Certifique-se de que o backend esteja rodando:

```bash
# No diretório do backend_flask
cd ../backend_flask
source venv/bin/activate  # Linux/Mac
# ou
./venv/Scripts/activate   # Windows
python run.py
```

O backend deve estar em: `http://localhost:5000`

## Endpoints da API Utilizados

- `GET /api/dados` - Dados básicos (Aula 3)
- `POST /login` - Login para obter token JWT (Aula 7)
- `GET /api/produtos` - Listar produtos (Aula 6)
- `POST /api/produtos` - Criar produto (Aula 6)
- `PUT /api/produtos/<id>` - Atualizar produto (Aula 6)
- `DELETE /api/produtos/<id>` - Excluir produto (Aula 6)
- `GET /api/perfil` - Perfil do usuário logado (Aula 7)

## Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build

## Tecnologias Utilizadas

- **Vue.js 3** - Framework reativo
- **Vue Router 4** - Roteamento SPA
- **Pinia** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **Vite** - Build tool moderna
- **Bootstrap 5** - Estilização
- **Font Awesome** - Ícones

## Estrutura de Pastas

```
frontend_vue/
├── public/           # Arquivos públicos
├── src/
│   ├── components/   # Componentes reutilizáveis
│   ├── views/        # Páginas/views
│   ├── router/       # Configuração de rotas
│   ├── services/     # Serviços API
│   ├── store/        # Estados Pinia
│   └── main.js       # Ponto de entrada
├── aulas/            # Material das aulas (*.md)
└── package.json      # Configuração do projeto
```

## Como Entregar Atividades (Para Alunos)

1. Faça um fork deste repositório
2. Crie sua própria branch: `git checkout -b minha-solucao-aula-01`
3. Faça commit das suas alterações: `git commit -m "Aula 01 - exercícios resolvidos"`
4. Push para seu repositório: `git push origin minha-solucao-aula-01`
5. Envie o link para o instrutor

## Solução de Problemas

### Erros Comuns

- **CORS Error**: Certifique-se de que o backend Flask está rodando
- **Token JWT expirado**: Faça login novamente em `/login`
- **Dependências não instaladas**: Execute `npm install`
- **Porta em uso**: Altere a porta no `vite.config.js`

### Comandos Úteis

```bash
# Ver todas as branches (aulas)
git branch -a

# Comparar duas aulas
git diff aula-01-introducao..aula-02-componentes

# Resetar alterações locais
git reset --hard HEAD

# Ver logs de uma aula específica
git log --oneline aula-06-crud
```

## Contato

- **Instrutor**: Prof. Rodrigo
- **Email**: rodrigo.viana@multiversa.com

---

## Licença

Este projeto é para fins educacionais. MIT License.
