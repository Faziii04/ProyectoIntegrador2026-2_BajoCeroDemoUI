import { useEffect, useState } from 'react'
import { api } from '../api'
import { fecha } from '../formato'
import { Alerta, Boton, Cargando, Dato, Estado, Icono, Tarjeta } from '../ui'
import HistorialCliente from './HistorialCliente'

export default function PortalCliente({ sesion, onSalir }) {
  const [tab, setTab] = useState('historial')

  return (
    <div className="portal">
      <header className="portal__cabecera">
        <div className="portal__marca">
          <div className="marca__icono" style={{ width: 34, height: 34, borderRadius: 10, fontSize: 16 }}>
            B
          </div>
          <div>
            <span className="marca__nombre">BajoCero</span>
            <span className="marca__detalle">Mi cuenta</span>
          </div>
        </div>

        <div className="fila">
          <span className="texto-pequeno">{sesion.nombre}</span>
          <Boton variante="fantasma" onClick={onSalir}>
            <Icono nombre="salir" tamano={16} />
            Salir
          </Boton>
        </div>
      </header>

      <nav className="portal__nav">
        <button
          type="button"
          className={`portal__tab ${tab === 'historial' ? 'portal__tab--activa' : ''}`}
          onClick={() => setTab('historial')}
        >
          Mi historial
        </button>
        <button
          type="button"
          className={`portal__tab ${tab === 'datos' ? 'portal__tab--activa' : ''}`}
          onClick={() => setTab('datos')}
        >
          Mis datos
        </button>
      </nav>

      <div className="portal__cuerpo">
        {tab === 'historial' ? (
          <div className="pila">
            <div className="pagina">
              <div>
                <h1 className="pagina__titulo">Mi historial</h1>
                <p className="pagina__desc">
                  Solo tú puedes ver esta información: compras, pedidos, pagos y estados.
                </p>
              </div>
            </div>
            <HistorialCliente propio sesion={sesion} />
          </div>
        ) : (
          <MisDatos sesion={sesion} />
        )}
      </div>
    </div>
  )
}

function MisDatos({ sesion }) {
  const [estado, setEstado] = useState({ cargando: true, cliente: null, error: null })

  useEffect(() => {
    let vivo = true

    api
      .cliente(sesion.id, sesion)
      .then((cliente) => {
        if (vivo) setEstado({ cargando: false, cliente, error: null })
      })
      .catch((fallo) => {
        if (vivo) setEstado({ cargando: false, cliente: null, error: fallo.message })
      })

    return () => {
      vivo = false
    }
  }, [sesion])

  if (estado.cargando) return <Cargando texto="Cargando tus datos…" />
  if (estado.error) return <Alerta tono="error">{estado.error}</Alerta>

  const cliente = estado.cliente

  return (
    <div className="pila">
      <div className="pagina">
        <div>
          <h1 className="pagina__titulo">Mis datos</h1>
          <p className="pagina__desc">Información de tu cuenta de cliente.</p>
        </div>
      </div>

      <Tarjeta
        titulo={cliente.razonSocial}
        descripcion={`Cliente ${cliente.tipo}`}
        acciones={<Estado valor={cliente.estado} />}
      >
        <div className="datos">
          <Dato etiqueta="Usuario" valor={<span className="mono">{cliente.nombreUsuario}</span>} />
          <Dato etiqueta="Identificación" valor={cliente.ci ?? cliente.nit} />
          <Dato etiqueta="Correo" valor={cliente.correo} />
          <Dato etiqueta="Teléfono" valor={cliente.telefono} />
          <Dato etiqueta="Canal preferido" valor={cliente.preferidoCanal} />
          <Dato etiqueta="Cliente desde" valor={fecha(cliente.fechaRegistro)} />
        </div>
      </Tarjeta>

      <Alerta tono="info">La edición de datos estará disponible en una próxima versión.</Alerta>
    </div>
  )
}
