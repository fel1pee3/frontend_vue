<template>
  <div>
    <h2>Aula 6 - CRUD com Auditoria</h2>
    <p>Bem-vindo ao sistema de gerenciamento de produtos com auditoria completa.</p>
    
    <div class="row mt-4">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body text-center">
            <h5>📦 Produtos</h5>
            <p class="text-muted">Gerencie o catálogo de produtos</p>
            <router-link to="/produtos" class="btn btn-primary">Ir para Produtos</router-link>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card">
          <div class="card-body text-center">
            <h5>📋 Auditoria</h5>
            <p class="text-muted">Visualize histórico de alterações</p>
            <router-link to="/auditoria" class="btn btn-primary">Ver Auditoria</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-body text-center">
            <h5>✨ Exercícios</h5>
            <p class="text-muted">Implementados os 3 exercícios</p>
            <p style="font-size: 12px; margin-top: 15px;">
              ✓ Bulk Operations<br>
              ✓ Filtros Avançados<br>
              ✓ Histórico de Auditoria
            </p>
          </div>
        </div>
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
.row {
  margin: 0 -15px;
}

.col-md-4 {
  padding: 0 15px;
}

.btn {
  text-decoration: none;
  display: inline-block;
}
</style>
