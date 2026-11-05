const CLAVE = 'bajocero.sesion'

export function leerSesion() {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? JSON.parse(crudo) : null
  } catch {
    return null
  }
}

export function guardarSesion(sesion) {
  localStorage.setItem(CLAVE, JSON.stringify(sesion))
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE)
}

export function crearSesionDesdeLogin(datos) {
  const esEmpleado = datos.tipo === 'empleado'
  return {
    tipo: datos.tipo,
    id: esEmpleado ? datos.empleado?.empleadoId : datos.cliente?.clienteId,
    cuentaId: datos.cuentaId,
    usuario: datos.usuario,
    nombre: datos.nombre,
    estado: datos.estado,
    roles: datos.roles ?? [],
    permisos: datos.permisos ?? [],
    perfil: esEmpleado ? datos.empleado : datos.cliente,
  }
}

export function puede(sesion, permiso) {
  if (!permiso) return true
  return (sesion?.permisos ?? []).includes(permiso)
}
