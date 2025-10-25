<template>
  <div>
    <h2>Aula 05 - Formulários e Validação em Vue.js</h2>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin-top: 20px;">
      <h3>Exercícios Disponíveis</h3>
      
      <div style="margin: 20px 0;">
        <h4>Exercício 1: Cadastro Multi-Componente</h4>
        <p>Formulário dividido em 4 componentes com barra de progresso e validação por etapa.</p>
        <router-link to="/cadastro" style="background: #007bff; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Ir para Cadastro</router-link>
      </div>

      <div style="margin: 20px 0;">
        <h4>Exercício 2: Busca e Filtros Dinâmicos</h4>
        <p>Sistema de filtros em tempo real com busca, categorias, preço e ordenação.</p>
        <router-link to="/pesquisa" style="background: #28a745; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Ir para Pesquisa</router-link>
      </div>

      <div style="margin: 20px 0;">
        <h4>Exercício 3: Wizard Multi-Etapas</h4>
        <p>Formulário em 4 etapas com indicador de progresso, validação por etapa e revisão final.</p>
        <router-link to="/wizard" style="background: #ffc107; color: #333; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Ir para Wizard</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
h4 {
  margin-top: 0;
  color: #333;
}

ul {
  list-style: none;
  padding-left: 0;
}

li {
  padding: 8px 0;
  padding-left: 25px;
  position: relative;
}

li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #28a745;
  font-weight: bold;
}
</style>
