// Mesma regra do backend (compartilhado/validacao/CnpjValidador.java): CNPJ numérico ou alfanumérico
// da Receita Federal — 12 caracteres [0-9A-Z] + 2 dígitos verificadores, módulo 11, valor = ASCII − 48.

const P1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const P2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

export const normalizarCnpj = (v: string) => v.replace(/[.\-/\s]/g, '').toUpperCase()

function dv(valor: string, pesos: number[]) {
  const soma = pesos.reduce((acc, p, i) => acc + (valor.charCodeAt(i) - 48) * p, 0)
  const r = soma % 11
  return r < 2 ? 0 : 11 - r
}

export function cnpjValido(v: string) {
  const c = normalizarCnpj(v)
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c)) return false
  if (new Set(c).size === 1) return false
  return dv(c, P1) === Number(c[12]) && dv(c, P2) === Number(c[13])
}

/** Máscara 00.000.000/0000-00 (aceita letras nas 12 primeiras posições). */
export function maskCnpj(v: string) {
  const d = normalizarCnpj(v).replace(/[^0-9A-Z]/g, '').slice(0, 14)
  return d
    .replace(/^(\w{2})(\w)/, '$1.$2')
    .replace(/^(\w{2})\.(\w{3})(\w)/, '$1.$2.$3')
    .replace(/\.(\w{3})(\w)/, '.$1/$2')
    .replace(/(\w{4})(\w)/, '$1-$2')
}
