## Aula 7 — Autenticação JWT (Sistema Completo)

### Objetivos
- Implementar sistema completo de autenticação JWT
- Criar telas de login e cadastro integradas ao Flask
- Gerenciar estado de autenticação de forma reativa
- Implementar guards de rotas para proteção
- Trabalhar com refresh tokens e persistência de sessão
- Aplicar boas práticas de segurança no frontend

---

### Introdução à Autenticação JWT

#### O que é JWT (JSON Web Token)?

JWT é um padrão para transmitir informações de forma segura entre partes:

```
HEADER.PAYLOAD.SIGNATURE
```

**Vantagens:**
- ✅ Stateless (sem necessidade de sessão no servidor)
- ✅ Autocontido (carrega informações do usuário)
- ✅ Compatível com APIs REST
- ✅ Funciona bem com SPAs

**Fluxo de Autenticação:**
1. **Login** → Frontend envia credenciais
2. **Validação** → Backend valida e gera JWT
3. **Armazenamento** → Frontend armazena token
4. **Requisições** → Token enviado no header Authorization
5. **Verificação** → Backend valida token a cada request

---

### Serviço de Autenticação

#### `src/services/AuthService.js`

```javascript
import api from './api'

export class AuthService {
  /**
   * Realiza login do usuário
   */
  static async login(credentials) {
    try {
      const response = await api.post('/login', credentials)
      
      const { access_token, user } = response.data
      
      // Armazenar token e dados do usuário
      localStorage.setItem('authToken', access_token)
      localStorage.setItem('userData', JSON.stringify(user))
      
      return {
        sucesso: true,
        token: access_token,
        usuario: user,
        mensagem: 'Login realizado com sucesso!'
      }
    } catch (error) {
      return {
        sucesso: false,
        token: null,
        usuario: null,
        mensagem: this.tratarErroAuth(error)
      }
    }
  }

  /**
   * Cadastra novo usuário
   */
  static async cadastrar(dadosUsuario) {
    try {
      const response = await api.post('/form', dadosUsuario)
      
      return {
        sucesso: true,
        dados: response.data,
        mensagem: 'Cadastro realizado com sucesso! Faça login para continuar.'
      }
    } catch (error) {
      return {
        sucesso: false,
        dados: null,
        mensagem: this.tratarErroAuth(error)
      }
    }
  }

  /**
   * Realiza logout
   */
  static logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    
    // Redirecionar para login
    window.location.href = '/'
    
    return {
      sucesso: true,
      mensagem: 'Logout realizado com sucesso!'
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  static isAuthenticated() {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      return false
    }
    
    // Verificar se token não expirou
    try {
      const payload = this.parseJWT(token)
      const now = Date.now() / 1000
      
      return payload.exp > now
    } catch (error) {
      console.error('Erro ao verificar token:', error)
      return false
    }
  }

  /**
   * Obtém dados do usuário atual
   */
  static getCurrentUser() {
    const userData = localStorage.getItem('userData')
    
    if (!userData) {
      return null
    }
    
    try {
      return JSON.parse(userData)
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error)
      return null
    }
  }

  /**
   * Obtém token atual
   */
  static getToken() {
    return localStorage.getItem('authToken')
  }

  /**
   * Obtém perfil do usuário via API
   */
  static async obterPerfil() {
    try {
      const response = await api.get('/api/perfil')
      
      // Atualizar dados locais
      localStorage.setItem('userData', JSON.stringify(response.data))
      
      return {
        sucesso: true,
        usuario: response.data,
        mensagem: 'Perfil carregado com sucesso'
      }
    } catch (error) {
      return {
        sucesso: false,
        usuario: null,
        mensagem: this.tratarErroAuth(error)
      }
    }
  }

  /**
   * Parseia JWT para extrair payload
   */
  static parseJWT(token) {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    return JSON.parse(jsonPayload)
  }

  /**
   * Trata erros específicos de autenticação
   */
  static tratarErroAuth(error) {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 400:
          return data.message || 'Dados inválidos. Verifique os campos.'
        case 401:
          return 'Email ou senha incorretos.'
        case 403:
          return 'Acesso negado. Verifique suas permissões.'
        case 422:
          return data.message || 'Dados de cadastro inválidos.'
        case 429:
          return 'Muitas tentativas. Tente novamente em alguns minutos.'
        default:
          return `Erro no servidor (${status}). Tente novamente.`
      }
    } else if (error.request) {
      return 'Erro de conexão. Verifique se o servidor está rodando.'
    } else {
      return `Erro inesperado: ${error.message}`
    }
  }

  /**
   * Força refresh dos dados do usuário
   */
  static async refreshUserData() {
    if (!this.isAuthenticated()) {
      return { sucesso: false, mensagem: 'Usuário não autenticado' }
    }
    
    return await this.obterPerfil()
  }
}
```

