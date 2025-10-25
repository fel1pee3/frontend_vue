<template>
  <div>
    <h3>Etapa 1: Dados Pessoais</h3>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Nome *</label>
      <input v-model="dados.nome" placeholder="Nome completo" :style="erros.nome ? 'border-color: red' : ''">
      <p v-if="erros.nome" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.nome }}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Email *</label>
      <input v-model="dados.email" placeholder="seu@email.com" :style="erros.email ? 'border-color: red' : ''">
      <p v-if="erros.email" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.email }}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">CPF *</label>
      <input v-model="dados.cpf" placeholder="11111111111" :style="erros.cpf ? 'border-color: red' : ''">
      <p v-if="erros.cpf" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.cpf }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Step1Personal',
  props: {
    modelValue: Object,
    erros: Object
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
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
</style>
