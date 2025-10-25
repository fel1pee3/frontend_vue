<template>
  <div>
    <h3>Senha</h3>
    <div>
      <input v-model="dados.senha" type="password" placeholder="Senha" @blur="$emit('validar', 'senha')" :style="erros.senha ? 'border-color: red' : ''">
      <p v-if="erros.senha" style="color: red; font-size: 12px;">{{ erros.senha }}</p>
    </div>
    <div>
      <input v-model="dados.confirma_senha" type="password" placeholder="Confirmar senha" @blur="$emit('validar', 'confirma_senha')" :style="erros.confirma_senha ? 'border-color: red' : ''">
      <p v-if="erros.confirma_senha" style="color: red; font-size: 12px;">{{ erros.confirma_senha }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SenhaForm',
  props: {
    modelValue: {
      type: Object,
      default: () => ({ senha: '', confirma_senha: '' })
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