---

### Componente de Login

#### `src/components/LoginForm.vue`

```vue
<template>
  <div class="login-form">
    <div class="card shadow-lg" style="max-width: 400px; margin: 0 auto;">
      <div class="card-header bg-primary text-white text-center">
        <h4 class="mb-0">
          <i class="fas fa-sign-in-alt me-2"></i>
          Entrar no Sistema
        </h4>
      </div>
      
      <div class="card-body">
        <!-- Alertas -->
        <div v-if="mensagem" class="alert" :class="alertClass" role="alert">
          <i class="fas" :class="mensagem.tipo === 'erro' ? 'fa-exclamation-triangle' : 'fa-check-circle'"></i>
          {{ mensagem.texto }}
        </div>

        <!-- Formulário de Login -->
        <form @submit.prevent="fazerLogin">
          <div class="mb-3">
            <label for="email" class="form-label">
              <i class="fas fa-envelope me-2"></i>
              Email
            </label>
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': erros.email }"
              placeholder="seu@email.com"
              required
              :disabled="fazendoLogin"
              autocomplete="username"
            >
            <div v-if="erros.email" class="invalid-feedback">
              {{ erros.email }}
            </div>
          </div>

          <div class="mb-3">
            <label for="senha" class="form-label">
              <i class="fas fa-lock me-2"></i>
              Senha
            </label>
            <div class="input-group">
              <input
                id="senha"
                v-model="form.senha"
                :type="mostrarSenha ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': erros.senha }"
                placeholder="Sua senha"
                required
                :disabled="fazendoLogin"
                autocomplete="current-password"
              >
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="mostrarSenha = !mostrarSenha"
                :disabled="fazendoLogin"
              >
                <i class="fas" :class="mostrarSenha ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            <div v-if="erros.senha" class="invalid-feedback">
              {{ erros.senha }}
            </div>
          </div>

          <div class="mb-3 form-check">
            <input
              id="lembrarMe"
              v-model="form.lembrarMe"
              type="checkbox"
              class="form-check-input"
              :disabled="fazendoLogin"
            >
            <label for="lembrarMe" class="form-check-label">
              Lembrar-me neste dispositivo
            </label>
          </div>

          <div class="d-grid">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!formularioValido || fazendoLogin"
            >
              <span v-if="fazendoLogin" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-sign-in-alt me-2"></i>
              {{ fazendoLogin ? 'Entrando...' : 'Entrar' }}
            </button>
          </div>
        </form>

        <!-- Links adicionais -->
        <div class="text-center mt-3">
          <p class="small text-muted mb-2">
            Não tem uma conta?
            <a href="#" @click.prevent="$emit('mostrar-cadastro')" class="text-decoration-none">
              Cadastre-se aqui
            </a>
          </p>
          <a href="#" @click.prevent="mostrarEsqueceuSenha" class="small text-muted text-decoration-none">
            Esqueceu sua senha?
          </a>
        </div>
      </div>
    </div>

    <!-- Debug Info (apenas em desenvolvimento) -->
    <div v-if="isDevelopment" class="mt-4 card">
      <div class="card-header">
        <small>Debug Info (dev only)</small>
      </div>
      <div class="card-body">
        <small class="text-muted">
          <strong>Usuários de teste:</strong><br>
          admin@example.com / admin123<br>
          user@example.com / user123
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import { AuthService } from '@/services/AuthService'

export default {
  name: 'LoginForm',
  emits: ['mostrar-cadastro', 'login-sucesso'],
  data() {
    return {
      form: {
        email: '',
        senha: '',
        lembrarMe: false
      },
      erros: {},
      mensagem: null,
      fazendoLogin: false,
      mostrarSenha: false
    }
  },
  computed: {
    formularioValido() {
      return this.form.email && 
             this.form.senha && 
             this.isValidEmail(this.form.email) &&
             Object.keys(this.erros).length === 0
    },
    alertClass() {
      return {
        'alert-success': this.mensagem?.tipo === 'sucesso',
        'alert-danger': this.mensagem?.tipo === 'erro',
        'alert-info': this.mensagem?.tipo === 'info'
      }
    },
    isDevelopment() {
      return process.env.NODE_ENV === 'development'
    }
  },
  watch: {
    'form.email'() {
      this.validarEmail()
    },
    'form.senha'() {
      this.validarSenha()
    }
  },
  methods: {
    async fazerLogin() {
      // Validar formulário
      this.validarFormulario()
      
      if (!this.formularioValido) {
        this.mostrarMensagem('erro', 'Corrija os erros no formulário')
        return
      }

      this.fazendoLogin = true
      this.mensagem = null

      try {
        const resultado = await AuthService.login({
          email: this.form.email,
          senha: this.form.senha
        })

        if (resultado.sucesso) {
          this.mostrarMensagem('sucesso', resultado.mensagem)
          
          // Aguardar um momento para mostrar sucesso
          setTimeout(() => {
            this.$emit('login-sucesso', resultado.usuario)
          }, 1000)
        } else {
          this.mostrarMensagem('erro', resultado.mensagem)
        }
      } catch (error) {
        console.error('Erro inesperado no login:', error)
        this.mostrarMensagem('erro', 'Erro inesperado. Tente novamente.')
      } finally {
        this.fazendoLogin = false
      }
    },

    validarFormulario() {
      this.erros = {}
      
      this.validarEmail()
      this.validarSenha()
    },

    validarEmail() {
      if (!this.form.email) {
        this.erros.email = 'Email é obrigatório'
      } else if (!this.isValidEmail(this.form.email)) {
        this.erros.email = 'Email inválido'
      } else {
        delete this.erros.email
      }
    },

    validarSenha() {
      if (!this.form.senha) {
        this.erros.senha = 'Senha é obrigatória'
      } else if (this.form.senha.length < 6) {
        this.erros.senha = 'Senha deve ter pelo menos 6 caracteres'
      } else {
        delete this.erros.senha
      }
    },

    isValidEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return regex.test(email)
    },

    mostrarMensagem(tipo, texto) {
      this.mensagem = { tipo, texto }
      
      // Auto-hide após 5 segundos
      setTimeout(() => {
        this.mensagem = null
      }, 5000)
    },

    mostrarEsqueceuSenha() {
      this.mostrarMensagem('info', 'Funcionalidade em desenvolvimento. Contate o administrador.')
    }
  }
}
</script>

<style scoped>
.login-form {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: none;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
}

.invalid-feedback {
  display: block;
}

/* Animação para alertas */
.alert {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
```

