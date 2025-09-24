## Aula 9 — Testes em Vue.js

### Objetivos
- Configurar ambiente de testes
- Escrever testes unitários
- Testar componentes Vue
- Mockar dependências e APIs
- Implementar testes end-to-end
- Configurar coverage de código
- Aplicar TDD com Vue
- Testar Pinia stores

---

### Configuração do Ambiente de Testes

#### Instalação das Dependências

```bash
# Vue Test Utils + Jest
npm install --save-dev @vue/test-utils jest
npm install --save-dev jest-environment-jsdom
npm install --save-dev @babel/preset-env

# Para testes com Pinia
npm install --save-dev @pinia/testing

# Para E2E testing
npm install --save-dev cypress
```

#### `jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.spec.js',
    '<rootDir>/src/**/__tests__/*.js'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/router/index.js',
    '!**/node_modules/**'
  ],
  coverageReporters: ['html', 'text', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
}
```

#### `tests/setup.js`

```javascript
import { config } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'

// Mock global components
config.global.components = {
  'router-link': {
    template: '<a><slot /></a>',
    props: ['to']
  },
  'router-view': {
    template: '<div><slot /></div>'
  }
}

// Global mocks
global.console = {
  ...global.console,
  warn: jest.fn(),
  error: jest.fn()
}

// Mock window methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock
```

---

### Testes Unitários Básicos

#### `tests/unit/utils/validators.spec.js`

```javascript
import { FormValidator, validators } from '@/utils/validators'

describe('FormValidator', () => {
  let validator

  beforeEach(() => {
    validator = new FormValidator()
  })

  describe('constructor', () => {
    it('should initialize with empty rules and errors', () => {
      expect(validator.rules).toEqual({})
      expect(validator.errors).toEqual({})
    })
  })

  describe('setRules', () => {
    it('should set rules for a field', () => {
      validator.setRules('email', ['required', 'email'])
      expect(validator.rules.email).toEqual(['required', 'email'])
    })

    it('should return validator instance for chaining', () => {
      const result = validator.setRules('email', ['required'])
      expect(result).toBe(validator)
    })
  })

  describe('validateField', () => {
    beforeEach(() => {
      validator.setRules('email', ['required', 'email'])
    })

    it('should validate required field successfully', () => {
      const result = validator.validateField('email', 'test@example.com')
      expect(result).toBe(true)
      expect(validator.errors.email).toEqual([])
    })

    it('should fail validation for empty required field', () => {
      const result = validator.validateField('email', '')
      expect(result).toBe(false)
      expect(validator.errors.email).toContain('email é obrigatório')
    })

    it('should fail validation for invalid email', () => {
      const result = validator.validateField('email', 'invalid-email')
      expect(result).toBe(false)
      expect(validator.errors.email).toContain('Email inválido')
    })

    it('should return true if no rules exist for field', () => {
      const result = validator.validateField('unknown', 'value')
      expect(result).toBe(true)
    })
  })

  describe('getFieldErrors', () => {
    it('should return errors for a field', () => {
      validator.setRules('email', ['required'])
      validator.validateField('email', '')
      
      const errors = validator.getFieldErrors('email')
      expect(errors).toContain('email é obrigatório')
    })

    it('should return empty array for field with no errors', () => {
      const errors = validator.getFieldErrors('nonexistent')
      expect(errors).toEqual([])
    })
  })
})

