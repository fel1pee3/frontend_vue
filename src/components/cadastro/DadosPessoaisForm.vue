<template>
  <div>
    <h3>Dados Pessoais</h3>
    <div>
      <input v-model="dados.nome" placeholder="Nome completo" @blur="$emit('validar', 'nome')" :style="erros.nome ? 'border-color: red' : ''">
      <p v-if="erros.nome" style="color: red; font-size: 12px;">{{ erros.nome }}</p>
    </div>
    <div>
      <input v-model="dados.email" placeholder="Email" @blur="$emit('validar', 'email')" :style="erros.email ? 'border-color: red' : ''">
      <p v-if="erros.email" style="color: red; font-size: 12px;">{{ erros.email }}</p>
    </div>
    <div>
      <input v-model="dados.cpf" placeholder="CPF (11 dígitos)" @blur="$emit('validar', 'cpf')" :style="erros.cpf ? 'border-color: red' : ''">
      <p v-if="erros.cpf" style="color: red; font-size: 12px;">{{ erros.cpf }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DadosPessoaisForm',
  props: {
    modelValue: {
      type: Object,
      default: () => ({ nome: '', email: '', cpf: '' })
    },
    erros: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    dados: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  }
}
</script>

<style scoped>
input {
  display: block;
  padding: 8px;
  margin: 5px 0;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
