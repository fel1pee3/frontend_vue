<template>
  <div>
    <h3>Endereço</h3>
    <div>
      <input v-model="dados.cep" placeholder="CEP" @blur="$emit('validar', 'cep')" :style="erros.cep ? 'border-color: red' : ''">
      <p v-if="erros.cep" style="color: red; font-size: 12px;">{{ erros.cep }}</p>
    </div>
    <div>
      <input v-model="dados.rua" placeholder="Rua" @blur="$emit('validar', 'rua')" :style="erros.rua ? 'border-color: red' : ''">
      <p v-if="erros.rua" style="color: red; font-size: 12px;">{{ erros.rua }}</p>
    </div>
    <div>
      <input v-model="dados.numero" placeholder="Número" @blur="$emit('validar', 'numero')" :style="erros.numero ? 'border-color: red' : ''">
      <p v-if="erros.numero" style="color: red; font-size: 12px;">{{ erros.numero }}</p>
    </div>
    <div>
      <input v-model="dados.cidade" placeholder="Cidade" @blur="$emit('validar', 'cidade')" :style="erros.cidade ? 'border-color: red' : ''">
      <p v-if="erros.cidade" style="color: red; font-size: 12px;">{{ erros.cidade }}</p>
    </div>
    <div>
      <input v-model="dados.estado" placeholder="Estado (UF)" @blur="$emit('validar', 'estado')" :style="erros.estado ? 'border-color: red' : ''">
      <p v-if="erros.estado" style="color: red; font-size: 12px;">{{ erros.estado }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnderecoForm',
  props: {
    modelValue: {
      type: Object,
      default: () => ({ cep: '', rua: '', numero: '', cidade: '', estado: '' })
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
