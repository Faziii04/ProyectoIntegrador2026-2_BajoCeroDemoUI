import { useEffect, useState } from 'react'
import { api } from '../api'
import { puede } from '../session'
import {
  Alerta,
  Boton,
  Campo,
  Cargando,
  Entrada,
  Etiqueta,
  Icono,
  Modal,
  Tarjeta,
  Vacio,
} from '../ui'

const NOMBRES_GRUPO = {
  clientes: 'Clientes',
  empleados: 'Empleados',
  roles: 'Roles y permisos',
}

function agruparPermisos(permisos) {
  return permisos.reduce((grupos, permiso) => {
    const clave = permiso.codigo.split('.')[0] ?? 'otros'
    if (!grupos[clave]) grupos[clave] = []
    grupos[clave].push(permiso)
    return grupos
  }, {})
}

export default function RolesView({ sesion }) {
  const [estado, setEstado] = useState({ cargando: true, roles: [], permisos: [], error: null })
  const [seleccionado, setSeleccionado] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [editados, setEditados] = useState([])
  const [refresco, setRefresco] = useState(0)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [nuevoAbierto, setNuevoAbierto] = useState(false)

  useEffect(() => {
    let vivo = true

    Promise.all([api.roles(sesion), api.permisos(sesion)])
      .then(([roles, permisos]) => {
        if (!vivo) return
        setEstado({ cargando: false, roles, permisos, error: null })
        setSeleccionado((actual) => actual ?? roles[0]?.rolId ?? null)
      })
      .catch((fallo) => {
        if (vivo) setEstado({ cargando: false, roles: [], permisos: [], error: fallo.message })
      })

    return () => {
      vivo = false
    }
  }, [sesion, refresco])

  useEffect(() => {
    if (!seleccionado) return

    let vivo = true
    setDetalle(null)

    api
      .rol(seleccionado, sesion)
      .then((rol) => {
        if (!vivo) return
        setDetalle(rol)
        setEditados(rol.permisos)
      })
      .catch((fallo) => {
        if (vivo) setErrorAccion(fallo.message)
      })

    return () => {
      vivo = false
    }
  }, [seleccionado, sesion, refresco])

  function alternar(codigo) {
    setEditados((actual) =>
      actual.includes(codigo) ? actual.filter((item) => item !== codigo) : [...actual, codigo],
    )
  }

  async function guardar() {
    if (!detalle) return
    setGuardando(true)
    setMensaje('')
    setErrorAccion('')

    try {
      await api.actualizarPermisosRol(detalle.rolId, editados, sesion)
      setMensaje(`Permisos de "${detalle.nombre}" actualizados.`)
      setRefresco((valor) => valor + 1)
    } catch (fallo) {
      setErrorAccion(fallo.message)
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado() {
    if (!detalle) return
    setGuardando(true)
    setMensaje('')
    setErrorAccion('')

    try {
      const nuevoEstado = detalle.estado === 'activo' ? 'inactivo' : 'activo'
      await api.actualizarRol(detalle.rolId, { estado: nuevoEstado }, sesion)
      setMensaje(`Rol "${detalle.nombre}" ahora está ${nuevoEstado}.`)
      setRefresco((valor) => valor + 1)
    } catch (fallo) {
      setErrorAccion(fallo.message)
    } finally {
      setGuardando(false)
    }
  }

  if (estado.cargando) return <Cargando texto="Cargando roles y permisos…" />
  if (estado.error) return <Alerta tono="error">{estado.error}</Alerta>

  const esAdministrador = detalle?.nombre === 'administrador'
  const puedeEditar = puede(sesion, 'roles.actualizar') && !esAdministrador
  const hayCambios =
    detalle &&
    (editados.length !== detalle.permisos.length ||
      editados.some((codigo) => !detalle.permisos.includes(codigo)))

  const grupos = agruparPermisos(estado.permisos)

  return (
    <div className="pila">
      <div className="pagina">
        <div>
          <h1 className="pagina__titulo">Roles y permisos</h1>
          <p className="pagina__desc">
            Cada rol agrupa permisos. Las asignaciones a empleados tienen fechas de vigencia y
            conservan su historial.
          </p>
        </div>
        <div className="pagina__acciones">
          {puede(sesion, 'roles.crear') && (
            <Boton variante="primario" onClick={() => setNuevoAbierto(true)}>
              <Icono nombre="mas" tamano={16} />
              Crear rol
            </Boton>
          )}
        </div>
      </div>

      {(mensaje || errorAccion) && (
        <Alerta tono={errorAccion ? 'error' : 'exito'}>{errorAccion || mensaje}</Alerta>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) minmax(0, 1fr)', gap: 16 }}>
        <Tarjeta titulo="Roles" descripcion={`${estado.roles.length} en total`}>
          <div className="lista-roles">
            {estado.roles.map((rol) => (
              <button
                key={rol.rolId}
                type="button"
                className={`rol-item ${seleccionado === rol.rolId ? 'rol-item--activo' : ''}`}
                onClick={() => setSeleccionado(rol.rolId)}
              >
                <span>
                  <span className="rol-item__nombre">{rol.nombre}</span>
                  <span className="rol-item__detalle">
                    {rol.cantidadPermisos} permisos · {rol.empleadosVigentes} empleados
                  </span>
                </span>
                <Etiqueta tono={rol.estado === 'activo' ? 'ok' : 'off'}>{rol.estado}</Etiqueta>
              </button>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta
          titulo={detalle ? detalle.nombre : 'Detalle'}
          descripcion={detalle?.descripcion}
          acciones={
            detalle && (
              <>
                {puede(sesion, 'roles.actualizar') && !esAdministrador && (
                  <Boton variante="secundario" onClick={cambiarEstado} disabled={guardando}>
                    {detalle.estado === 'activo' ? 'Desactivar rol' : 'Activar rol'}
                  </Boton>
                )}
                <Boton
                  variante="primario"
                  onClick={guardar}
                  disabled={!hayCambios || !puedeEditar || guardando}
                  cargando={guardando}
                >
                  Guardar permisos
                </Boton>
              </>
            )
          }
        >
          {!detalle ? (
            <Cargando texto="Cargando rol…" />
          ) : (
            <>
              {esAdministrador && (
                <div style={{ marginBottom: 12 }}>
                  <Alerta tono="info">
                    El rol <strong>administrador</strong> conserva todos los permisos para no
                    bloquear el sistema.
                  </Alerta>
                </div>
              )}

              {Object.entries(grupos).map(([grupo, permisos]) => (
                <div className="grupo-permisos" key={grupo}>
                  <div className="grupo-permisos__titulo">{NOMBRES_GRUPO[grupo] ?? grupo}</div>
                  <div className="lista-permisos">
                    {permisos.map((permiso) => (
                      <label className="casilla" key={permiso.permisoId}>
                        <input
                          type="checkbox"
                          checked={editados.includes(permiso.codigo)}
                          onChange={() => alternar(permiso.codigo)}
                          disabled={!puedeEditar}
                        />
                        <span>
                          {permiso.codigo}
                          <span className="casilla__detalle">{permiso.descripcion}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </Tarjeta>
      </div>

      <NuevoRolModal
        abierto={nuevoAbierto}
        sesion={sesion}
        permisos={estado.permisos}
        onCerrar={() => setNuevoAbierto(false)}
        onCreado={(rol) => {
          setNuevoAbierto(false)
          setMensaje(`Rol "${rol.nombre}" creado.`)
          setSeleccionado(rol.rolId)
          setRefresco((valor) => valor + 1)
        }}
      />
    </div>
  )
}

function NuevoRolModal({ abierto, sesion, permisos, onCerrar, onCreado }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [seleccionados, setSeleccionados] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!abierto) return
    setNombre('')
    setDescripcion('')
    setSeleccionados([])
    setError('')
  }, [abierto])

  const grupos = agruparPermisos(permisos)

  function alternar(codigo) {
    setSeleccionados((actual) =>
      actual.includes(codigo) ? actual.filter((item) => item !== codigo) : [...actual, codigo],
    )
  }

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setCargando(true)

    try {
      const rol = await api.crearRol(
        { nombre: nombre.trim(), descripcion: descripcion.trim(), permisos: seleccionados },
        sesion,
      )
      onCreado(rol)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal
      abierto={abierto}
      titulo="Crear rol"
      descripcion="El nombre se guarda en minúsculas y debe ser único."
      onCerrar={onCerrar}
      ancho="lg"
      pie={
        <>
          <Boton variante="fantasma" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton variante="primario" tipo="submit" form="form-rol" cargando={cargando}>
            Crear rol
          </Boton>
        </>
      }
    >
      <form id="form-rol" onSubmit={enviar}>
        {error && (
          <div style={{ marginBottom: 12 }}>
            <Alerta tono="error">{error}</Alerta>
          </div>
        )}

        <div className="form-grid">
          <Campo etiqueta="Nombre" requerido ayuda="Minúsculas, números, punto, guion o guion bajo.">
            <Entrada
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              placeholder="supervisor"
              required
              minLength={3}
              maxLength={60}
            />
          </Campo>
          <Campo etiqueta="Descripción" requerido>
            <Entrada
              value={descripcion}
              onChange={(evento) => setDescripcion(evento.target.value)}
              placeholder="Supervisa la atención de clientes"
              required
              maxLength={500}
            />
          </Campo>
        </div>

        <div style={{ marginTop: 14 }}>
          {Object.entries(grupos).map(([grupo, items]) => (
            <div className="grupo-permisos" key={grupo}>
              <div className="grupo-permisos__titulo">{NOMBRES_GRUPO[grupo] ?? grupo}</div>
              <div className="lista-permisos">
                {items.map((permiso) => (
                  <label className="casilla" key={permiso.permisoId}>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(permiso.codigo)}
                      onChange={() => alternar(permiso.codigo)}
                    />
                    <span>
                      {permiso.codigo}
                      <span className="casilla__detalle">{permiso.descripcion}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </form>
    </Modal>
  )
}