describe('validators', () => {
  describe('cpf', () => {
    it('should validate correct CPF', () => {
      expect(validators.cpf('11144477735')).toBe(true)
    })

    it('should reject invalid CPF', () => {
      expect(validators.cpf('12345678901')).toBe(false)
    })

    it('should handle CPF with formatting', () => {
      expect(validators.cpf('111.444.777-35')).toBe(true)
    })

    it('should return true for empty value', () => {
      expect(validators.cpf('')).toBe(true)
    })
  })

  describe('phone', () => {
    it('should validate 10-digit phone', () => {
      expect(validators.phone('1234567890')).toBe(true)
    })

    it('should validate 11-digit phone', () => {
      expect(validators.phone('12345678901')).toBe(true)
    })

    it('should reject invalid phone', () => {
      expect(validators.phone('123')).toBe(false)
    })

    it('should handle phone with formatting', () => {
      expect(validators.phone('(12) 34567-8901')).toBe(true)
    })
  })

  describe('strongPassword', () => {
    it('should validate strong password', () => {
      expect(validators.strongPassword('Test123@')).toBe(true)
    })

    it('should reject weak password', () => {
      expect(validators.strongPassword('password')).toBe(false)
    })

    it('should require uppercase', () => {
      expect(validators.strongPassword('test123@')).toBe(false)
    })

    it('should require lowercase', () => {
      expect(validators.strongPassword('TEST123@')).toBe(false)
    })

    it('should require number', () => {
      expect(validators.strongPassword('TestAbc@')).toBe(false)
    })

    it('should require special character', () => {
      expect(validators.strongPassword('Test1234')).toBe(false)
    })

    it('should require minimum length', () => {
      expect(validators.strongPassword('Te1@')).toBe(false)
    })
  })
})
```

---

### Testes de Componentes

#### `tests/unit/components/ProductCard.spec.js`

```javascript
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ProductCard from '@/components/ProductCard.vue'

// Mock product data
const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 29.99,
  description: 'Test description',
  image: '/test-image.jpg',
  stock: 5,
  category: 'electronics'
}

