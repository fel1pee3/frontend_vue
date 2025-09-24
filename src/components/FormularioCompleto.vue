<template>
  <div class="formulario-completo">
    <div class="container mt-4">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h3 class="mb-0">
            <i class="fas fa-edit me-2"></i>
            Formulário Avançado de Cadastro
          </h3>
        </div>
        
        <div class="card-body">
          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="progress">
              <div 
                class="progress-bar bg-success" 
                :style="{ width: progressPercentage + '%' }"
              >
                {{ Math.round(progressPercentage) }}% completo
              </div>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" novalidate>
            <!-- Seção: Dados Pessoais -->
            <div class="section mb-4">
              <h4 class="section-title">
                <i class="fas fa-user me-2"></i>
                Dados Pessoais
              </h4>
              
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">
                    Nome Completo <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.nome"
                    type="text"
                    class="form-control"
                    :class="{
                      'is-valid': isFieldValid('nome'),
                      'is-invalid': hasFieldError('nome')
                    }"
                    @blur="validateField('nome')"
                    @input="clearFieldError('nome')"
                    placeholder="Seu nome completo"
                  >
                  <div class="invalid-feedback">
                    {{ getFieldError('nome') }}
                  </div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">
                    Email <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    :class="{
                      'is-valid': isFieldValid('email'),
                      'is-invalid': hasFieldError('email')
                    }"
                    @blur="validateField('email')"
                    @input="clearFieldError('email')"
                    placeholder="seu@email.com"
                  >
                  <div class="invalid-feedback">
                    {{ getFieldError('email') }}
                  </div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">
                    CPF <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.cpf"
                    type="text"
                    class="form-control"
                    :class="{
                      'is-valid': isFieldValid('cpf'),
                      'is-invalid': hasFieldError('cpf')
                    }"
                    @blur="validateField('cpf')"
                    placeholder="000.000.000-00"
                  >
                  <div class="invalid-feedback">
                    {{ getFieldError('cpf') }}
                  </div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">
                    Telefone <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.telefone"
                    type="text"
                    class="form-control"
                    :class="{
                      'is-valid': isFieldValid('telefone'),
                      'is-invalid': hasFieldError('telefone')
                    }"
                    @blur="validateField('telefone')"
                    placeholder="(00) 00000-0000"
                  >
                  <div class="invalid-feedback">
                    {{ getFieldError('telefone') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Seção: Endereço -->
            <div class="section mb-4">
              <h4 class="section-title">
                <i class="fas fa-map-marker-alt me-2"></i>
                Endereço
              </h4>
              
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">
                    CEP <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <input
                      v-model="form.cep"
                      type="text"
                      class="form-control"
                      :class="{
                        'is-valid': isFieldValid('cep'),
                        'is-invalid': hasFieldError('cep')
                      }"
                      @blur="buscarCEP"
                      placeholder="00000-000"
                    >
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary"
                      @click="buscarCEP"
                      :disabled="buscandoCEP"
                    >
                      <i class="fas fa-search" v-if="!buscandoCEP"></i>
                      <i class="fas fa-spinner fa-spin" v-else></i>
                    </button>
                  </div>
                  <div class="invalid-feedback">
                    {{ getFieldError('cep') }}
                  </div>
                </div>
                
                <div class="col-md-8">
                  <label class="form-label">
                    Logradouro <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.logradouro"
                    type="text"
                    class="form-control"
                    :class="{
                      'is-valid': isFieldValid('logradouro'),
                      'is-invalid': hasFieldError('logradouro')
                    }"
                    @blur="validateField('logradouro')"
                    placeholder="Rua, Avenida, etc."
                    :readonly="carregandoEndereco"
                  >
                  <div class="invalid-feedback">
                    {{ getFieldError('logradouro') }}
                  </div>
                </div>
                
                <div class="col-md-3">
                  <label class="form-label">Número</label>
                  <input
                    v-model="form.numero"
                    type="text"
                    class="form-control"
                    placeholder="123"
                  >
                </div>
                
                <div class="col-md-5">
                  <label class="form-label">Bairro</label>
                  <input
                    v-model="form.bairro"
                    type="text"
                    class="form-control"
                    :readonly="carregandoEndereco"
                  >
                </div>
                
                <div class="col-md-4">
                  <label class="form-label">Cidade</label>
                  <input
                    v-model="form.cidade"
                    type="text"
                    class="form-control"
                    :readonly="carregandoEndereco"
                  >
                </div>
              </div>
            </div>

            <!-- Seção: Preferências -->
            <div class="section mb-4">
              <h4 class="section-title">
                <i class="fas fa-cogs me-2"></i>
                Preferências
              </h4>
              
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Categoria de Interesse</label>
                  <select v-model="form.categoria" class="form-select">
                    <option value="">Selecione uma categoria</option>
                    <option value="tecnologia">Tecnologia</option>
                    <option value="esportes">Esportes</option>
                    <option value="cultura">Cultura</option>
                    <option value="educacao">Educação</option>
                  </select>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Múltiplas Escolhas</label>
                  <div class="form-check-group">
                    <div class="form-check">
                      <input 
                        v-model="form.interesses" 
                        value="newsletter" 
                        type="checkbox" 
                        class="form-check-input"
                        id="newsletter"
                      >
                      <label class="form-check-label" for="newsletter">
                        Receber Newsletter
                      </label>
                    </div>
                    <div class="form-check">
                      <input 
                        v-model="form.interesses" 
                        value="promocoes" 
                        type="checkbox" 
                        class="form-check-input"
                        id="promocoes"
                      >
                      <label class="form-check-label" for="promocoes">
                        Promoções
                      </label>
                    </div>
                    <div class="form-check">
                      <input 
                        v-model="form.interesses" 
                        value="eventos" 
                        type="checkbox" 
                        class="form-check-input"
                        id="eventos"
                      >
                      <label class="form-check-label" for="eventos">
                        Eventos
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Seção: Upload -->
            <div class="section mb-4">
              <h4 class="section-title">
                <i class="fas fa-cloud-upload-alt me-2"></i>
                Upload de Documentos
              </h4>
              
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Foto de Perfil</label>
                  <div class="upload-area" @drop="handleDrop" @dragover.prevent>
                    <input 
                      ref="fileInput"
                      type="file" 
                      accept="image/*" 
                      @change="handleFileSelect"
                      class="d-none"
                    >
                    
                    <div v-if="!form.foto" class="upload-placeholder" @click="$refs.fileInput.click()">
                      <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                      <p class="text-muted">Clique ou arraste uma imagem aqui</p>
                    </div>
                    
                    <div v-else class="upload-preview">
                      <img :src="form.foto.preview" alt="Preview" class="preview-image">
                      <div class="upload-actions">
                        <button 
                          type="button" 
                          class="btn btn-sm btn-danger"
                          @click="removeFile"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Seção: Senha -->
            <div class="section mb-4">
              <h4 class="section-title">
                <i class="fas fa-lock me-2"></i>
                Segurança
              </h4>
              
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">
                    Senha <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <input
                      v-model="form.senha"
                      :type="mostrarSenha ? 'text' : 'password'"
                      class="form-control"
                      :class="{
                        'is-valid': isFieldValid('senha'),
                        'is-invalid': hasFieldError('senha')
                      }"
                      @input="validateField('senha')"
                      placeholder="Sua senha"
                    >
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary"
                      @click="mostrarSenha = !mostrarSenha"
                    >
                      <i :class="mostrarSenha ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback">
                    {{ getFieldError('senha') }}
                  </div>
                  
                  <!-- Indicador de força da senha -->
                  <div v-if="form.senha" class="password-strength mt-2">
                    <div class="progress" style="height: 8px;">
                      <div 
                        class="progress-bar"
                        :class="passwordStrengthClass"
                        :style="{ width: passwordStrengthPercent + '%' }"
                      ></div>
                    </div>
                    <small :class="passwordStrengthTextClass">
                      Força: {{ passwordStrengthText }}
                    </small>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">
                    Confirmar Senha <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model="form.confirmarSenha"
                    :type="mostrarSenha ? 'text' : 'password'"
                    class="form-control"
                    :class="{
                      'is-valid': isFieldValid('confirmarSenha'),
                      'is-invalid': hasFieldError('confirmarSenha')
                    }"
                    @blur="validateField('confirmarSenha')"
                    placeholder="Confirme sua senha"
                  >
                  <div class="invalid-feedback">
                    {{ getFieldError('confirmarSenha') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Termos e Condições -->
            <div class="section mb-4">
              <div class="form-check">
                <input 
                  v-model="form.aceitarTermos"
                  type="checkbox" 
                  class="form-check-input"
                  :class="{ 'is-invalid': hasFieldError('aceitarTermos') }"
                  id="termos"
                >
                <label class="form-check-label" for="termos">
                  Aceito os <a href="#" @click.prevent="mostrarTermos">Termos de Uso</a> 
                  e <a href="#" @click.prevent="mostrarPolitica">Política de Privacidade</a>
                  <span class="text-danger">*</span>
                </label>
                <div class="invalid-feedback">
                  {{ getFieldError('aceitarTermos') }}
                </div>
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="d-flex justify-content-between align-items-center">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="resetForm"
              >
                <i class="fas fa-undo me-2"></i>
                Limpar
              </button>
              
              <div class="form-status">
                <span v-if="formValid" class="text-success me-3">
                  <i class="fas fa-check-circle me-1"></i>
                  Formulário válido
                </span>
                <span v-else class="text-warning me-3">
                  <i class="fas fa-exclamation-triangle me-1"></i>
                  {{ totalErrors }} erro(s) encontrado(s)
                </span>
              </div>
              
              <button 
                type="submit"
                class="btn btn-primary"
                :disabled="!formValid || submitting"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-save me-2"></i>
                {{ submitting ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Preview dos dados -->
      <div class="card mt-4" v-if="showPreview">
        <div class="card-header">
          <h4>Preview dos Dados</h4>
        </div>
        <div class="card-body">
          <pre>{{ JSON.stringify(form, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FormValidator, validators } from '@/utils/validators'

export default {
  name: 'FormularioCompleto',
  data() {
    return {
      form: {
        // Dados pessoais
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        
        // Endereço
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        
        // Preferências
        categoria: '',
        interesses: [],
        
        // Upload
        foto: null,
        
        // Segurança
        senha: '',
        confirmarSenha: '',
        aceitarTermos: false
      },
      
      validator: new FormValidator(),
      validatedFields: new Set(),
      
      // Estados
      submitting: false,
      buscandoCEP: false,
      carregandoEndereco: false,
      mostrarSenha: false,
      showPreview: false
    }
  },
  
  computed: {
    formValid() {
      return this.validator.validate(this.form) && this.validatedFields.size > 0
    },
    
    totalErrors() {
      return Object.keys(this.validator.errors).length
    },
    
    progressPercentage() {
      const totalFields = 10 // Campos obrigatórios
      const filledFields = [
        this.form.nome,
        this.form.email,
        this.form.cpf,
        this.form.telefone,
        this.form.cep,
        this.form.logradouro,
        this.form.senha,
        this.form.confirmarSenha,
        this.form.aceitarTermos
      ].filter(field => {
        if (typeof field === 'boolean') return field
        return field && field.toString().trim()
      }).length
      
      return (filledFields / totalFields) * 100
    },
    
    // Força da senha
    passwordStrength() {
      const senha = this.form.senha
      if (!senha) return 0
      
      let score = 0
      if (senha.length >= 8) score += 1
      if (senha.length >= 12) score += 1
      if (/[a-z]/.test(senha)) score += 1
      if (/[A-Z]/.test(senha)) score += 1
      if (/[0-9]/.test(senha)) score += 1
      if (/[^A-Za-z0-9]/.test(senha)) score += 1
      
      return score
    },
    
    passwordStrengthPercent() {
      return (this.passwordStrength / 6) * 100
    },
    
    passwordStrengthClass() {
      const score = this.passwordStrength
      if (score <= 2) return 'bg-danger'
      if (score <= 4) return 'bg-warning'
      return 'bg-success'
    },
    
    passwordStrengthText() {
      const score = this.passwordStrength
      if (score <= 2) return 'Fraca'
      if (score <= 4) return 'Média'
      return 'Forte'
    },
    
    passwordStrengthTextClass() {
      const score = this.passwordStrength
      if (score <= 2) return 'text-danger'
      if (score <= 4) return 'text-warning'
      return 'text-success'
    }
  },
  
  mounted() {
    this.setupValidation()
  },
  
  methods: {
    setupValidation() {
      this.validator
        .setRules('nome', [
          'required',
          { type: 'min', value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
        ])
        .setRules('email', [
          'required',
          'email'
        ])
        .setRules('cpf', [
          'required',
          { 
            type: 'custom', 
            validator: validators.cpf, 
            message: 'CPF inválido' 
          }
        ])
        .setRules('telefone', [
          'required',
          { 
            type: 'custom', 
            validator: validators.phone, 
            message: 'Telefone inválido' 
          }
        ])
        .setRules('cep', [
          'required',
          { type: 'pattern', pattern: '^\\d{5}-?\\d{3}$', message: 'CEP inválido' }
        ])
        .setRules('logradouro', ['required'])
        .setRules('senha', [
          'required',
          { type: 'min', value: 8, message: 'Senha deve ter pelo menos 8 caracteres' },
          { 
            type: 'custom', 
            validator: validators.strongPassword, 
            message: 'Senha deve conter maiúscula, minúscula, número e símbolo' 
          }
        ])
        .setRules('confirmarSenha', [
          'required',
          (value) => {
            return value === this.form.senha || 'Senhas não coincidem'
          }
        ])
        .setRules('aceitarTermos', [
          (value) => value === true || 'Você deve aceitar os termos'
        ])
    },
    
    validateField(fieldName) {
      this.validator.validateField(fieldName, this.form[fieldName])
      this.validatedFields.add(fieldName)
    },
    
    clearFieldError(fieldName) {
      this.validator.clearErrors(fieldName)
    },
    
    hasFieldError(fieldName) {
      return this.validator.hasFieldError(fieldName)
    },
    
    isFieldValid(fieldName) {
      return this.validatedFields.has(fieldName) && !this.hasFieldError(fieldName)
    },
    
    getFieldError(fieldName) {
      return this.validator.getFirstFieldError(fieldName)
    },
    
    async buscarCEP() {
      const cep = this.form.cep.replace(/\D/g, '')
      if (cep.length !== 8) return
      
      this.buscandoCEP = true
      this.carregandoEndereco = true
      
      try {
        // Simular API de CEP
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Dados simulados
        this.form.logradouro = 'Rua das Flores'
        this.form.bairro = 'Centro'
        this.form.cidade = 'São Paulo'
        
        this.validateField('cep')
        this.validateField('logradouro')
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      } finally {
        this.buscandoCEP = false
        this.carregandoEndereco = false
      }
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.processFile(file)
      }
    },
    
    handleDrop(event) {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        this.processFile(file)
      }
    },
    
    processFile(file) {
      // Validar arquivo
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert('Arquivo muito grande. Máximo 5MB.')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        this.form.foto = {
          file: file,
          preview: e.target.result,
          name: file.name,
          size: file.size
        }
      }
      reader.readAsDataURL(file)
    },
    
    removeFile() {
      this.form.foto = null
    },
    
    async handleSubmit() {
      // Validar todos os campos
      Object.keys(this.validator.rules).forEach(field => {
        this.validateField(field)
      })
      
      if (!this.formValid) {
        alert('Por favor, corrija os erros no formulário')
        return
      }
      
      this.submitting = true
      
      try {
        // Simular envio
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        alert('Formulário enviado com sucesso!')
        this.showPreview = true
      } catch (error) {
        alert('Erro ao enviar formulário: ' + error.message)
      } finally {
        this.submitting = false
      }
    },
    
    resetForm() {
      if (confirm('Tem certeza que deseja limpar o formulário?')) {
        // Reset form data
        Object.keys(this.form).forEach(key => {
          if (Array.isArray(this.form[key])) {
            this.form[key] = []
          } else if (typeof this.form[key] === 'boolean') {
            this.form[key] = false
          } else {
            this.form[key] = ''
          }
        })
        
        this.form.foto = null
        this.validatedFields.clear()
        this.validator.clearErrors()
        this.showPreview = false
      }
    },
    
    mostrarTermos() {
      alert('Aqui seriam exibidos os Termos de Uso')
    },
    
    mostrarPolitica() {
      alert('Aqui seria exibida a Política de Privacidade')
    }
  }
}
</script>

<style scoped>
.section {
  border-left: 4px solid #007bff;
  padding-left: 20px;
}

.section-title {
  color: #007bff;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.3s ease;
}

.upload-area:hover {
  border-color: #007bff;
}

.upload-placeholder {
  cursor: pointer;
  padding: 40px 20px;
}

.upload-preview {
  position: relative;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}

.upload-actions {
  position: absolute;
  top: 5px;
  right: 5px;
}

.password-strength .progress {
  height: 8px;
}

.form-check-group .form-check {
  margin-bottom: 8px;
}

.form-status {
  font-size: 14px;
}

pre {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}
</style>