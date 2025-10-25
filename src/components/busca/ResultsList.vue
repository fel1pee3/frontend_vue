<template>
  <div>
    <div v-if="produtos.length === 0" style="text-align: center; color: #999;">
      Nenhum produto encontrado
    </div>
    <div v-for="produto in produtos" :key="produto.id" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
      <h4>{{ produto.nome }}</h4>
      <p style="color: #666; font-size: 14px;">{{ produto.descricao }}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold; color: #007bff; font-size: 18px;">R$ {{ produto.preco.toFixed(2) }}</span>
        <span style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-size: 12px;">{{ produto.categoria }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultsList',
  props: {
    produtos: {
      type: Array,
      default: () => []
    }
  }
}
</script>
