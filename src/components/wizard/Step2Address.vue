<template>
  <div>
    <h3>Etapa 2: Endereço</h3>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">CEP *</label>
      <input v-model="dados.cep" placeholder="12345-678" :style="erros.cep ? 'border-color: red' : ''">
      <p v-if="erros.cep" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.cep }}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Rua *</label>
      <input v-model="dados.rua" placeholder="Nome da rua" :style="erros.rua ? 'border-color: red' : ''">
      <p v-if="erros.rua" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.rua }}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Número *</label>
      <input v-model="dados.numero" placeholder="123" :style="erros.numero ? 'border-color: red' : ''">
      <p v-if="erros.numero" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.numero }}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Cidade *</label>
      <input v-model="dados.cidade" placeholder="Sua cidade" :style="erros.cidade ? 'border-color: red' : ''">
      <p v-if="erros.cidade" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.cidade }}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px;">Estado *</label>
      <input v-model="dados.estado" placeholder="SP" :style="erros.estado ? 'border-color: red' : ''">
      <p v-if="erros.estado" style="color: red; font-size: 12px; margin: 3px 0;">{{ erros.estado }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Step2Address',
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