describe('ProductCard.vue', () => {
  let wrapper

  const createWrapper = (props = {}, options = {}) => {
    return mount(ProductCard, {
      props: {
        product: mockProduct,
        ...props
      },
      global: {
        plugins: [createTestingPinia({
          createSpy: jest.fn
        })],
        stubs: {
          'router-link': true
        }
      },
      ...options
    })
  }

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('rendering', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('should render product information', () => {
      expect(wrapper.find('h3').text()).toBe(mockProduct.name)
      expect(wrapper.find('.price').text()).toContain(mockProduct.price.toString())
      expect(wrapper.find('img').attributes('src')).toBe(mockProduct.image)
      expect(wrapper.find('img').attributes('alt')).toBe(mockProduct.name)
    })

    it('should show stock status when in stock', () => {
      expect(wrapper.find('.stock-status').text()).toContain('Em estoque')
    })

    it('should show out of stock when stock is 0', () => {
      wrapper = createWrapper({ 
        product: { ...mockProduct, stock: 0 }
      })
      expect(wrapper.find('.stock-status').text()).toContain('Sem estoque')
    })
  })

  describe('interactions', () => {
    let productsStore

    beforeEach(() => {
      wrapper = createWrapper()
      productsStore = wrapper.vm.$pinia._stores.get('products')
    })

    it('should add product to cart when button is clicked', async () => {
      const addButton = wrapper.find('[data-testid="add-to-cart"]')
      await addButton.trigger('click')

      expect(productsStore.addToCart).toHaveBeenCalledWith(mockProduct, 1)
    })

    it('should disable add to cart button when out of stock', () => {
      wrapper = createWrapper({ 
        product: { ...mockProduct, stock: 0 }
      })
      
      const addButton = wrapper.find('[data-testid="add-to-cart"]')
      expect(addButton.element.disabled).toBe(true)
    })

    it('should toggle favorite when favorite button is clicked', async () => {
      const favoriteButton = wrapper.find('[data-testid="favorite-button"]')
      await favoriteButton.trigger('click')

      expect(productsStore.toggleFavorite).toHaveBeenCalledWith(mockProduct.id)
    })

    it('should emit product-selected when clicked', async () => {
      await wrapper.find('.product-card').trigger('click')
      
      expect(wrapper.emitted('product-selected')).toHaveLength(1)
      expect(wrapper.emitted('product-selected')[0]).toEqual([mockProduct])
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('should compute formatted price', () => {
      expect(wrapper.vm.formattedPrice).toBe('$29.99')
    })

    it('should compute is in stock', () => {
      expect(wrapper.vm.isInStock).toBe(true)
      
      wrapper = createWrapper({ 
        product: { ...mockProduct, stock: 0 }
      })
      expect(wrapper.vm.isInStock).toBe(false)
    })

    it('should compute is favorite', () => {
      const productsStore = wrapper.vm.$pinia._stores.get('products')
      productsStore.favorites = [mockProduct.id]
      
      expect(wrapper.vm.isFavorite).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle missing product gracefully', () => {
      wrapper = createWrapper({ product: null })
      expect(wrapper.find('.product-card').exists()).toBe(false)
    })

    it('should handle missing image', () => {
      wrapper = createWrapper({
        product: { ...mockProduct, image: null }
      })
      
      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('/placeholder-image.jpg')
    })

    it('should handle very long product names', () => {
      const longName = 'A'.repeat(100)
      wrapper = createWrapper({
        product: { ...mockProduct, name: longName }
      })
      
      const title = wrapper.find('h3')
      expect(title.classes()).toContain('truncate')
    })
  })
})
```

---

### Testes de Formulários

#### `tests/unit/components/FormularioCompleto.spec.js`

```javascript
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FormularioCompleto from '@/components/FormularioCompleto.vue'

describe('FormularioCompleto.vue', () => {
  let wrapper

  const createWrapper = (options = {}) => {
    return mount(FormularioCompleto, {
      global: {
        stubs: {
          'font-awesome-icon': true
        }
      },
      ...options
    })
  }

  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    jest.restoreAllMocks()
  })

  describe('form rendering', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('should render all form sections', () => {
      expect(wrapper.find('[data-testid="personal-data"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="address-data"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="preferences"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="security"]').exists()).toBe(true)
    })

    it('should show progress bar', () => {
      const progressBar = wrapper.find('.progress-bar')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.text()).toContain('% completo')
    })

    it('should show form status', () => {
      const status = wrapper.find('.form-status')
      expect(status.exists()).toBe(true)
    })
  })

  describe('form validation', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('should validate required fields', async () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      
      // Test empty field
      await nameInput.setValue('')
      await nameInput.trigger('blur')
      
      expect(wrapper.find('.invalid-feedback').text()).toContain('obrigatório')
      expect(nameInput.classes()).toContain('is-invalid')
    })

    it('should validate email format', async () => {
      const emailInput = wrapper.find('[data-testid="email-input"]')
      
      // Test invalid email
      await emailInput.setValue('invalid-email')
      await emailInput.trigger('blur')
      
      expect(wrapper.find('.invalid-feedback').text()).toContain('Email inválido')
    })

    it('should validate password strength', async () => {
      const passwordInput = wrapper.find('[data-testid="password-input"]')
      
      // Test weak password
      await passwordInput.setValue('123')
      
      await nextTick()
      expect(wrapper.find('.password-strength .progress-bar').classes()).toContain('bg-danger')
      expect(wrapper.find('.password-strength small').text()).toContain('Fraca')
    })

    it('should validate password confirmation', async () => {
      const passwordInput = wrapper.find('[data-testid="password-input"]')
      const confirmInput = wrapper.find('[data-testid="confirm-password-input"]')
      
      await passwordInput.setValue('Test123@')
      await confirmInput.setValue('Different123@')
      await confirmInput.trigger('blur')
      
      expect(wrapper.find('.invalid-feedback').text()).toContain('Senhas não coincidem')
    })

    it('should validate CPF', async () => {
      const cpfInput = wrapper.find('[data-testid="cpf-input"]')
      
      await cpfInput.setValue('123.456.789-00')
      await cpfInput.trigger('blur')
      
      expect(wrapper.find('.invalid-feedback').text()).toContain('CPF inválido')
    })
  })

  describe('form interactions', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('should clear field errors on input', async () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      
      // First trigger error
      await nameInput.trigger('blur')
      expect(nameInput.classes()).toContain('is-invalid')
      
      // Then clear by typing
      await nameInput.setValue('John Doe')
      expect(nameInput.classes()).not.toContain('is-invalid')
    })

    it('should update progress bar as fields are filled', async () => {
      const progressBar = wrapper.find('.progress-bar')
      const initialWidth = progressBar.element.style.width
      
      // Fill required fields
      await wrapper.find('[data-testid="name-input"]').setValue('John Doe')
      await wrapper.find('[data-testid="email-input"]').setValue('john@example.com')
      
      await nextTick()
      const newWidth = progressBar.element.style.width
      expect(parseFloat(newWidth)).toBeGreaterThan(parseFloat(initialWidth))
    })

    it('should toggle password visibility', async () => {
      const passwordInput = wrapper.find('[data-testid="password-input"]')
      const toggleButton = wrapper.find('[data-testid="password-toggle"]')
      
      expect(passwordInput.attributes('type')).toBe('password')
      
      await toggleButton.trigger('click')
      expect(passwordInput.attributes('type')).toBe('text')
    })

    it('should reset form when reset button is clicked', async () => {
      // Fill some data
      await wrapper.find('[data-testid="name-input"]').setValue('John Doe')
      await wrapper.find('[data-testid="email-input"]').setValue('john@example.com')
      
      // Mock confirm dialog
      global.confirm = jest.fn().mockReturnValue(true)
      
      await wrapper.find('[data-testid="reset-button"]').trigger('click')
      
      expect(wrapper.vm.form.nome).toBe('')
      expect(wrapper.vm.form.email).toBe('')
    })
  })

  describe('file upload', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('should handle file selection', async () => {
      const fileInput = wrapper.find('[data-testid="file-input"]')
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/jpeg;base64,test',
        onload: null
      }
      
      global.FileReader = jest.fn(() => mockFileReader)
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      // Simulate FileReader onload
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test' } })
      
      await nextTick()
      expect(wrapper.vm.form.foto).toBeTruthy()
      expect(wrapper.vm.form.foto.name).toBe('test.jpg')
    })

    it('should reject large files', async () => {
      const fileInput = wrapper.find('[data-testid="file-input"]')
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      })
      
      global.alert = jest.fn()
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [largeFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(global.alert).toHaveBeenCalledWith('Arquivo muito grande. Máximo 5MB.')
      expect(wrapper.vm.form.foto).toBeNull()
    })
  })

  describe('form submission', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('should prevent submission with invalid form', async () => {
      const form = wrapper.find('form')
      const submitSpy = jest.spyOn(wrapper.vm, 'handleSubmit')
      
      await form.trigger('submit')
      
      expect(submitSpy).toHaveBeenCalled()
      expect(wrapper.vm.submitting).toBe(false)
    })

    it('should submit valid form', async () => {
      // Fill all required fields
      await wrapper.find('[data-testid="name-input"]').setValue('John Doe')
      await wrapper.find('[data-testid="email-input"]').setValue('john@example.com')
      await wrapper.find('[data-testid="cpf-input"]').setValue('111.444.777-35')
      await wrapper.find('[data-testid="phone-input"]').setValue('(11) 99999-9999')
      await wrapper.find('[data-testid="cep-input"]').setValue('12345-678')
      await wrapper.find('[data-testid="address-input"]').setValue('Rua Teste')
      await wrapper.find('[data-testid="password-input"]').setValue('Test123@')
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('Test123@')
      await wrapper.find('[data-testid="terms-checkbox"]').setChecked()
      
      // Trigger validation
      await wrapper.vm.validator.validate(wrapper.vm.form)
      wrapper.vm.validatedFields.add('nome')
      wrapper.vm.validatedFields.add('email')
      wrapper.vm.validatedFields.add('cpf')
      wrapper.vm.validatedFields.add('telefone')
      wrapper.vm.validatedFields.add('cep')
      wrapper.vm.validatedFields.add('logradouro')
      wrapper.vm.validatedFields.add('senha')
      wrapper.vm.validatedFields.add('confirmarSenha')
      wrapper.vm.validatedFields.add('aceitarTermos')
      
      global.alert = jest.fn()
      
      const form = wrapper.find('form')
      await form.trigger('submit')
      
      // Wait for async submission
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(global.alert).toHaveBeenCalledWith('Formulário enviado com sucesso!')
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('should have proper aria labels', () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      const nameLabel = wrapper.find('label[for="name"]')
      
      expect(nameLabel.exists()).toBe(true)
      expect(nameLabel.text()).toContain('Nome Completo')
    })

    it('should have proper error associations', async () => {
      const emailInput = wrapper.find('[data-testid="email-input"]')
      
      await emailInput.setValue('invalid')
      await emailInput.trigger('blur')
      
      const errorElement = wrapper.find('.invalid-feedback')
      expect(errorElement.exists()).toBe(true)
    })

    it('should be keyboard navigable', async () => {
      const firstInput = wrapper.find('[data-testid="name-input"]')
      const secondInput = wrapper.find('[data-testid="email-input"]')
      
      await firstInput.trigger('keydown.tab')
      expect(document.activeElement).not.toBe(firstInput.element)
    })
  })
})
```

---

### Testes de Pinia Stores

#### `tests/unit/stores/user.spec.js`

```javascript
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import api from '@/services/api'

