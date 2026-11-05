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
import HistorialCliente from './HistorialCliente'

const NUEVO_INICIAL = {
  tipo: 'particular',
  nombreUsuario: '',
  contrasena: '',
  razonSocial: '',
  ci: '',
  nit: '',
  telefono: '',
  correo: '',
  preferidoCanal: 'correo',
}

export default function ClientesView({ sesion }) {
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [refresco, setRefresco] = useState(0)
  const [listado, setListado] = useState({ cargando: true, items: [], paginacion: null, error: null })
  const [nuevoAbierto, setNuevoAbierto] = useState(false)
  const [detalleId, setDetalleId] = useState(null)

  useEffect(() => {
    let vivo = true
    setListado((actual) => ({ ...actual, cargando: true, error: null }))

    api
      .clientes(
        { texto: busqueda, estado: estadoFiltro, tipo: tipoFiltro, pagina, tamano: 10 },
        sesion,
      )
      .then((datos) => {
        if (vivo) {
          setListado({ cargando: false, items: datos.items, paginacion: datos.paginacion, error: null })
        }
      })
      .catch((fallo) => {
        if (vivo) {
          setListado({ cargando: false, items: [], paginacion: null, error: fallo.message })
        }
      })

    return () => {
      vivo = false
    }
  }, [sesion, busqueda, estadoFiltro, tipoFiltro, pagina, refresco])

  if (detalleId) {
    return (
      <DetalleCliente
        clienteId={detalleId}
        sesion={sesion}
        onVolver={() => setDetalleId(null)}
      />
    )
  }

  function buscar(evento) {
    evento.preventDefault()
    setPagina(1)
    setBusqueda(texto.trim())
  }

  return (
    <div className="pila">
      <div className="pagina">
        <div>
          <h1 className="pagina__titulo">Clientes</h1>
          <p className="pagina__desc">
            Registro y consulta de clientes particulares y empresas. Cada cliente tiene un
            único identificador de acceso y una única CI o NIT.
          </p>
        </div>
        <div className="pagina__acciones">
          {puede(sesion, 'clientes.crear') && (
            <Boton variante="primario" onClick={() => setNuevoAbierto(true)}>
              <Icono nombre="mas" tamano={16} />
              Registrar cliente
            </Boton>
          )}
        </div>
      </div>

      <Tarjeta>
        <form className="fila fila--wrap" onSubmit={buscar} style={{ marginBottom: 14 }}>
          <Entrada
            placeholder="Buscar por razón social, CI, NIT o correo…"
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
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </Seleccion>

          <Seleccion
            value={tipoFiltro}
            onChange={(evento) => {
              setTipoFiltro(evento.target.value)
              setPagina(1)
            }}
            style={{ maxWidth: 150 }}
          >
            <option value="">Todos los tipos</option>
            <option value="particular">Particular</option>
            <option value="empresa">Empresa</option>
          </Seleccion>
        </form>

        {listado.error && <Alerta tono="error">{listado.error}</Alerta>}

        {listado.cargando ? (
          <Cargando texto="Cargando clientes…" />
        ) : listado.items.length === 0 ? (
          <Vacio
            titulo="No se encontraron clientes"
            detalle="Prueba con otro texto o registra un cliente nuevo."
            accion={
              puede(sesion, 'clientes.crear') ? (
                <Boton variante="primario" onClick={() => setNuevoAbierto(true)}>
                  Registrar cliente
                </Boton>
              ) : null
            }
          />
        ) : (
          <>
            <Tabla columnas={['Cliente', 'Tipo', 'Identificación', 'Contacto', 'Estado', 'Registrado']}>
              {listado.items.map((cliente) => (
                <tr
                  key={cliente.clienteId}
                  className="fila-clicable"
                  onClick={() => setDetalleId(cliente.clienteId)}
                >
                  <td>
                    <div className="celda-principal">{cliente.razonSocial}</div>
                    <div className="celda-suave mono">{cliente.nombreUsuario ?? 'sin cuenta'}</div>
                  </td>
                  <td>
                    <Etiqueta tono={cliente.tipo === 'empresa' ? 'info' : 'neutro'}>
                      {cliente.tipo}
                    </Etiqueta>
                  </td>
                  <td className="mono">{cliente.ci ?? cliente.nit ?? '—'}</td>
                  <td className="celda-suave">{cliente.correo ?? cliente.telefono ?? '—'}</td>
                  <td>
                    <Estado valor={cliente.estado} />
                  </td>
                  <td className="celda-suave">{fecha(cliente.fechaRegistro)}</td>
                </tr>
              ))}
            </Tabla>

            {listado.paginacion && (
              <div className="fila fila--entre" style={{ padding: '12px 14px' }}>
                <span className="texto-pequeno texto-suave">
                  {listado.paginacion.total} clientes · página {listado.paginacion.pagina} de{' '}
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

      <NuevoClienteModal
        abierto={nuevoAbierto}
        sesion={sesion}
        onCerrar={() => setNuevoAbierto(false)}
        onCreado={(cliente) => {
          setNuevoAbierto(false)
          setRefresco((valor) => valor + 1)
          setDetalleId(cliente.clienteId)
        }}
      />
    </div>
  )
}

function NuevoClienteModal({ abierto, sesion, onCerrar, onCreado }) {
  const [formulario, setFormulario] = useState(NUEVO_INICIAL)
  const [error, setError] = useState('')
  const [erroresCampo, setErroresCampo] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (abierto) {
      setFormulario(NUEVO_INICIAL)
      setError('')
      setErroresCampo(null)
    }
  }, [abierto])

  const esParticular = formulario.tipo === 'particular'

  function actualizar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setErroresCampo(null)
    setCargando(true)

    try {
      const cliente = await api.crearCliente(
        {
          tipo: formulario.tipo,
          nombreUsuario: formulario.nombreUsuario.trim(),
          contrasena: formulario.contrasena,
          razonSocial: formulario.razonSocial.trim(),
          ci: esParticular ? formulario.ci.trim() : null,
          nit: esParticular ? null : formulario.nit.trim(),
          telefono: formulario.telefono.trim() || null,
          correo: formulario.correo.trim() || null,
          preferidoCanal: formulario.preferidoCanal,
        },
        sesion,
      )

      onCreado(cliente)
    } catch (fallo) {
      setError(fallo.message)
      setErroresCampo(fallo.cuerpo?.errors ?? null)
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal
      abierto={abierto}
      titulo="Registrar cliente"
      descripcion="Alta interna: la cuenta queda activa y asociada al cliente."
      onCerrar={onCerrar}
      ancho="lg"
      pie={
        <>
          <Boton variante="fantasma" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton variante="primario" tipo="submit" form="form-cliente" cargando={cargando}>
            Guardar cliente
          </Boton>
        </>
      }
    >
      <form id="form-cliente" onSubmit={enviar}>
        {error && (
          <div style={{ marginBottom: 12 }}>
            <Alerta tono="error">
              <div>{error}</div>
              {erroresCampo && (
                <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                  {Object.entries(erroresCampo).map(([campo, mensajes]) => (
                    <li key={campo}>
                      <strong>{campo}:</strong> {mensajes.join(' ')}
                    </li>
                  ))}
                </ul>
              )}
            </Alerta>
          </div>
        )}

        <div className="pestanas" role="tablist" aria-label="Tipo de cliente">
          <button
            type="button"
            className={`pestana ${esParticular ? 'pestana--activa' : ''}`}
            onClick={() => actualizar('tipo', 'particular')}
          >
            Particular
          </button>
          <button
            type="button"
            className={`pestana ${!esParticular ? 'pestana--activa' : ''}`}
            onClick={() => actualizar('tipo', 'empresa')}
          >
            Empresa
          </button>
        </div>

        <div className="form-grid form-grid--2">
          <Campo etiqueta="Razón social" requerido>
            <Entrada
              value={formulario.razonSocial}
              onChange={(evento) => actualizar('razonSocial', evento.target.value)}
              placeholder={esParticular ? 'María López' : 'Comercial El Sol SRL'}
              required
              maxLength={150}
            />
          </Campo>

          <Campo etiqueta={esParticular ? 'CI' : 'NIT'} requerido>
            <Entrada
              value={esParticular ? formulario.ci : formulario.nit}
              onChange={(evento) =>
                actualizar(esParticular ? 'ci' : 'nit', evento.target.value)
              }
              placeholder={esParticular ? '55556666' : '1020304050'}
              required
              maxLength={30}
            />
          </Campo>

          <Campo etiqueta="Usuario" requerido ayuda="Letras, números, punto, guion y guion bajo.">
            <Entrada
              value={formulario.nombreUsuario}
              onChange={(evento) => actualizar('nombreUsuario', evento.target.value)}
              placeholder="maria.lopez"
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
              placeholder="••••••••"
              required
              minLength={8}
            />
          </Campo>

          <Campo etiqueta="Teléfono">
            <Entrada
              value={formulario.telefono}
              onChange={(evento) => actualizar('telefono', evento.target.value)}
              placeholder="72222222"
              maxLength={30}
            />
          </Campo>

          <Campo etiqueta="Correo">
            <Entrada
              type="email"
              value={formulario.correo}
              onChange={(evento) => actualizar('correo', evento.target.value)}
              placeholder="maria@correo.bo"
              maxLength={120}
            />
          </Campo>
        </div>
      </form>
    </Modal>
  )
}

function DetalleCliente({ clienteId, sesion, onVolver }) {
  const [estado, setEstado] = useState({ cargando: true, cliente: null, error: null })

  useEffect(() => {
    let vivo = true

    api
      .cliente(clienteId, sesion)
      .then((cliente) => {
        if (vivo) setEstado({ cargando: false, cliente, error: null })
      })
      .catch((fallo) => {
        if (vivo) setEstado({ cargando: false, cliente: null, error: fallo.message })
      })

    return () => {
      vivo = false
    }
  }, [clienteId, sesion])

  if (estado.cargando) return <Cargando texto="Cargando cliente…" />
  if (estado.error) return <Alerta tono="error">{estado.error}</Alerta>

  const cliente = estado.cliente

  return (
    <div className="pila">
      <div>
        <Boton variante="fantasma" onClick={onVolver}>
          <Icono nombre="chevron" tamano={15} className="icono-girado" />
          Volver al listado
        </Boton>
      </div>

      <div className="pagina">
        <div>
          <h1 className="pagina__titulo">{cliente.razonSocial}</h1>
          <p className="pagina__desc">
            Cliente {cliente.tipo} · registrado el {fecha(cliente.fechaRegistro)}
          </p>
        </div>
        <div className="pagina__acciones">
          <Estado valor={cliente.estado} />
          <Etiqueta tono="info">{cliente.tipo}</Etiqueta>
        </div>
      </div>

      <Tarjeta titulo="Datos del cliente">
        <div className="datos">
          <Dato etiqueta="Identificación" valor={cliente.ci ?? cliente.nit} />
          <Dato etiqueta="Usuario" valor={<span className="mono">{cliente.nombreUsuario ?? '—'}</span>} />
          <Dato etiqueta="Estado de la cuenta" valor={<Estado valor={cliente.estadoCuenta} />} />
          <Dato etiqueta="Correo" valor={cliente.correo} />
          <Dato etiqueta="Teléfono" valor={cliente.telefono} />
          <Dato etiqueta="Canal preferido" valor={cliente.preferidoCanal} />
          <Dato etiqueta="Correo verificado" valor={cliente.verificadoCorreo ? 'Sí' : 'No'} />
          <Dato etiqueta="Cliente desde" valor={fecha(cliente.fechaRegistro)} />
        </div>
      </Tarjeta>

      {puede(sesion, 'clientes.historial.leer') ? (
        <HistorialCliente clienteId={cliente.clienteId} sesion={sesion} />
      ) : (
        <Alerta tono="info">
          Tu rol no incluye el permiso <strong>clientes.historial.leer</strong>, por eso no se
          muestra el historial de compras.
        </Alerta>
      )}
    </div>
  )
}
