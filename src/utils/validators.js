/**
 * Sistema de validação reutilizável
 */
export class FormValidator {
  constructor() {
    this.rules = {}
    this.errors = {}
  }
  
  /**
   * Adicionar regras de validação
   */
  setRules(fieldName, rules) {
    this.rules[fieldName] = rules
    return this
  }
  
  /**
   * Validar um campo específico
   */
  validateField(fieldName, value) {
    const rules = this.rules[fieldName]
    if (!rules) return true
    
    this.errors[fieldName] = []
    
    for (const rule of rules) {
      const result = this.executeRule(rule, value, fieldName)
      if (result !== true) {
        this.errors[fieldName].push(result)
      }
    }
    
    return this.errors[fieldName].length === 0
  }
  
  /**
   * Validar todos os campos
   */
  validate(data) {
    let isValid = true
    this.errors = {}
    
    for (const fieldName in this.rules) {
      const fieldValid = this.validateField(fieldName, data[fieldName])
      if (!fieldValid) {
        isValid = false
      }
    }
    
    return isValid
  }
  
  /**
   * Executar regra específica
   */
  executeRule(rule, value, fieldName) {
    if (typeof rule === 'function') {
      return rule(value, fieldName)
    }
    
    if (typeof rule === 'object') {
      return this.executeBuiltInRule(rule, value, fieldName)
    }
    
    // Regra string simples
    return this.executeBuiltInRule({ type: rule }, value, fieldName)
  }
  
  /**
   * Regras built-in
   */
  executeBuiltInRule(rule, value, fieldName) {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value) || 
               (rule.message || `${fieldName} é obrigatório`)
      
      case 'email':
        return this.validateEmail(value) || 
               (rule.message || 'Email inválido')
      
      case 'min':
        return this.validateMin(value, rule.value) || 
               (rule.message || `Mínimo ${rule.value} caracteres`)
      
      case 'max':
        return this.validateMax(value, rule.value) || 
               (rule.message || `Máximo ${rule.value} caracteres`)
      
      case 'pattern':
        return this.validatePattern(value, rule.pattern) || 
               (rule.message || 'Formato inválido')
      
      case 'custom':
        return rule.validator(value) || rule.message
      
      default:
        return true
    }
  }
  
  // Validadores específicos
  validateRequired(value) {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim().length > 0
    return value !== null && value !== undefined && value !== ''
  }
  
  validateEmail(value) {
    if (!value) return true // Opcional se não for required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }
  
  validateMin(value, min) {
    if (!value) return true
    return value.toString().length >= min
  }
  
  validateMax(value, max) {
    if (!value) return true
    return value.toString().length <= max
  }
  
  validatePattern(value, pattern) {
    if (!value) return true
    const regex = new RegExp(pattern)
    return regex.test(value)
  }
  
  /**
   * Obter erros de um campo
   */
  getFieldErrors(fieldName) {
    return this.errors[fieldName] || []
  }
  
  /**
   * Verificar se campo tem erros
   */
  hasFieldError(fieldName) {
    return this.getFieldErrors(fieldName).length > 0
  }
  
  /**
   * Obter primeiro erro de um campo
   */
  getFirstFieldError(fieldName) {
    const errors = this.getFieldErrors(fieldName)
    return errors.length > 0 ? errors[0] : null
  }
  
  /**
   * Limpar erros
   */
  clearErrors(fieldName = null) {
    if (fieldName) {
      delete this.errors[fieldName]
    } else {
      this.errors = {}
    }
  }
}

// Validadores pré-definidos
export const validators = {
  cpf: (value) => {
    if (!value) return true
    const cpf = value.replace(/\D/g, '')
    if (cpf.length !== 11) return false
    
    // Validação básica de CPF
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.charAt(9))) return false
    
    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    return resto === parseInt(cpf.charAt(10))
  },
  
  phone: (value) => {
    if (!value) return true
    const phone = value.replace(/\D/g, '')
    return phone.length >= 10 && phone.length <= 11
  },
  
  strongPassword: (value) => {
    if (!value) return true
    const hasUpper = /[A-Z]/.test(value)
    const hasLower = /[a-z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    const isLongEnough = value.length >= 8
    
    return hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough
  }
}