---

### Componente de Cadastro

#### `src/components/CadastroForm.vue`

```vue
<template>
  <div class="cadastro-form">
    <div class="card shadow-lg" style="max-width: 450px; margin: 0 auto;">
      <div class="card-header bg-success text-white text-center">
        <h4 class="mb-0">
          <i class="fas fa-user-plus me-2"></i>
          Criar Conta
        </h4>
      </div>
      
      <div class="card-body">
        <!-- Alertas -->
        <div v-if="mensagem" class="alert" :class="alertClass" role="alert">
          <i class="fas" :class="mensagem.tipo === 'erro' ? 'fa-exclamation-triangle' : 'fa-check-circle'"></i>
          {{ mensagem.texto }}
        </div>

        <!-- Formulário de Cadastro -->
        <form @submit.prevent="fazerCadastro">
          <div class="mb-3">
            <label for="nome" class="form-label">
              <i class="fas fa-user me-2"></i>
              Nome Completo
            </label>
            <input
              id="nome"
              v-model.trim="form.nome"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': erros.nome }"
              placeholder="Seu nome completo"
              required
              :disabled="fazendoCadastro"
              autocomplete="name"
            >
            <div v-if="erros.nome" class="invalid-feedback">
              {{ erros.nome }}
            </div>
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">
              <i class="fas fa-envelope me-2"></i>
              Email
            </label>
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': erros.email }"
              placeholder="seu@email.com"
              required
              :disabled="fazendoCadastro"
              autocomplete="email"
            >
            <div v-if="erros.email" class="invalid-feedback">
              {{ erros.email }}
            </div>
          </div>

          <div class="mb-3">
            <label for="senha" class="form-label">
              <i class="fas fa-lock me-2"></i>
              Senha
            </label>
            <div class="input-group">
              <input
                id="senha"
                v-model="form.senha"
                :type="mostrarSenha ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': erros.senha }"
                placeholder="Sua senha"
                required
                :disabled="fazendoCadastro"
                autocomplete="new-password"
              >
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="mostrarSenha = !mostrarSenha"
                :disabled="fazendoCadastro"
              >
                <i class="fas" :class="mostrarSenha ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            <div v-if="erros.senha" class="invalid-feedback">
              {{ erros.senha }}
            </div>
            <div class="form-text">
              <small>A senha deve ter pelo menos 8 caracteres</small>
            </div>
          </div>

          <div class="mb-3">
            <label for="confirmarSenha" class="form-label">
              <i class="fas fa-lock me-2"></i>
              Confirmar Senha
            </label>
            <input
              id="confirmarSenha"
              v-model="form.confirmarSenha"
              :type="mostrarSenha ? 'text' : 'password'"
              class="form-control"
              :class="{ 'is-invalid': erros.confirmarSenha }"
              placeholder="Confirme sua senha"
              required
              :disabled="fazendoCadastro"
              autocomplete="new-password"
            >
            <div v-if="erros.confirmarSenha" class="invalid-feedback">
              {{ erros.confirmarSenha }}
            </div>
          </div>

          <!-- Força da senha -->
          <div v-if="form.senha" class="mb-3">
            <div class="progress" style="height: 8px;">
              <div
                class="progress-bar"
                :class="forcaSenhaClass"
                :style="{ width: forcaSenhaPercent + '%' }"
              ></div>
            </div>
            <small :class="forcaSenhaTextClass">
              Força: {{ forcaSenhaTexto }}
            </small>
          </div>

          <div class="mb-3 form-check">
            <input
              id="aceitarTermos"
              v-model="form.aceitarTermos"
              type="checkbox"
              class="form-check-input"
              :class="{ 'is-invalid': erros.aceitarTermos }"
              required
              :disabled="fazendoCadastro"
            >
            <label for="aceitarTermos" class="form-check-label">
              Aceito os <a href="#" @click.prevent="mostrarTermos">termos de uso</a> 
              e <a href="#" @click.prevent="mostrarPrivacidade">política de privacidade</a>
            </label>
            <div v-if="erros.aceitarTermos" class="invalid-feedback">
              {{ erros.aceitarTermos }}
            </div>
          </div>

          <div class="d-grid">
            <button
              type="submit"
              class="btn btn-success"
              :disabled="!formularioValido || fazendoCadastro"
            >
              <span v-if="fazendoCadastro" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-user-plus me-2"></i>
              {{ fazendoCadastro ? 'Cadastrando...' : 'Criar Conta' }}
            </button>
          </div>
        </form>

        <!-- Links adicionais -->
        <div class="text-center mt-3">
          <p class="small text-muted mb-0">
            Já tem uma conta?
            <a href="#" @click.prevent="$emit('mostrar-login')" class="text-decoration-none">
              Faça login aqui
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AuthService } from '@/services/AuthService'

export default {
  name: 'CadastroForm',
  emits: ['mostrar-login', 'cadastro-sucesso'],
  data() {
    return {
      form: {
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        aceitarTermos: false
      },
      erros: {},
      mensagem: null,
      fazendoCadastro: false,
      mostrarSenha: false
    }
  },
  computed: {
    formularioValido() {
      return this.form.nome && 
             this.form.email && 
             this.form.senha &&
             this.form.confirmarSenha &&
             this.form.aceitarTermos &&
             this.isValidEmail(this.form.email) &&
             this.form.senha === this.form.confirmarSenha &&
             this.form.senha.length >= 8 &&
             Object.keys(this.erros).length === 0
    },
    alertClass() {
      return {
        'alert-success': this.mensagem?.tipo === 'sucesso',
        'alert-danger': this.mensagem?.tipo === 'erro',
        'alert-info': this.mensagem?.tipo === 'info'
      }
    },
    forcaSenha() {
      const senha = this.form.senha
      let score = 0
      
      if (senha.length >= 8) score += 1
      if (senha.length >= 12) score += 1
      if (/[a-z]/.test(senha)) score += 1
      if (/[A-Z]/.test(senha)) score += 1
      if (/[0-9]/.test(senha)) score += 1
      if (/[^A-Za-z0-9]/.test(senha)) score += 1
      
      return score
    },
    forcaSenhaPercent() {
      return (this.forcaSenha / 6) * 100
    },
    forcaSenhaClass() {
      const score = this.forcaSenha
      if (score <= 2) return 'bg-danger'
      if (score <= 4) return 'bg-warning'
      return 'bg-success'
    },
    forcaSenhaTexto() {
      const score = this.forcaSenha
      if (score <= 2) return 'Fraca'
      if (score <= 4) return 'Média'
      return 'Forte'
    },
    forcaSenhaTextClass() {
      const score = this.forcaSenha
      if (score <= 2) return 'text-danger'
      if (score <= 4) return 'text-warning'
      return 'text-success'
    }
  },
  watch: {
    'form.nome'() {
      this.validarNome()
    },
    'form.email'() {
      this.validarEmail()
    },
    'form.senha'() {
      this.validarSenha()
      if (this.form.confirmarSenha) {
        this.validarConfirmarSenha()
      }
    },
    'form.confirmarSenha'() {
      this.validarConfirmarSenha()
    },
    'form.aceitarTermos'() {
      this.validarTermos()
    }
  },
  methods: {
    async fazerCadastro() {
      // Validar formulário
      this.validarFormulario()
      
      if (!this.formularioValido) {
        this.mostrarMensagem('erro', 'Corrija os erros no formulário')
        return
      }

      this.fazendoCadastro = true
      this.mensagem = null

      try {
        const resultado = await AuthService.cadastrar({
          nome: this.form.nome,
          email: this.form.email,
          senha: this.form.senha
        })

        if (resultado.sucesso) {
          this.mostrarMensagem('sucesso', resultado.mensagem)
          
          // Aguardar um momento para mostrar sucesso
          setTimeout(() => {
            this.$emit('cadastro-sucesso')
          }, 2000)
        } else {
          this.mostrarMensagem('erro', resultado.mensagem)
        }
      } catch (error) {
        console.error('Erro inesperado no cadastro:', error)
        this.mostrarMensagem('erro', 'Erro inesperado. Tente novamente.')
      } finally {
        this.fazendoCadastro = false
      }
    },

    validarFormulario() {
      this.erros = {}
      
      this.validarNome()
      this.validarEmail()
      this.validarSenha()
      this.validarConfirmarSenha()
      this.validarTermos()
    },

    validarNome() {
      if (!this.form.nome) {
        this.erros.nome = 'Nome é obrigatório'
      } else if (this.form.nome.length < 2) {
        this.erros.nome = 'Nome deve ter pelo menos 2 caracteres'
      } else {
        delete this.erros.nome
      }
    },

    validarEmail() {
      if (!this.form.email) {
        this.erros.email = 'Email é obrigatório'
      } else if (!this.isValidEmail(this.form.email)) {
        this.erros.email = 'Email inválido'
      } else {
        delete this.erros.email
      }
    },

    validarSenha() {
      if (!this.form.senha) {
        this.erros.senha = 'Senha é obrigatória'
      } else if (this.form.senha.length < 8) {
        this.erros.senha = 'Senha deve ter pelo menos 8 caracteres'
      } else {
        delete this.erros.senha
      }
    },

    validarConfirmarSenha() {
      if (!this.form.confirmarSenha) {
        this.erros.confirmarSenha = 'Confirmação de senha é obrigatória'
      } else if (this.form.senha !== this.form.confirmarSenha) {
        this.erros.confirmarSenha = 'Senhas não coincidem'
      } else {
        delete this.erros.confirmarSenha
      }
    },

    validarTermos() {
      if (!this.form.aceitarTermos) {
        this.erros.aceitarTermos = 'Você deve aceitar os termos de uso'
      } else {
        delete this.erros.aceitarTermos
      }
    },

    isValidEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return regex.test(email)
    },

    mostrarMensagem(tipo, texto) {
      this.mensagem = { tipo, texto }
      
      // Auto-hide após 5 segundos
      setTimeout(() => {
        this.mensagem = null
      }, 5000)
    },

    mostrarTermos() {
      this.mostrarMensagem('info', 'Termos de uso em desenvolvimento.')
    },

    mostrarPrivacidade() {
      this.mostrarMensagem('info', 'Política de privacidade em desenvolvimento.')
    }
  }
}
</script>

<style scoped>
.cadastro-form {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  padding: 20px;
}

.card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: none;
}

.form-control:focus {
  border-color: #11998e;
  box-shadow: 0 0 0 0.2rem rgba(17, 153, 142, 0.25);
}

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
}

.btn-success:hover {
  background: linear-gradient(135deg, #0e8478 0%, #2dd65a 100%);
  transform: translateY(-1px);
}

.invalid-feedback {
  display: block;
}

.progress {
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  transition: all 0.3s ease;
}
</style>
```

