<template>
  <div>
    <h2>Formulário Multi-Etapas (Wizard)</h2>
    
    <StepIndicator :etapaAtual="etapa" @ir-etapa="irParaEtapa" />

    <div style="background: white; padding: 20px; border-radius: 4px; border: 1px solid #ddd;">
      <div v-if="etapa === 1">
        <Step1Personal v-model="dados.pessoais" :erros="erros" />
      </div>

      <div v-if="etapa === 2">
        <Step2Address v-model="dados.endereco" :erros="erros" />
      </div>

      <div v-if="etapa === 3">
        <Step3Professional v-model="dados.profissao" :erros="erros" />
      </div>

      <div v-if="etapa === 4">
        <Step4Review :dados="dados" />
      </div>

      <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
        <button v-if="etapa > 1" @click="voltarEtapa" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">← Anterior</button>
        <button v-if="etapa < 4" @click="proximaEtapa" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Próximo →</button>
        <button v-if="etapa === 4" @click="confirmar" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">✓ Confirmar</button>
      </div>

      <div v-if="mensagem" style="margin-top: 20px; padding: 15px; background: #d4edda; color: #155724; border-radius: 4px;">
        {{ mensagem }}
      </div>
    </div>
  </div>
</template>

<script>
import StepIndicator from '../components/wizard/StepIndicator.vue'
import Step1Personal from '../components/wizard/Step1Personal.vue'
import Step2Address from '../components/wizard/Step2Address.vue'
import Step3Professional from '../components/wizard/Step3Professional.vue'
import Step4Review from '../components/wizard/Step4Review.vue'
import { validarStep1, validarStep2, validarStep3 } from '../utils/wizardValidation'

export default {
  name: 'WizardView',
  components: {
    StepIndicator,
    Step1Personal,
    Step2Address,
    Step3Professional,
    Step4Review
  },
  data() {
    return {
      etapa: 1,
      erros: {},
      mensagem: '',
      dados: {
        pessoais: { nome: '', email: '', cpf: '' },
        endereco: { cep: '', rua: '', numero: '', cidade: '', estado: '' },
        profissao: { profissao: '', empresa: '', salario: 0 }
      }
    }
  },
  methods: {
    validarEtapa() {
      this.erros = {}

      if (this.etapa === 1) {
        this.erros = validarStep1(this.dados.pessoais)
      } else if (this.etapa === 2) {
        this.erros = validarStep2(this.dados.endereco)
      } else if (this.etapa === 3) {
        this.erros = validarStep3(this.dados.profissao)
      }

      return Object.keys(this.erros).length === 0
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
    irParaEtapa(novaEtapa) {
      if (novaEtapa < this.etapa) {
        this.etapa = novaEtapa
      }
    },
    confirmar() {
      this.mensagem = '✓ Cadastro realizado com sucesso!'
      console.log('Dados do wizard:', this.dados)
      setTimeout(() => {
        this.limpar()
      }, 2000)
    },
    limpar() {
      this.etapa = 1
      this.erros = {}
      this.mensagem = ''
      this.dados = {
        pessoais: { nome: '', email: '', cpf: '' },
        endereco: { cep: '', rua: '', numero: '', cidade: '', estado: '' },
        profissao: { profissao: '', empresa: '', salario: 0 }
      }
    }
  }
}
</script>
