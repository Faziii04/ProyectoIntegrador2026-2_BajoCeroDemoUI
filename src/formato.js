const moneda = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
  minimumFractionDigits: 2,
})

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/

export function bolivianos(valor) {
  if (valor === null || valor === undefined) return '—'
  return moneda.format(Number(valor))
}

export function fecha(valor) {
  if (!valor) return '—'
  const texto = SOLO_FECHA.test(valor) ? `${valor}T00:00:00` : valor
  const fechaObj = new Date(texto)
  if (Number.isNaN(fechaObj.getTime())) return String(valor)
  return fechaObj.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function fechaHora(valor) {
  if (!valor) return '—'
  const fechaObj = new Date(valor)
  if (Number.isNaN(fechaObj.getTime())) return String(valor)
  return fechaObj.toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function textoEstado(valor) {
  if (!valor) return '—'
  return String(valor).replaceAll('_', ' ')
}

export function iniciales(nombre) {
  if (!nombre) return '??'
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}
