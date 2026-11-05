import { useEffect, useState } from 'react'
import { api } from '../api'
import { fecha } from '../formato'
import { puede } from '../session'
import { Alerta, Boton, Etiqueta, Icono, Stat, Tarjeta, Tabla, Vacio } from '../ui'

const ACCESOS = [
  {
    id: 'clientes',
    titulo: 'Registrar o buscar clientes',
    detalle: 'Altas particulares y empresas, con validación de CI/NIT.',
    icono: 'clientes',
    permiso: 'clientes.leer',
    rf: 'RF28',
  },
  {
    id: 'historial',
    titulo: 'Consultar historial',
    detalle: 'Compras, pedidos, pagos y estados de cada cliente.',
    icono: 'historial',
    permiso: 'clientes.historial.leer',
    rf: 'RF30',
  },
  {
    id: 'empleados',
    titulo: 'Gestionar empleados',
    detalle: 'Altas con roles y desactivación de cuentas.',
    icono: 'empleados',
    permiso: 'empleados.leer',
    rf: 'RF01 · RF03',
  },
  {
    id: 'roles',
    titulo: 'Roles y permisos',
    detalle: 'Qué puede hacer cada rol y desde cuándo.',
    icono: 'roles',
    permiso: 'roles.leer',
    rf: 'RF02',
  },
]

