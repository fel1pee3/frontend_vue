<template>
  <div style="margin-bottom: 15px;">
    <h4>Ordenar por</h4>
    <select v-model="ordenacao" @change="atualizar" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      <option value="">Padrão</option>
      <option value="preco-asc">Preço (menor)</option>
      <option value="preco-desc">Preço (maior)</option>
      <option value="nome-asc">Nome (A-Z)</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SortOptions',
  props: {
    modelValue: String
  },
  data() {
    return {
      ordenacao: this.modelValue || ''
    }
  },
  methods: {
    atualizar() {
      this.$emit('update:modelValue', this.ordenacao)
    }
  },
  watch: {
    modelValue(novoValor) {
      this.ordenacao = novoValor || ''
    }
  }
}
</script>
