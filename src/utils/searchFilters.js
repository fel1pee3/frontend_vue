export function filtrarPorCategoria(produtos, categorias) {
  if (categorias.length === 0) return produtos
  return produtos.filter(p => categorias.includes(p.categoria))
}

export function filtrarPorPreco(produtos, min, max) {
  return produtos.filter(p => p.preco >= min && p.preco <= max)
}

export function buscarPorTexto(produtos, texto) {
  if (!texto.trim()) return produtos
  return produtos.filter(p => 
    p.nome.toLowerCase().includes(texto.toLowerCase()) ||
    p.descricao.toLowerCase().includes(texto.toLowerCase())
  )
}

export function ordenar(produtos, opcao) {
  const copia = [...produtos]
  
  if (opcao === 'preco-asc') {
    return copia.sort((a, b) => a.preco - b.preco)
  } else if (opcao === 'preco-desc') {
    return copia.sort((a, b) => b.preco - a.preco)
  } else if (opcao === 'nome-asc') {
    return copia.sort((a, b) => a.nome.localeCompare(b.nome))
  }
  
  return copia
}

export function aplicarFiltros(produtos, filtros) {
  let resultado = produtos
  
  resultado = buscarPorTexto(resultado, filtros.texto)
  resultado = filtrarPorCategoria(resultado, filtros.categorias)
  resultado = filtrarPorPreco(resultado, filtros.precoMin, filtros.precoMax)
  resultado = ordenar(resultado, filtros.ordenacao)
  
  return resultado
}