// Mock API
jest.mock('@/services/api')

describe('User Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useUserStore()
    
    // Clear localStorage mock
    localStorage.clear()
    
    // Reset API mocks
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(store.user).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(store.loading).toBe(false)
      expect(store.permissions).toEqual([])
      expect(store.loginAttempts).toBe(0)
    })
  })

  describe('getters', () => {
    it('should compute fullName correctly', () => {
      store.user = { firstName: 'John', lastName: 'Doe' }
      expect(store.fullName).toBe('John Doe')
    })

    it('should return empty string for fullName when no user', () => {
      expect(store.fullName).toBe('')
    })

    it('should check permissions correctly', () => {
      store.permissions = ['admin', 'user-read']
      expect(store.hasPermission('admin')).toBe(true)
      expect(store.hasPermission('super-admin')).toBe(false)
    })

    it('should compute userStats correctly', () => {
      store.user = {
        totalLogins: 10,
        createdAt: '2023-01-01T00:00:00Z'
      }
      store.lastLogin = '2023-12-01T00:00:00Z'
      
      const stats = store.userStats
      expect(stats.totalLogins).toBe(10)
      expect(stats.daysActive).toBeGreaterThan(0)
      expect(stats.lastLoginFormatted).toBeTruthy()
    })

    it('should return null for userStats when no user', () => {
      expect(store.userStats).toBe(null)
    })
  })

  describe('actions', () => {
    describe('updatePreferences', () => {
      it('should update preferences', () => {
        const newPrefs = { theme: 'dark' }
        store.updatePreferences(newPrefs)
        
        expect(store.preferences.theme).toBe('dark')
        expect(store.preferences.language).toBe('pt-BR') // should keep existing
      })
    })

    describe('login', () => {
      const mockUser = { id: 1, firstName: 'John', lastName: 'Doe' }
      const mockResponse = {
        data: {
          user: mockUser,
          permissions: ['user'],
          token: 'mock-token'
        }
      }

      it('should login successfully', async () => {
        api.post.mockResolvedValueOnce(mockResponse)
        
        const result = await store.login({ email: 'john@example.com', password: 'password' })
        
        expect(api.post).toHaveBeenCalledWith('/auth/login', {
          email: 'john@example.com',
          password: 'password'
        })
        expect(store.user).toEqual(mockUser)
        expect(store.isAuthenticated).toBe(true)
        expect(store.permissions).toEqual(['user'])
        expect(store.loginAttempts).toBe(0)
        expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-token')
        expect(result.success).toBe(true)
      })

      it('should handle 401 error', async () => {
        api.post.mockRejectedValueOnce({
          response: { status: 401 }
        })
        
        await expect(store.login({ email: 'wrong@example.com', password: 'wrong' }))
          .rejects.toThrow('Credenciais inválidas')
        
        expect(store.isAuthenticated).toBe(false)
        expect(store.loginAttempts).toBe(1)
      })

      it('should handle 429 error', async () => {
        api.post.mockRejectedValueOnce({
          response: { status: 429 }
        })
        
        await expect(store.login({ email: 'test@example.com', password: 'password' }))
          .rejects.toThrow('Muitas tentativas')
      })

      it('should handle network error', async () => {
        api.post.mockRejectedValueOnce(new Error('Network Error'))
        
        await expect(store.login({ email: 'test@example.com', password: 'password' }))
          .rejects.toThrow('Erro interno')
      })

      it('should set loading state correctly', async () => {
        let resolvePromise
        const promise = new Promise(resolve => {
          resolvePromise = resolve
        })
        
        api.post.mockReturnValueOnce(promise)
        
        const loginPromise = store.login({ email: 'test@example.com', password: 'password' })
        
        expect(store.loading).toBe(true)
        
        resolvePromise(mockResponse)
        await loginPromise
        
        expect(store.loading).toBe(false)
      })
    })

    describe('logout', () => {
      beforeEach(() => {
        // Set initial logged in state
        store.user = { id: 1, name: 'John' }
        store.isAuthenticated = true
        store.permissions = ['user']
        localStorage.setItem('authToken', 'test-token')
      })

      it('should logout successfully', async () => {
        api.post.mockResolvedValueOnce({})
        
        await store.logout()
        
        expect(api.post).toHaveBeenCalledWith('/auth/logout')
        expect(store.user).toBe(null)
        expect(store.isAuthenticated).toBe(false)
        expect(store.permissions).toEqual([])
        expect(localStorage.removeItem).toHaveBeenCalledWith('authToken')
      })

      it('should logout even if API call fails', async () => {
        api.post.mockRejectedValueOnce(new Error('API Error'))
        
        await store.logout()
        
        expect(store.user).toBe(null)
        expect(store.isAuthenticated).toBe(false)
      })
    })

    describe('refreshAuth', () => {
      it('should refresh authentication successfully', async () => {
        const mockResponse = {
          data: {
            user: { id: 1, name: 'John' },
            permissions: ['user'],
            token: 'new-token'
          }
        }
        
        localStorage.setItem('authToken', 'old-token')
        api.post.mockResolvedValueOnce(mockResponse)
        
        const result = await store.refreshAuth()
        
        expect(result).toBe(true)
        expect(store.isAuthenticated).toBe(true)
        expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'new-token')
      })

      it('should return false if no token exists', async () => {
        const result = await store.refreshAuth()
        expect(result).toBe(false)
      })

      it('should logout if refresh fails', async () => {
        localStorage.setItem('authToken', 'invalid-token')
        api.post.mockRejectedValueOnce(new Error('Invalid token'))
        
        const logoutSpy = jest.spyOn(store, 'logout')
        
        const result = await store.refreshAuth()
        
        expect(result).toBe(false)
        expect(logoutSpy).toHaveBeenCalled()
      })
    })

    describe('updateProfile', () => {
      beforeEach(() => {
        store.user = { id: 1, name: 'John', email: 'john@example.com' }
      })

      it('should update profile successfully', async () => {
        const updatedData = { name: 'John Updated' }
        const mockResponse = { data: updatedData }
        
        api.put.mockResolvedValueOnce(mockResponse)
        
        const result = await store.updateProfile(updatedData)
        
        expect(api.put).toHaveBeenCalledWith('/user/profile', updatedData)
        expect(store.user.name).toBe('John Updated')
        expect(result.success).toBe(true)
      })

      it('should handle update errors', async () => {
        api.put.mockRejectedValueOnce({
          response: { data: { message: 'Update failed' } }
        })
        
        await expect(store.updateProfile({ name: 'Test' }))
          .rejects.toThrow('Update failed')
      })
    })
  })
})
```

---

### Testes End-to-End com Cypress

#### `cypress/e2e/auth.cy.js`

```javascript
describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset database or use fixtures
    cy.exec('npm run db:reset')
    
    // Visit login page
    cy.visit('/login')
  })

  describe('Login', () => {
    it('should login with valid credentials', () => {
      cy.get('[data-cy="email-input"]').type('user@example.com')
      cy.get('[data-cy="password-input"]').type('password123')
      cy.get('[data-cy="login-button"]').click()
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
      cy.get('[data-cy="user-menu"]').should('contain', 'User Name')
    })

    it('should show error with invalid credentials', () => {
      cy.get('[data-cy="email-input"]').type('wrong@example.com')
      cy.get('[data-cy="password-input"]').type('wrongpassword')
      cy.get('[data-cy="login-button"]').click()
      
      cy.get('[data-cy="error-message"]')
        .should('be.visible')
        .and('contain', 'Credenciais inválidas')
    })

    it('should show validation errors for empty fields', () => {
      cy.get('[data-cy="login-button"]').click()
      
      cy.get('[data-cy="email-error"]').should('contain', 'Email é obrigatório')
      cy.get('[data-cy="password-error"]').should('contain', 'Senha é obrigatória')
    })

    it('should persist login after page refresh', () => {
      // Login first
      cy.get('[data-cy="email-input"]').type('user@example.com')
      cy.get('[data-cy="password-input"]').type('password123')
      cy.get('[data-cy="login-button"]').click()
      
      // Verify login
      cy.url().should('include', '/dashboard')
      
      // Refresh page
      cy.reload()
      
      // Should still be logged in
      cy.url().should('include', '/dashboard')
      cy.get('[data-cy="user-menu"]').should('exist')
    })
  })

  describe('Logout', () => {
    beforeEach(() => {
      // Login first
      cy.get('[data-cy="email-input"]').type('user@example.com')
      cy.get('[data-cy="password-input"]').type('password123')
      cy.get('[data-cy="login-button"]').click()
    })

    it('should logout user', () => {
      cy.get('[data-cy="user-menu"]').click()
      cy.get('[data-cy="logout-button"]').click()
      
      // Should redirect to login
      cy.url().should('include', '/login')
      cy.get('[data-cy="login-form"]').should('be.visible')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('should allow access to protected route after login', () => {
      cy.get('[data-cy="email-input"]').type('user@example.com')
      cy.get('[data-cy="password-input"]').type('password123')
      cy.get('[data-cy="login-button"]').click()
      
      cy.visit('/profile')
      cy.url().should('include', '/profile')
      cy.get('[data-cy="profile-form"]').should('be.visible')
    })
  })
})
```

#### `cypress/e2e/product-management.cy.js`

```javascript
describe('Product Management', () => {
  beforeEach(() => {
    // Setup test data
    cy.exec('npm run db:seed')
    
    // Login as admin
    cy.login('admin@example.com', 'admin123')
    
    cy.visit('/products')
  })

  describe('Product List', () => {
    it('should display products', () => {
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0)
      cy.get('[data-cy="product-name"]').first().should('be.visible')
      cy.get('[data-cy="product-price"]').first().should('be.visible')
    })

    it('should filter products by category', () => {
      cy.get('[data-cy="category-filter"]').select('Electronics')
      cy.get('[data-cy="apply-filters"]').click()
      
      cy.get('[data-cy="product-card"]').each($card => {
        cy.wrap($card).should('contain', 'Electronics')
      })
    })

    it('should search products', () => {
      const searchTerm = 'iPhone'
      cy.get('[data-cy="search-input"]').type(searchTerm)
      cy.get('[data-cy="search-button"]').click()
      
      cy.get('[data-cy="product-name"]').each($name => {
        cy.wrap($name).should('contain.text', searchTerm, { matchCase: false })
      })
    })

    it('should sort products by price', () => {
      cy.get('[data-cy="sort-select"]').select('price-asc')
      
      let prices = []
      cy.get('[data-cy="product-price"]')
        .each($price => {
          const price = parseFloat($price.text().replace('$', ''))
          prices.push(price)
        })
        .then(() => {
          const sortedPrices = [...prices].sort((a, b) => a - b)
          expect(prices).to.deep.equal(sortedPrices)
        })
    })
  })

  describe('Add to Cart', () => {
    it('should add product to cart', () => {
      cy.get('[data-cy="add-to-cart-button"]').first().click()
      
      cy.get('[data-cy="cart-icon"]').should('contain', '1')
      cy.get('[data-cy="notification"]').should('contain', 'adicionado ao carrinho')
    })

    it('should update cart count when adding multiple items', () => {
      cy.get('[data-cy="add-to-cart-button"]').first().click()
      cy.get('[data-cy="add-to-cart-button"]').eq(1).click()
      
      cy.get('[data-cy="cart-icon"]').should('contain', '2')
    })

    it('should prevent adding out of stock items', () => {
      cy.get('[data-cy="product-card"]')
        .contains('Out of Stock')
        .parent()
        .find('[data-cy="add-to-cart-button"]')
        .should('be.disabled')
    })
  })

  describe('Product Details', () => {
    it('should show product details on click', () => {
      cy.get('[data-cy="product-card"]').first().click()
      
      cy.get('[data-cy="product-modal"]').should('be.visible')
      cy.get('[data-cy="product-description"]').should('be.visible')
      cy.get('[data-cy="product-specifications"]').should('be.visible')
    })

    it('should allow quantity selection in product details', () => {
      cy.get('[data-cy="product-card"]').first().click()
      
      cy.get('[data-cy="quantity-input"]').clear().type('3')
      cy.get('[data-cy="add-to-cart-button"]').click()
      
      cy.get('[data-cy="cart-icon"]').should('contain', '3')
    })
  })

  describe('Favorites', () => {
    it('should add product to favorites', () => {
      cy.get('[data-cy="favorite-button"]').first().click()
      
      cy.get('[data-cy="favorite-button"]').first().should('have.class', 'active')
      cy.get('[data-cy="notification"]').should('contain', 'favoritos')
    })

    it('should remove product from favorites', () => {
      // Add to favorites first
      cy.get('[data-cy="favorite-button"]').first().click()
      
      // Remove from favorites
      cy.get('[data-cy="favorite-button"]').first().click()
      
      cy.get('[data-cy="favorite-button"]').first().should('not.have.class', 'active')
    })

    it('should show favorites in profile', () => {
      cy.get('[data-cy="favorite-button"]').first().click()
      
      cy.visit('/profile/favorites')
      cy.get('[data-cy="favorite-product"]').should('have.length', 1)
    })
  })
})
```

---

### Comandos de Teste no package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  }
}
```

---

### Exercícios Práticos

#### Exercício 1: Testar Store Complexa
Criar testes para a store de produtos:
- Testar todos os getters
- Testar ações assíncronas
- Mockar API calls
- Testar error handling

#### Exercício 2: Testes de Integração
Criar testes que verificam:
- Interação entre componentes
- Fluxo completo de dados
- Store + Component integration
- Router navigation

#### Exercício 3: E2E Completo
Implementar testes E2E para:
- Fluxo completo de compra
- Gerenciamento de perfil
- Funcionalidades admin
- Responsividade

---

### Comandos Git

```bash
git add .
git commit -m "Aula 9 - Testes em Vue.js"
```

---

### Próxima Aula

Na **Aula 10** veremos:
- Performance e otimização
- Lazy loading de componentes
- Code splitting
- Bundle optimization