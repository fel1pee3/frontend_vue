<template>
  <div style="margin-bottom: 15px;">
    <h4>Categorias</h4>
    <label v-for="categoria in categorias" :key="categoria" style="display: block; margin: 5px 0;">
      <input 
        type="checkbox" 
        :value="categoria" 
        :checked="selecionadas.includes(categoria)"
        @change="atualizar"
      >
      {{ categoria }}
    </label>
  </div>
</template>

<script>
export default {
  name: 'FilterCategory',
  props: {
    modelValue: Array,
    categorias: {
      type: Array,
      default: () => ['Eletrônicos', 'Roupas', 'Livros', 'Esportes']
    }
  },
  data() {
    return {
      selecionadas: this.modelValue || []
    }
  },
  methods: {
    atualizar(event) {
      const value = event.target.value
      if (event.target.checked) {
        this.selecionadas.push(value)
      } else {
        this.selecionadas = this.selecionadas.filter(c => c !== value)
      }
      this.$emit('update:modelValue', this.selecionadas)
    }
  },
  watch: {
    modelValue(novoValor) {
      this.selecionadas = novoValor || []
    }
  }
}
</script>

<style scoped>
input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}
</style>
