import { useEffect, useState } from 'react'
import { api } from '../api'
import { fecha } from '../formato'
import { puede } from '../session'
import {
  Alerta,
  Boton,
  Campo,
  Cargando,
  Dato,
  Entrada,
  Estado,
  Etiqueta,
  Icono,
  Modal,
  Seleccion,
  Tabla,
  Tarjeta,
  Vacio,
} from '../ui'

const hoy = () => new Date().toISOString().slice(0, 10)

const NUEVO_INICIAL = {
  nombreUsuario: '',
  contrasena: '',
  nombres: '',
  apellidos: '',
  ci: '',
  telefono: '',
  correo: '',
  ingresoFecha: hoy(),
}

export default function EmpleadosView({ sesion }) {
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [refresco, setRefresco] = useState(0)
  const [listado, setListado] = useState({ cargando: true, items: [], paginacion: null, error: null })
  const [nuevoAbierto, setNuevoAbierto] = useState(false)
  const [detalleId, setDetalleId] = useState(null)
  const [aDesactivar, setADesactivar] = useState(null)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let vivo = true
    setListado((actual) => ({ ...actual, cargando: true, error: null }))

    api
      .empleados({ texto: busqueda, estado: estadoFiltro, pagina, tamano: 10 }, sesion)
      .then((datos) => {
        if (vivo) {
          setListado({ cargando: false, items: datos.items, paginacion: datos.paginacion, error: null })
        }
      })
      .catch((fallo) => {
        if (vivo) setListado({ cargando: false, items: [], paginacion: null, error: fallo.message })
      })

    return () => {
      vivo = false
    }
  }, [sesion, busqueda, estadoFiltro, pagina, refresco])

  function recargar(mensaje) {
    if (mensaje) setAviso(mensaje)
    setRefresco((valor) => valor + 1)
  }

  async function reactivar(empleado) {
    try {
      await api.reactivarEmpleado(empleado.empleadoId, sesion)
      recargar(`${empleado.nombres} fue reactivado. Asigna sus roles de nuevo.`)
    } catch (fallo) {
      setAviso(fallo.message)
    }
  }

  return (
    <div className="pila">
      <div className="pagina">
        <div>
          <h1 className="pagina__titulo">Empleados</h1>
          <p className="pagina__desc">
            Altas de personal con sus roles y desactivación de cuentas. Al desactivar, el acceso
            se corta de inmediato y el historial se conserva.
          </p>
        </div>
        <div className="pagina__acciones">
          {puede(sesion, 'empleados.crear') && (
            <Boton variante="primario" onClick={() => setNuevoAbierto(true)}>
              <Icono nombre="mas" tamano={16} />
              Registrar empleado
            </Boton>
          )}
        </div>
      </div>

      {aviso && <Alerta tono="info">{aviso}</Alerta>}

      <Tarjeta>
        <form
          className="fila fila--wrap"
          style={{ marginBottom: 14 }}
          onSubmit={(evento) => {
            evento.preventDefault()
            setPagina(1)
            setBusqueda(texto.trim())
          }}
        >
          <Entrada
            placeholder="Buscar por nombre, CI o usuario…"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            style={{ maxWidth: 320 }}
          />
          <Boton tipo="submit" variante="secundario">
            <Icono nombre="buscar" tamano={15} />
            Buscar
          </Boton>
          <Seleccion
            value={estadoFiltro}
            onChange={(evento) => {
              setEstadoFiltro(evento.target.value)
              setPagina(1)
            }}
            style={{ maxWidth: 150 }}
          >
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </Seleccion>
        </form>

        {listado.error && <Alerta tono="error">{listado.error}</Alerta>}

        {listado.cargando ? (
          <Cargando texto="Cargando empleados…" />
        ) : listado.items.length === 0 ? (
          <Vacio titulo="Sin empleados" detalle="Registra el primero con el botón de arriba." />
        ) : (
          <>
            <Tabla columnas={['Empleado', 'Usuario', 'Roles vigentes', 'Estado', 'Ingreso', '']}>
              {listado.items.map((empleado) => (
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
                      : <span className="texto-suave texto-pequeno">sin rol vigente</span>}
                  </td>
                  <td>
                    <Estado valor={empleado.estado} />
                  </td>
                  <td className="celda-suave">{fecha(empleado.ingresoFecha)}</td>
                  <td className="texto-right">
                    <div className="fila" style={{ justifyContent: 'flex-end' }}>
                      <Boton
                        variante="secundario"
                        className="boton--chico"
                        onClick={() => setDetalleId(empleado.empleadoId)}
                      >
                        Ver
                      </Boton>
                      {puede(sesion, 'empleados.desactivar') &&
                        (empleado.estado === 'activo' ? (
                          <Boton
                            variante="peligro"
                            className="boton--chico"
                            onClick={() => setADesactivar(empleado)}
                          >
                            Desactivar
                          </Boton>
                        ) : (
                          <Boton
                            variante="exito"
                            className="boton--chico"
                            onClick={() => reactivar(empleado)}
                          >
                            Reactivar
                          </Boton>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </Tabla>

            {listado.paginacion && (
              <div className="fila fila--entre" style={{ padding: '12px 14px' }}>
                <span className="texto-pequeno texto-suave">
                  {listado.paginacion.total} empleados · página {listado.paginacion.pagina} de{' '}
                  {Math.max(listado.paginacion.totalPaginas, 1)}
                </span>
                <div className="fila">
                  <Boton
                    variante="secundario"
                    className="boton--chico"
                    disabled={pagina <= 1}
                    onClick={() => setPagina((valor) => Math.max(1, valor - 1))}
                  >
                    Anterior
                  </Boton>
                  <Boton
                    variante="secundario"
                    className="boton--chico"
                    disabled={pagina >= listado.paginacion.totalPaginas}
                    onClick={() => setPagina((valor) => valor + 1)}
                  >
                    Siguiente
                  </Boton>
                </div>
              </div>
            )}
          </>
        )}
      </Tarjeta>

      <NuevoEmpleadoModal
        abierto={nuevoAbierto}
        sesion={sesion}
        onCerrar={() => setNuevoAbierto(false)}
        onCreado={(empleado) => {
          setNuevoAbierto(false)
          recargar(`Empleado ${empleado.nombres} ${empleado.apellidos} registrado.`)
          setDetalleId(empleado.empleadoId)
        }}
      />

      <DesactivarEmpleadoModal
        empleado={aDesactivar}
        sesion={sesion}
        onCerrar={() => setADesactivar(null)}
        onDesactivado={(mensaje) => {
          setADesactivar(null)
          setDetalleId(null)
          recargar(mensaje)
        }}
      />

      {detalleId && (
        <DetalleEmpleadoModal
          empleadoId={detalleId}
          sesion={sesion}
          onCerrar={() => setDetalleId(null)}
          onCambio={recargar}
          onDesactivar={(empleado) => {
            setDetalleId(null)
            setADesactivar(empleado)
          }}
        />
      )}
    </div>
  )
}

function NuevoEmpleadoModal({ abierto, sesion, onCerrar, onCreado }) {
  const [formulario, setFormulario] = useState(NUEVO_INICIAL)
  const [roles, setRoles] = useState([])
  const [seleccionados, setSeleccionados] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!abierto) return
    setFormulario(NUEVO_INICIAL)
    setSeleccionados([])
    setError('')

    api
      .roles(sesion)
      .then((datos) => setRoles(datos.filter((rol) => rol.estado === 'activo')))
      .catch((fallo) => setError(fallo.message))
  }, [abierto, sesion])

  function actualizar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }))
  }

  function alternarRol(rolId) {
    setSeleccionados((actual) =>
      actual.includes(rolId) ? actual.filter((id) => id !== rolId) : [...actual, rolId],
    )
  }

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setCargando(true)

    try {
      const empleado = await api.crearEmpleado(
        {
          nombreUsuario: formulario.nombreUsuario.trim(),
          contrasena: formulario.contrasena,
          nombres: formulario.nombres.trim(),
          apellidos: formulario.apellidos.trim(),
          ci: formulario.ci.trim(),
          telefono: formulario.telefono.trim() || null,
          correo: formulario.correo.trim() || null,
          ingresoFecha: formulario.ingresoFecha || null,
          roles: seleccionados.map((rolId) => ({ rolId })),
        },
        sesion,
      )

      onCreado(empleado)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal
      abierto={abierto}
      titulo="Registrar empleado"
      descripcion="Crea la cuenta y asigna los roles indicados (RF01)."
      onCerrar={onCerrar}
      ancho="lg"
      pie={
        <>
          <Boton variante="fantasma" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton variante="primario" tipo="submit" form="form-empleado" cargando={cargando}>
            Guardar empleado
          </Boton>
        </>
      }
    >
      <form id="form-empleado" onSubmit={enviar}>
        {error && (
          <div style={{ marginBottom: 12 }}>
            <Alerta tono="error">{error}</Alerta>
          </div>
        )}

        <div className="form-grid form-grid--2">
          <Campo etiqueta="Nombres" requerido>
            <Entrada
              value={formulario.nombres}
              onChange={(evento) => actualizar('nombres', evento.target.value)}
              required
              maxLength={100}
            />
          </Campo>
          <Campo etiqueta="Apellidos" requerido>
            <Entrada
              value={formulario.apellidos}
              onChange={(evento) => actualizar('apellidos', evento.target.value)}
              required
              maxLength={100}
            />
          </Campo>
          <Campo etiqueta="CI" requerido>
            <Entrada
              value={formulario.ci}
              onChange={(evento) => actualizar('ci', evento.target.value)}
              required
              maxLength={30}
            />
          </Campo>
          <Campo etiqueta="Fecha de ingreso">
            <Entrada
              type="date"
              value={formulario.ingresoFecha}
              onChange={(evento) => actualizar('ingresoFecha', evento.target.value)}
            />
          </Campo>
          <Campo etiqueta="Usuario" requerido>
            <Entrada
              value={formulario.nombreUsuario}
              onChange={(evento) => actualizar('nombreUsuario', evento.target.value)}
              required
              minLength={3}
              maxLength={60}
            />
          </Campo>
          <Campo etiqueta="Contraseña" requerido ayuda="Mínimo 8 caracteres con letras y números.">
            <Entrada
              type="password"
              value={formulario.contrasena}
              onChange={(evento) => actualizar('contrasena', evento.target.value)}
              required
              minLength={8}
            />
          </Campo>
          <Campo etiqueta="Teléfono">
            <Entrada
              value={formulario.telefono}
              onChange={(evento) => actualizar('telefono', evento.target.value)}
              maxLength={30}
            />
          </Campo>
          <Campo etiqueta="Correo">
            <Entrada
              type="email"
              value={formulario.correo}
              onChange={(evento) => actualizar('correo', evento.target.value)}
              maxLength={120}
            />
          </Campo>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="campo__etiqueta" style={{ marginBottom: 8 }}>
            Roles <span className="campo__req">*</span>
          </div>
          <div className="lista-permisos">
            {roles.map((rol) => (
              <label className="casilla" key={rol.rolId}>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(rol.rolId)}
                  onChange={() => alternarRol(rol.rolId)}
                />
                <span>
                  {rol.nombre}
                  <span className="casilla__detalle">{rol.descripcion}</span>
                </span>
              </label>
            ))}
          </div>
          {seleccionados.length === 0 && (
            <p className="campo__ayuda">Selecciona al menos un rol.</p>
          )}
        </div>
      </form>
    </Modal>
  )
}

