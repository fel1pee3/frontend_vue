<template>
  <div style="background: #e9ecef; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span v-for="i in 4" :key="i" style="text-align: center; flex: 1;">
        <div :style="{ 
          width: '40px', 
          height: '40px', 
          margin: '0 auto 5px', 
          background: i <= etapaAtual ? '#007bff' : '#ddd', 
          color: 'white', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer'
        }" @click="$emit('ir-etapa', i)">
          {{ i }}
        </div>
        <small>{{ nomesEtapas[i - 1] }}</small>
      </span>
    </div>
    <div style="width: 100%; height: 4px; background: #ddd; border-radius: 2px; margin-top: 15px;">
      <div :style="{ width: ((etapaAtual - 1) * 33.33) + '%', height: '100%', background: '#007bff', transition: 'width 0.3s' }"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepIndicator',
  props: {
    etapaAtual: Number
  },
  data() {
    return {
      nomesEtapas: ['Pessoal', 'Endereço', 'Profissional', 'Revisão']
    }
  }
}
</script>
