<template>
  <div>
    <h3>Etapa 3: Dados Profissionais</h3>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Profissão *</label>
      <input v-model="dados.profissao" placeholder="Sua profissão" :style="erros.profissao ? 'border-color: red' : ''">
      <p v-if="erros.profissao" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.profissao }}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Empresa *</label>
      <input v-model="dados.empresa" placeholder="Nome da empresa" :style="erros.empresa ? 'border-color: red' : ''">
      <p v-if="erros.empresa" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.empresa }}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Salário (R$) *</label>
      <input v-model.number="dados.salario" type="number" placeholder="0.00" :style="erros.salario ? 'border-color: red' : ''">
      <p v-if="erros.salario" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.salario }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Step3Professional',
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