function DesactivarEmpleadoModal({ empleado, sesion, onCerrar, onDesactivado }) {
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    setMotivo('')
    setError('')
  }, [empleado])

  if (!empleado) return null

  async function confirmar() {
    setError('')
    setCargando(true)

    try {
      await api.desactivarEmpleado(empleado.empleadoId, motivo.trim() || null, sesion)
      onDesactivado(
        `${empleado.nombres} ${empleado.apellidos} fue desactivado. Su sesión queda invalidada.`,
      )
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal
      abierto={Boolean(empleado)}
      titulo="Desactivar cuenta"
      descripcion={`${empleado.nombres} ${empleado.apellidos} perderá el acceso de inmediato.`}
      onCerrar={onCerrar}
      ancho="sm"
      pie={
        <>
          <Boton variante="fantasma" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton variante="peligro" onClick={confirmar} cargando={cargando}>
            Desactivar cuenta
          </Boton>
        </>
      }
    >
      {error && (
        <div style={{ marginBottom: 12 }}>
          <Alerta tono="error">{error}</Alerta>
        </div>
      )}
      <Alerta tono="warn">
        Se cierran sus asignaciones de rol vigentes y se conserva todo el historial.
      </Alerta>
      <div style={{ marginTop: 14 }}>
        <Campo etiqueta="Motivo" ayuda="Opcional, queda en la auditoría.">
          <Entrada
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
            placeholder="Fin de contrato"
          />
        </Campo>
      </div>
    </Modal>
  )
}

