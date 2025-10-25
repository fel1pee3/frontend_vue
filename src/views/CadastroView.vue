<template>
  <div>
    <h2>Cadastro Multi-Componente</h2>
    
    <div style="margin-bottom: 20px; background: #e9ecef; padding: 10px; border-radius: 4px;">
      <p style="margin: 0;">Progresso: <strong>{{ etapa }} / 4</strong></p>
      <div style="width: 100%; height: 10px; background: #ddd; border-radius: 4px; margin-top: 5px;">
        <div :style="{ width: (etapa * 25) + '%', height: '100%', background: '#007bff', transition: 'width 0.3s' }"></div>
      </div>
    </div>

    <div v-if="etapa === 1">
      <DadosPessoaisForm v-model="formData.pessoais" :erros="erros" @validar="validarCampo" />
    </div>

    <div v-if="etapa === 2">
      <EnderecoForm v-model="formData.endereco" :erros="erros" @validar="validarCampo" />
    </div>

    <div v-if="etapa === 3">
      <SenhaForm v-model="formData.senha" :erros="erros" @validar="validarCampo" />
    </div>

    <div v-if="etapa === 4">
      <h3>Revisão dos Dados</h3>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
        <p><strong>Nome:</strong> {{ formData.pessoais.nome }}</p>
        <p><strong>Email:</strong> {{ formData.pessoais.email }}</p>
        <p><strong>CPF:</strong> {{ formData.pessoais.cpf }}</p>
        <p><strong>CEP:</strong> {{ formData.endereco.cep }}</p>
        <p><strong>Rua:</strong> {{ formData.endereco.rua }}</p>
        <p><strong>Número:</strong> {{ formData.endereco.numero }}</p>
        <p><strong>Cidade:</strong> {{ formData.endereco.cidade }}</p>
        <p><strong>Estado:</strong> {{ formData.endereco.estado }}</p>
        <p><strong>Termos aceitos:</strong> {{ formData.termos.aceita_termos ? 'Sim' : 'Não' }}</p>
      </div>
    </div>

    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
      <button v-if="etapa > 1" @click="voltarEtapa" style="padding: 10px 20px;">← Anterior</button>
      <button v-if="etapa < 4" @click="proximaEtapa" style="padding: 10px 20px;">Próximo →</button>
      <button v-if="etapa === 4" @click="confirmar" style="padding: 10px 20px; background: #28a745; color: white;">Confirmar</button>
    </div>

    <div v-if="mensagem" :style="{ marginTop: '20px', padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '4px' }">
      {{ mensagem }}
    </div>
  </div>
</template>

<script>
import DadosPessoaisForm from '../components/cadastro/DadosPessoaisForm.vue'
import EnderecoForm from '../components/cadastro/EnderecoForm.vue'
import SenhaForm from '../components/cadastro/SenhaForm.vue'
import TermosForm from '../components/cadastro/TermosForm.vue'
import { FormValidator } from '../utils/validators'

export default {
  name: 'CadastroView',
  components: {
    DadosPessoaisForm,
    EnderecoForm,
    SenhaForm,
    TermosForm
  },
  data() {
    return {
      etapa: 1,
      erros: {},
      mensagem: '',
      formData: {
        pessoais: { nome: '', email: '', cpf: '' },
        endereco: { cep: '', rua: '', numero: '', cidade: '', estado: '' },
        senha: { senha: '', confirma_senha: '' },
        termos: { aceita_termos: false, marketing: false }
      }
    }
  },
  methods: {
    validarCampo(campo) {
      const validator = new FormValidator()
      
      const regras = {
        nome: [
          { rule: 'required', message: 'Nome é obrigatório' }
        ],
        email: [
          { rule: 'required', message: 'Email é obrigatório' },
          { rule: 'email', message: 'Email inválido' }
        ],
        cpf: [
          { rule: 'required', message: 'CPF é obrigatório' },
          { rule: 'cpf', message: 'CPF deve ter 11 dígitos' }
        ],
        cep: [
          { rule: 'required', message: 'CEP é obrigatório' }
        ],
        rua: [
          { rule: 'required', message: 'Rua é obrigatória' }
        ],
        numero: [
          { rule: 'required', message: 'Número é obrigatório' }
        ],
        cidade: [
          { rule: 'required', message: 'Cidade é obrigatória' }
        ],
        estado: [
          { rule: 'required', message: 'Estado é obrigatório' }
        ],
        senha: [
          { rule: 'required', message: 'Senha é obrigatória' },
          { rule: 'min:6', message: 'Senha deve ter no mínimo 6 caracteres' }
        ],
        confirma_senha: [
          { rule: 'required', message: 'Confirmação de senha é obrigatória' }
        ],
        aceita_termos: [
          { rule: 'required', message: 'Você deve aceitar os termos' }
        ]
      }

      if (!regras[campo]) return true

      const dados = {
        ...this.formData.pessoais,
        ...this.formData.endereco,
        ...this.formData.senha,
        ...this.formData.termos
      }

      validator.setRules(regras)
      const isValid = validator.validateField(campo, dados[campo])

      if (!isValid && validator.errors[campo]) {
        this.$set(this.erros, campo, validator.errors[campo][0]?.message || 'Campo inválido')
      } else {
        this.$delete(this.erros, campo)
      }

      return isValid
    },
    validarEtapa() {
      const camposPorEtapa = {
        1: ['nome', 'email', 'cpf'],
        2: ['cep', 'rua', 'numero', 'cidade', 'estado'],
        3: ['senha', 'confirma_senha'],
        4: ['aceita_termos']
      }

      const campos = camposPorEtapa[this.etapa] || []
      let valida = true

      campos.forEach(campo => {
        if (!this.validarCampo(campo)) {
          valida = false
        }
      })

      return valida
    },
    proximaEtapa() {
      if (this.validarEtapa()) {
        if (this.etapa < 4) {
          this.etapa++
        }
      }
    },
    voltarEtapa() {
      if (this.etapa > 1) {
        this.etapa--
      }
    },
    confirmar() {
      if (this.validarEtapa()) {
        this.mensagem = '✓ Cadastro realizado com sucesso!'
        console.log('Dados do cadastro:', this.formData)
      }
    }
  }
}
</script>
