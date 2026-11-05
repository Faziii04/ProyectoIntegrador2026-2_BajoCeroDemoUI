const BASE = import.meta.env.VITE_API_URL ?? ''

export class ErrorApi extends Error {
  constructor(mensaje, estado, codigo, cuerpo) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
    this.codigo = codigo
    this.cuerpo = cuerpo
  }
}

function query(params) {
  const limpios = Object.entries(params ?? {}).filter(
    ([, valor]) => valor !== undefined && valor !== null && valor !== '',
  )
  if (limpios.length === 0) return ''
  return `?${new URLSearchParams(limpios).toString()}`
}

const enVuelo = new Map()

function pedir(metodo, ruta, opciones = {}) {
  if (metodo !== 'GET') {
    return ejecutarPedido(metodo, ruta, opciones)
  }

  const clave = `${ruta}|${opciones.sesion?.tipo ?? ''}|${opciones.sesion?.id ?? ''}`
  const existente = enVuelo.get(clave)
  if (existente) return existente

  const promesa = ejecutarPedido(metodo, ruta, opciones).finally(() => enVuelo.delete(clave))
  enVuelo.set(clave, promesa)
  return promesa
}

async function ejecutarPedido(metodo, ruta, { cuerpo, sesion } = {}) {
  const cabeceras = {}

  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (sesion?.tipo === 'empleado') cabeceras['X-Empleado-Id'] = String(sesion.id)
  if (sesion?.tipo === 'cliente') cabeceras['X-Cliente-Id'] = String(sesion.id)

  let respuesta
  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorApi(
      'No se pudo conectar con la API. Verifica que el servidor esté corriendo en http://localhost:5130.',
      0,
      'sin_conexion',
    )
  }

  const texto = await respuesta.text()
  let datos = null

  if (texto) {
    try {
      datos = JSON.parse(texto)
    } catch {
      datos = { detail: texto }
    }
  }

  if (!respuesta.ok) {
    throw new ErrorApi(
      datos?.detail || datos?.title || `Error ${respuesta.status}`,
      respuesta.status,
      datos?.code,
      datos,
    )
  }

  return datos
}

export const api = {
  salud: () => pedir('GET', '/api/salud'),

  login: (usuario, contrasena, tipo) =>
    pedir('POST', '/api/auth/login', { cuerpo: { usuario, contrasena, tipo } }),
  contexto: (sesion) => pedir('GET', '/api/auth/contexto', { sesion }),

  permisos: (sesion) => pedir('GET', '/api/permisos', { sesion }),
  roles: (sesion) => pedir('GET', '/api/roles', { sesion }),
  rol: (id, sesion) => pedir('GET', `/api/roles/${id}`, { sesion }),
  crearRol: (cuerpo, sesion) => pedir('POST', '/api/roles', { cuerpo, sesion }),
  actualizarRol: (id, cuerpo, sesion) => pedir('PUT', `/api/roles/${id}`, { cuerpo, sesion }),
  actualizarPermisosRol: (id, permisos, sesion) =>
    pedir('PUT', `/api/roles/${id}/permisos`, { cuerpo: { permisos }, sesion }),

  empleados: (params, sesion) => pedir('GET', `/api/empleados${query(params)}`, { sesion }),
  empleado: (id, sesion) => pedir('GET', `/api/empleados/${id}`, { sesion }),
  crearEmpleado: (cuerpo, sesion) => pedir('POST', '/api/empleados', { cuerpo, sesion }),
  desactivarEmpleado: (id, motivo, sesion) =>
    pedir('POST', `/api/empleados/${id}/desactivar`, { cuerpo: { motivo }, sesion }),
  reactivarEmpleado: (id, sesion) => pedir('POST', `/api/empleados/${id}/reactivar`, { sesion }),
  rolesEmpleado: (id, sesion) => pedir('GET', `/api/empleados/${id}/roles`, { sesion }),
  asignarRol: (id, cuerpo, sesion) => pedir('POST', `/api/empleados/${id}/roles`, { cuerpo, sesion }),
  cerrarRol: (id, rolId, fechaFin, sesion) =>
    pedir('PUT', `/api/empleados/${id}/roles/${rolId}`, { cuerpo: { fechaFin }, sesion }),

  clientes: (params, sesion) => pedir('GET', `/api/clientes${query(params)}`, { sesion }),
  cliente: (id, sesion) => pedir('GET', `/api/clientes/${id}`, { sesion }),
  crearCliente: (cuerpo, sesion) => pedir('POST', '/api/clientes', { cuerpo, sesion }),
  autorregistro: (cuerpo) => pedir('POST', '/api/clientes/autorregistro', { cuerpo }),

  historial: (id, sesion) => pedir('GET', `/api/clientes/${id}/historial`, { sesion }),
  historialCompras: (id, params, sesion) =>
    pedir('GET', `/api/clientes/${id}/historial/compras${query(params)}`, { sesion }),
  historialPedidos: (id, params, sesion) =>
    pedir('GET', `/api/clientes/${id}/historial/pedidos${query(params)}`, { sesion }),

  miHistorial: (sesion) => pedir('GET', '/api/clientes/yo/historial', { sesion }),
  misCompras: (params, sesion) =>
    pedir('GET', `/api/clientes/yo/historial/compras${query(params)}`, { sesion }),
  misPedidos: (params, sesion) =>
    pedir('GET', `/api/clientes/yo/historial/pedidos${query(params)}`, { sesion }),

  setupEstado: () => pedir('GET', '/api/setup/estado'),
}