function DetalleEmpleadoModal({ empleadoId, sesion, onCerrar, onCambio, onDesactivar }) {
  const [estado, setEstado] = useState({ cargando: true, empleado: null, error: null })
  const [recarga, setRecarga] = useState(0)
  const [roles, setRoles] = useState([])
  const [rolId, setRolId] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let vivo = true
    setEstado((actual) => ({ ...actual, cargando: true, error: null }))

    api
      .empleado(empleadoId, sesion)
      .then((empleado) => {
        if (vivo) setEstado({ cargando: false, empleado, error: null })
      })
      .catch((fallo) => {
        if (vivo) setEstado({ cargando: false, empleado: null, error: fallo.message })
      })

    return () => {
      vivo = false
    }
  }, [empleadoId, sesion, recarga])

  useEffect(() => {
    api
      .roles(sesion)
      .then((datos) => setRoles(datos.filter((rol) => rol.estado === 'activo')))
      .catch(() => setRoles([]))
  }, [sesion])

  async function asignar(evento) {
    evento.preventDefault()
    if (!rolId) return

    setErrorAccion('')
    setGuardando(true)

    try {
      await api.asignarRol(
        empleadoId,
        { rolId: Number(rolId), fechaFin: fechaFin || null },
        sesion,
      )
      setRolId('')
      setFechaFin('')
      setRecarga((valor) => valor + 1)
      onCambio('Rol asignado con su vigencia.')
    } catch (fallo) {
      setErrorAccion(fallo.message)
    } finally {
      setGuardando(false)
    }
  }

  async function cerrarRol(id) {
    setErrorAccion('')
    setGuardando(true)

    try {
      await api.cerrarRol(empleadoId, id, undefined, sesion)
      setRecarga((valor) => valor + 1)
      onCambio('Vigencia cerrada. El permiso deja de aplicar hoy mismo.')
    } catch (fallo) {
      setErrorAccion(fallo.message)
    } finally {
      setGuardando(false)
    }
  }

  const empleado = estado.empleado
  const vigentes = new Set(
    (empleado?.roles ?? []).filter((rol) => rol.vigente).map((rol) => rol.rolId),
  )
  const disponibles = roles.filter((rol) => !vigentes.has(rol.rolId))

  return (
    <Modal
      abierto
      titulo={empleado ? `${empleado.nombres} ${empleado.apellidos}` : 'Empleado'}
      descripcion="Datos, roles e historial de vigencias."
      onCerrar={onCerrar}
      ancho="lg"
      pie={
        <>
          <Boton variante="fantasma" onClick={onCerrar}>
            Cerrar
          </Boton>
          {empleado && puede(sesion, 'empleados.desactivar') && (
            empleado.estado === 'activo' ? (
              <Boton variante="peligro" onClick={() => onDesactivar(empleado)}>
                Desactivar cuenta
              </Boton>
            ) : (
              <Boton
                variante="exito"
                onClick={async () => {
                  try {
                    await api.reactivarEmpleado(empleadoId, sesion)
                    setRecarga((valor) => valor + 1)
                    onCambio('Cuenta reactivada.')
                  } catch (fallo) {
                    setErrorAccion(fallo.message)
                  }
                }}
              >
                Reactivar cuenta
              </Boton>
            )
          )}
        </>
      }
    >
      {estado.cargando ? (
        <Cargando />
      ) : estado.error ? (
        <Alerta tono="error">{estado.error}</Alerta>
      ) : (
        <div className="pila">
          {errorAccion && <Alerta tono="error">{errorAccion}</Alerta>}

          <div className="datos">
            <Dato etiqueta="Usuario" valor={<span className="mono">{empleado.nombreUsuario}</span>} />
            <Dato etiqueta="CI" valor={empleado.ci} />
            <Dato etiqueta="Estado" valor={<Estado valor={empleado.estado} />} />
            <Dato etiqueta="Correo" valor={empleado.correo} />
            <Dato etiqueta="Teléfono" valor={empleado.telefono} />
            <Dato etiqueta="Ingreso" valor={fecha(empleado.ingresoFecha)} />
          </div>

          <div>
            <div className="grupo-permisos__titulo">Roles y vigencias</div>
            <Tabla columnas={['Rol', 'Desde', 'Hasta', 'Estado', '']}>
              {empleado.roles.map((rol) => (
                <tr key={`${rol.rolId}-${rol.fechaInicio}`}>
                  <td className="celda-principal">{rol.nombre}</td>
                  <td className="celda-suave">{fecha(rol.fechaInicio)}</td>
                  <td className="celda-suave">{rol.fechaFin ? fecha(rol.fechaFin) : 'sin fin'}</td>
                  <td>
                    {rol.vigente ? (
                      <Etiqueta tono="ok">vigente</Etiqueta>
                    ) : (
                      <Etiqueta tono="off">cerrado</Etiqueta>
                    )}
                  </td>
                  <td className="texto-right">
                    {rol.vigente &&
                      empleado.estado === 'activo' &&
                      puede(sesion, 'roles.asignar') && (
                        <Boton
                          variante="secundario"
                          className="boton--chico"
                          disabled={guardando}
                          onClick={() => cerrarRol(rol.rolId)}
                        >
                          Cerrar vigencia
                        </Boton>
                      )}
                  </td>
                </tr>
              ))}
            </Tabla>
          </div>

          {puede(sesion, 'roles.asignar') && empleado.estado === 'activo' && (
            <form onSubmit={asignar}>
              <div className="grupo-permisos__titulo">Asignar rol</div>
              <div className="fila fila--wrap">
                <Seleccion
                  value={rolId}
                  onChange={(evento) => setRolId(evento.target.value)}
                  style={{ maxWidth: 240 }}
                  required
                >
                  <option value="">Elegir rol…</option>
                  {disponibles.map((rol) => (
                    <option key={rol.rolId} value={rol.rolId}>
                      {rol.nombre}
                    </option>
                  ))}
                </Seleccion>
                <Entrada
                  type="date"
                  value={fechaFin}
                  min={hoy()}
                  onChange={(evento) => setFechaFin(evento.target.value)}
                  style={{ maxWidth: 180 }}
                  aria-label="Fecha fin exclusiva"
                />
                <Boton tipo="submit" variante="primario" cargando={guardando} disabled={!rolId}>
                  Asignar
                </Boton>
              </div>
              <p className="campo__ayuda" style={{ marginTop: 6 }}>
                La fecha fin es exclusiva: el rol deja de estar vigente ese día.
              </p>
            </form>
          )}
        </div>
      )}
    </Modal>
  )
}
