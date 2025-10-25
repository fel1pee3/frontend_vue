<template>
  <div>
    <input v-model="busca" placeholder="Buscar por nome..." @input="atualizar">
    <p style="font-size: 12px; color: #666;">{{ resultados }} resultado(s)</p>
  </div>
</template>

<script>
export default {
  name: 'SearchInput',
  props: {
    modelValue: String
  },
  data() {
    return {
      busca: this.modelValue || '',
      resultados: 0
    }
  },
  methods: {
    atualizar() {
      this.$emit('update:modelValue', this.busca)
      this.$emit('busca-atualizada', this.busca)
    }
  },
  watch: {
    modelValue(novoValor) {
      this.busca = novoValor || ''
    }
  }
}
</script>

<style scoped>
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
}
</style>
