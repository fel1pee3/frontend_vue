export function validarStep1(dados) {
  const erros = {}
  
  if (!dados.nome || !dados.nome.trim()) {
    erros.nome = 'Nome é obrigatório'
  }
  
  if (!dados.email || !dados.email.trim()) {
    erros.email = 'Email é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    erros.email = 'Email inválido'
  }
  
  if (!dados.cpf || !dados.cpf.trim()) {
    erros.cpf = 'CPF é obrigatório'
  } else if (dados.cpf.replace(/\D/g, '').length !== 11) {
    erros.cpf = 'CPF deve ter 11 dígitos'
  }
  
  return erros
}

export function validarStep2(dados) {
  const erros = {}
  
  if (!dados.cep || !dados.cep.trim()) {
    erros.cep = 'CEP é obrigatório'
  }
  
  if (!dados.rua || !dados.rua.trim()) {
    erros.rua = 'Rua é obrigatória'
  }
  
  if (!dados.numero || !dados.numero.toString().trim()) {
    erros.numero = 'Número é obrigatório'
  }
  
  if (!dados.cidade || !dados.cidade.trim()) {
    erros.cidade = 'Cidade é obrigatória'
  }
  
  if (!dados.estado || !dados.estado.trim()) {
    erros.estado = 'Estado é obrigatório'
  }
  
  return erros
}

export function validarStep3(dados) {
  const erros = {}
  
  if (!dados.profissao || !dados.profissao.trim()) {
    erros.profissao = 'Profissão é obrigatória'
  }
  
  if (!dados.empresa || !dados.empresa.trim()) {
    erros.empresa = 'Empresa é obrigatória'
  }
  
  if (!dados.salario || dados.salario <= 0) {
    erros.salario = 'Salário deve ser maior que 0'
  }
  
  return erros
}