---

### Aplicação Principal com Autenticação

#### `src/App.vue` (versão Aula 7)

```vue
<template>
  <div id="app">
    <!-- Tela de Login/Cadastro -->
    <div v-if="!usuarioLogado">
      <LoginForm 
        v-if="telaAtual === 'login'"
        @mostrar-cadastro="telaAtual = 'cadastro'"
        @login-sucesso="handleLoginSucesso"
      />
      <CadastroForm 
        v-else
        @mostrar-login="telaAtual = 'login'"
        @cadastro-sucesso="telaAtual = 'login'"
      />
    </div>

    <!-- Aplicação Principal (Usuário Logado) -->
    <div v-else>
      <!-- Header da aplicação -->
      <header class="bg-primary text-white py-3 mb-4">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="mb-0">
                <i class="fas fa-graduation-cap me-2"></i>
                Frontend Vue.js - Aula 7
              </h1>
              <p class="mb-0 opacity-75">Sistema de Autenticação JWT</p>
            </div>
            
            <!-- Menu do usuário -->
            <div class="dropdown">
              <button 
                class="btn btn-outline-light dropdown-toggle d-flex align-items-center"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i class="fas fa-user-circle me-2"></i>
                {{ usuarioLogado.nome }}
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="mostrarPerfil">
                    <i class="fas fa-user me-2"></i>
                    Meu Perfil
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="atualizarPerfil">
                    <i class="fas fa-sync me-2"></i>
                    Atualizar Dados
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="fazerLogout">
                    <i class="fas fa-sign-out-alt me-2"></i>
                    Sair
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <!-- Conteúdo principal -->
      <div class="container">
        <!-- Informações do usuário -->
        <div class="row mb-4">
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-info-circle me-2"></i>
                  Informações da Sessão
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>Nome:</strong> {{ usuarioLogado.nome }}</p>
                    <p><strong>Email:</strong> {{ usuarioLogado.email }}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>Login em:</strong> {{ dataLogin }}</p>
                    <p><strong>Token válido:</strong> 
                      <span class="badge bg-success">
                        <i class="fas fa-check-circle me-1"></i>
                        Sim
                      </span>
                    </p>
                  </div>
                </div>
                
                <!-- Ações -->
                <div class="d-flex gap-2 mt-3">
                  <button 
                    class="btn btn-outline-primary btn-sm"
                    @click="testarAPIProtegida"
                    :disabled="testandoAPI"
                  >
                    <i class="fas fa-shield-alt" v-if="!testandoAPI"></i>
                    <i class="fas fa-spinner fa-spin" v-else></i>
                    Testar API Protegida
                  </button>
                  
                  <button 
                    class="btn btn-outline-success btn-sm"
                    @click="atualizarPerfil"
                    :disabled="atualizandoPerfil"
                  >
                    <i class="fas fa-user-edit" v-if="!atualizandoPerfil"></i>
                    <i class="fas fa-spinner fa-spin" v-else></i>
                    Atualizar Perfil
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="fas fa-key me-2"></i>
                  Token JWT
                </h6>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <textarea 
                    class="form-control small"
                    rows="6"
                    :value="tokenFormatado"
                    readonly
                  ></textarea>
                </div>
                <button 
                  class="btn btn-outline-secondary btn-sm mt-2 w-100"
                  @click="copiarToken"
                >
                  <i class="fas fa-copy me-1"></i>
                  Copiar Token
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Log de atividades -->
        <div class="card">
          <div class="card-header d-flex justify-content-between">
            <h5 class="mb-0">
              <i class="fas fa-history me-2"></i>
              Log de Atividades
            </h5>
            <button 
              class="btn btn-sm btn-outline-secondary"
              @click="limparLog"
            >
              Limpar
            </button>
          </div>
          <div class="card-body">
            <div v-if="logAtividades.length === 0" class="text-center text-muted py-3">
              <i class="fas fa-clipboard-list fa-2x mb-2"></i>
              <p>Nenhuma atividade registrada</p>
            </div>
            <div v-else>
              <div 
                v-for="(atividade, index) in logAtividades.slice().reverse()" 
                :key="index"
                class="border-bottom py-2"
              >
                <div class="d-flex justify-content-between">
                  <div>
                    <i class="fas" :class="atividade.icone"></i>
                    <strong>{{ atividade.titulo }}</strong>
                    <small class="text-muted ms-2">{{ atividade.detalhes }}</small>
                  </div>
                  <small class="text-muted">
                    {{ formatarTempo(atividade.timestamp) }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="bg-light text-center py-3 mt-5">
        <div class="container">
          <p class="text-muted mb-0">
            Aula 7 - Autenticação JWT | 
            <a href="https://jwt.io/" target="_blank" class="text-decoration-none">
              Saiba mais sobre JWT
            </a>
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import { AuthService } from '@/services/AuthService'
import LoginForm from '@/components/LoginForm.vue'
import CadastroForm from '@/components/CadastroForm.vue'

export default {
  name: 'App',
  components: {
    LoginForm,
    CadastroForm
  },
  data() {
    return {
      telaAtual: 'login',
      usuarioLogado: null,
      dataLogin: null,
      testandoAPI: false,
      atualizandoPerfil: false,
      logAtividades: []
    }
  },
  computed: {
    tokenFormatado() {
      const token = AuthService.getToken()
      if (!token) return ''
      
      // Quebrar o token em linhas para melhor visualização
      return token.match(/.{1,50}/g)?.join('\n') || token
    }
  },
  async mounted() {
    // Verificar se usuário já está logado
    if (AuthService.isAuthenticated()) {
      this.usuarioLogado = AuthService.getCurrentUser()
      this.dataLogin = new Date().toLocaleString()
      
      this.adicionarLog('fa-sign-in-alt text-success', 'Login automático', 'Sessão restaurada')
      
      // Atualizar dados do perfil
      await this.atualizarPerfil()
    }
  },
  methods: {
    handleLoginSucesso(usuario) {
      this.usuarioLogado = usuario
      this.dataLogin = new Date().toLocaleString()
      
      this.adicionarLog('fa-sign-in-alt text-success', 'Login realizado', `Bem-vindo, ${usuario.nome}!`)
    },

    async fazerLogout() {
      const confirmou = confirm('Tem certeza que deseja sair?')
      
      if (confirmou) {
        AuthService.logout()
        // O AuthService.logout() já redireciona
      }
    },

    async testarAPIProtegida() {
      this.testandoAPI = true
      
      try {
        const resultado = await AuthService.obterPerfil()
        
        if (resultado.sucesso) {
          this.adicionarLog('fa-shield-alt text-success', 'API testada', 'Acesso autorizado com sucesso')
          alert('✅ API protegida funcionando! Dados atualizados.')
        } else {
          this.adicionarLog('fa-shield-alt text-danger', 'Erro na API', resultado.mensagem)
          alert('❌ Erro: ' + resultado.mensagem)
        }
      } catch (error) {
        this.adicionarLog('fa-shield-alt text-danger', 'Erro inesperado', error.message)
        alert('❌ Erro inesperado: ' + error.message)
      } finally {
        this.testandoAPI = false
      }
    },

    async atualizarPerfil() {
      this.atualizandoPerfil = true
      
      try {
        const resultado = await AuthService.refreshUserData()
        
        if (resultado.sucesso) {
          this.usuarioLogado = resultado.usuario
          this.adicionarLog('fa-user-edit text-info', 'Perfil atualizado', 'Dados sincronizados com servidor')
        } else {
          this.adicionarLog('fa-user-edit text-warning', 'Erro ao atualizar', resultado.mensagem)
        }
      } catch (error) {
        this.adicionarLog('fa-user-edit text-danger', 'Erro inesperado', error.message)
      } finally {
        this.atualizandoPerfil = false
      }
    },

    mostrarPerfil() {
      alert(`Perfil:\nNome: ${this.usuarioLogado.nome}\nEmail: ${this.usuarioLogado.email}\nID: ${this.usuarioLogado.id}`)
    },

    copiarToken() {
      const token = AuthService.getToken()
      if (token) {
        navigator.clipboard.writeText(token).then(() => {
          this.adicionarLog('fa-copy text-info', 'Token copiado', 'Token JWT copiado para área de transferência')
          alert('✅ Token copiado para área de transferência!')
        }).catch(() => {
          alert('❌ Erro ao copiar token')
        })
      }
    },

    adicionarLog(icone, titulo, detalhes) {
      this.logAtividades.push({
        icone,
        titulo,
        detalhes,
        timestamp: Date.now()
      })
      
      // Manter apenas os últimos 20 logs
      if (this.logAtividades.length > 20) {
        this.logAtividades = this.logAtividades.slice(-20)
      }
    },

    limparLog() {
      this.logAtividades = []
    },

    formatarTempo(timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    }
  }
}
</script>

<style>
/* Reutilizar estilos globais */
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  min-height: 100vh;
}

.dropdown-menu {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

textarea {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.2;
}
</style>
```