export default function InicioView({ sesion, onNavegar }) {
  const [estado, setEstado] = useState({ cargando: true })
  const [salud, setSalud] = useState({ estado: 'cargando' })

  useEffect(() => {
    let vivo = true

    Promise.allSettled([
      api.clientes({ pagina: 1, tamano: 5 }, sesion),
      api.empleados({ pagina: 1, tamano: 5 }, sesion),
      api.roles(sesion),
      api.permisos(sesion),
      api.salud(),
    ]).then(([clientes, empleados, roles, permisos, saludApi]) => {
      if (!vivo) return

      setEstado({
        cargando: false,
        clientes: clientes.status === 'fulfilled' ? clientes.value : null,
        empleados: empleados.status === 'fulfilled' ? empleados.value : null,
        roles: roles.status === 'fulfilled' ? roles.value : null,
        permisos: permisos.status === 'fulfilled' ? permisos.value : null,
      })
      setSalud(
        saludApi.status === 'fulfilled'
          ? { estado: 'ok', datos: saludApi.value }
          : { estado: 'error' },
      )
    })

    return () => {
      vivo = false
    }
  }, [sesion])

  const accesos = ACCESOS.filter((acceso) => puede(sesion, acceso.permiso))
  const clientes = estado.clientes?.items ?? []
  const empleados = estado.empleados?.items ?? []

  return (
    <div className="pila">
      <div className="pagina">
        <div>
          <h1 className="pagina__titulo">Hola, {sesion.nombre.split(' ')[0]}</h1>
          <p className="pagina__desc">
            Este es el panel del personal. Desde aquí se atienden clientes, se gestionan
            empleados y se controlan los permisos de cada rol.
          </p>
        </div>
        <div className="pagina__acciones">
          {salud.estado === 'cargando' && <Etiqueta tono="neutro">Verificando API…</Etiqueta>}
          {salud.estado === 'ok' && (
            <Etiqueta tono="ok">API conectada · {salud.datos.baseDatos}</Etiqueta>
          )}
          {salud.estado === 'error' && <Etiqueta tono="mal">API sin conexión</Etiqueta>}
        </div>
      </div>

      <div className="rejilla rejilla--4">
        <Stat
          etiqueta="Clientes"
          valor={estado.clientes ? estado.clientes.paginacion.total : '—'}
          detalle="registrados en el sistema"
        />
        <Stat
          etiqueta="Empleados"
          valor={estado.empleados ? estado.empleados.paginacion.total : '—'}
          detalle="cuentas de personal"
        />
        <Stat etiqueta="Roles" valor={estado.roles ? estado.roles.length : '—'} detalle="activos e inactivos" />
        <Stat
          etiqueta="Permisos"
          valor={estado.permisos ? estado.permisos.length : '—'}
          detalle="en el catálogo"
        />
      </div>

      <div className="rejilla rejilla--2">
        <Tarjeta titulo="Accesos rápidos" descripcion="Las tareas que más va a usar el personal.">
          <div className="pila pila--chica">
            {accesos.map((acceso) => (
              <button
                key={acceso.id}
                type="button"
                className="rol-item"
                onClick={() => onNavegar(acceso.id)}
              >
                <span className="fila">
                  <Icono nombre={acceso.icono} tamano={18} />
                  <span>
                    <span className="rol-item__nombre">{acceso.titulo}</span>
                    <span className="rol-item__detalle">{acceso.detalle}</span>
                  </span>
                </span>
                <span className="fila">
                  <span className="nav__rf">{acceso.rf}</span>
                  <Icono nombre="chevron" tamano={16} />
                </span>
              </button>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta titulo="Tu sesión" descripcion="Sin tokens: la UI envía el id en un header.">
          <div className="pila pila--chica">
            <div className="dato">
              <span className="dato__etiqueta">Usuario</span>
              <span className="dato__valor mono">{sesion.usuario}</span>
            </div>
            <div className="dato">
              <span className="dato__etiqueta">Roles</span>
              <span className="dato__valor">
                {sesion.roles.length > 0
                  ? sesion.roles.map((rol) => (
                      <Etiqueta key={rol} tono="info">
                        {rol}
                      </Etiqueta>
                    ))
                  : 'Sin roles vigentes'}
              </span>
            </div>
            <div className="dato">
              <span className="dato__etiqueta">Header enviado</span>
              <span className="dato__valor mono">X-Empleado-Id: {sesion.id}</span>
            </div>
            <div className="dato">
              <span className="dato__etiqueta">Permisos</span>
              <span className="dato__valor texto-pequeno">{sesion.permisos.join(', ') || '—'}</span>
            </div>
          </div>
        </Tarjeta>
      </div>

      <Tarjeta
        titulo="Últimos clientes"
        descripcion="Altas recientes (primeros 5 registros)."
        acciones={
          puede(sesion, 'clientes.leer') && (
            <Boton variante="secundario" onClick={() => onNavegar('clientes')}>
              Ver todos
            </Boton>
          )
        }
      >
        {estado.cargando ? (
          <p className="texto-suave texto-pequeno">Cargando…</p>
        ) : clientes.length === 0 ? (
          <Vacio titulo="Todavía no hay clientes" detalle="Registra el primero desde la pestaña Clientes." />
        ) : (
          <Tabla columnas={['Cliente', 'Tipo', 'Identificación', 'Contacto', 'Registrado']}>
            {clientes.map((cliente) => (
              <tr key={cliente.clienteId}>
                <td>
                  <div className="celda-principal">{cliente.razonSocial}</div>
                  <div className="celda-suave">{cliente.nombreUsuario ?? 'sin cuenta'}</div>
                </td>
                <td>
                  <Etiqueta tono={cliente.tipo === 'empresa' ? 'info' : 'neutro'}>{cliente.tipo}</Etiqueta>
                </td>
                <td className="mono">{cliente.ci ?? cliente.nit ?? '—'}</td>
                <td className="celda-suave">{cliente.correo ?? cliente.telefono ?? '—'}</td>
                <td className="celda-suave">{fecha(cliente.fechaRegistro)}</td>
              </tr>
            ))}
          </Tabla>
        )}
      </Tarjeta>

      <Tarjeta titulo="Equipo" descripcion="Empleados con su estado actual.">
        {estado.cargando ? (
          <p className="texto-suave texto-pequeno">Cargando…</p>
        ) : empleados.length === 0 ? (
          <Alerta tono="info">Tu rol no permite ver empleados o todavía no hay registros.</Alerta>
        ) : (
          <Tabla columnas={['Empleado', 'Usuario', 'Roles vigentes', 'Estado']}>
            {empleados.map((empleado) => (
              <tr key={empleado.empleadoId}>
                <td>
                  <div className="celda-principal">
                    {empleado.nombres} {empleado.apellidos}
                  </div>
                  <div className="celda-suave mono">{empleado.ci}</div>
                </td>
                <td className="mono">{empleado.nombreUsuario}</td>
                <td>
                  {empleado.rolesVigentes.length > 0
                    ? empleado.rolesVigentes.map((rol) => (
                        <Etiqueta key={rol} tono="info">
                          {rol}
                        </Etiqueta>
                      ))
                    : '—'}
                </td>
                <td>
                  <Etiqueta tono={empleado.estado === 'activo' ? 'ok' : 'off'}>
                    {empleado.estado}
                  </Etiqueta>
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Tarjeta>
    </div>
  )
}
