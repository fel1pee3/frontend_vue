<template>
  <div>
    <h3>Termos e Condições</h3>
    <div>
      <label>
        <input v-model="dados.aceita_termos" type="checkbox" @change="$emit('validar', 'aceita_termos')">
        Aceito os termos e condições
      </label>
      <p v-if="erros.aceita_termos" style="color: red; font-size: 12px;">{{ erros.aceita_termos }}</p>
    </div>
    <div>
      <label>
        <input v-model="dados.marketing" type="checkbox">
        Receber notificações de marketing
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TermosForm',
  props: {
    modelValue: {
      type: Object,
      default: () => ({ aceita_termos: false, marketing: false })
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
label {
  display: block;
  margin: 10px 0;
  cursor: pointer;
}
input[type="checkbox"] {
  margin-right: 8px;
}
</style>