---

### Exercícios Práticos da Aula 7

#### Exercício 1: Proteção de Rotas
Implementar guards para proteger rotas:
- Guard de autenticação
- Redirecionamento automático
- Verificação de permissões de usuário

#### Exercício 2: Refresh Token
Implementar sistema de refresh automático:
- Token refresh antes do vencimento
- Renovação silenciosa
- Logout automático em caso de falha

#### Exercício 3: Lembrança de Login
Melhorar persistência:
- Opção "Lembrar-me"
- Storage seguro
- Logout de todos os dispositivos

---

### Comandos Git e Deploy

```bash
# Criar branch da aula 7
git checkout master
git checkout -b aula-07-auth

# Implementar componentes
# ... adicionar arquivos ...

git add .
git commit -m "Aula 7 - Sistema completo de autenticação JWT"
git push -u origin aula-07-auth
```

---

### Checklist de Verificação

- [ ] AuthService implementado e funcionando
- [ ] LoginForm com validações
- [ ] CadastroForm com validações
- [ ] Integração com backend Flask
- [ ] Token JWT armazenado e enviado
- [ ] Interceptadores configurados
- [ ] Estados de loading/erro tratados
- [ ] Logout funcionando
- [ ] Persistência de sessão
- [ ] Interface responsiva

---

### Próxima Aula

Na **Aula 8** veremos:
- Pinia para gerenciamento de estado global
- Store de usuário e autenticação
- Actions assíncronas
- Getters computados
- Persistência de estado

### Conceitos de Segurança

1. **Nunca armazenar senhas em plain text**
2. **Tokens tem tempo de expiração**
3. **HTTPS obrigatório em produção**
4. **Limpar dados sensíveis no logout**
5. **Validação tanto client quanto server**