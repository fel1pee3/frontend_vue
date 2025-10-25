<template>
  <div style="margin-bottom: 15px;">
    <h4>Faixa de Preço</h4>
    <p>R$ {{ precoMin }} - R$ {{ precoMax }}</p>
    <input 
      v-model.number="precoMin" 
      type="range" 
      min="0" 
      :max="precoMaxLimite"
      @input="atualizar"
      style="width: 100%;"
    >
    <input 
      v-model.number="precoMax" 
      type="range" 
      min="0" 
      :max="precoMaxLimite"
      @input="atualizar"
      style="width: 100%;"
    >
  </div>
</template>

<script>
export default {
  name: 'PriceRange',
  props: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 1000 },
    maxLimite: { type: Number, default: 1000 }
  },
  data() {
    return {
      precoMin: this.min,
      precoMax: this.max,
      precoMaxLimite: this.maxLimite
    }
  },
  methods: {
    atualizar() {
      if (this.precoMin > this.precoMax) {
        [this.precoMin, this.precoMax] = [this.precoMax, this.precoMin]
      }
      this.$emit('update-preco', { min: this.precoMin, max: this.precoMax })
    }
  }
}
</script>
