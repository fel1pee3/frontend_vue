<template>
  <div>
    <h3>Etapa 4: Revisão dos Dados</h3>
    <div style="background: #f8f9fa; padding: 15px; border-radius: 4px;">
      <div style="margin-bottom: 15px;">
        <strong>Dados Pessoais</strong>
        <p style="margin: 5px 0;">Nome: {{ dados.pessoais.nome }}</p>
        <p style="margin: 5px 0;">Email: {{ dados.pessoais.email }}</p>
        <p style="margin: 5px 0;">CPF: {{ dados.pessoais.cpf }}</p>
      </div>

      <div style="margin-bottom: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
        <strong>Endereço</strong>
        <p style="margin: 5px 0;">CEP: {{ dados.endereco.cep }}</p>
        <p style="margin: 5px 0;">Rua: {{ dados.endereco.rua }}, {{ dados.endereco.numero }}</p>
        <p style="margin: 5px 0;">Cidade: {{ dados.endereco.cidade }}, {{ dados.endereco.estado }}</p>
      </div>

      <div style="border-top: 1px solid #ddd; padding-top: 15px;">
        <strong>Dados Profissionais</strong>
        <p style="margin: 5px 0;">Profissão: {{ dados.profissao.profissao }}</p>
        <p style="margin: 5px 0;">Empresa: {{ dados.profissao.empresa }}</p>
        <p style="margin: 5px 0;">Salário: R$ {{ dados.profissao.salario.toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Step4Review',
  props: {
    dados: Object
  }
}
</script>
