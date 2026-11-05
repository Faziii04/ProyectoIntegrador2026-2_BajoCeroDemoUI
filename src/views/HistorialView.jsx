import { useEffect, useState } from 'react'
import { api } from '../api'
import { Alerta, Cargando, Seleccion, Tarjeta, Vacio } from '../ui'
import HistorialCliente from './HistorialCliente'

export default function HistorialView({ sesion }) {
  const [estado, setEstado] = useState({ cargando: true, items: [], error: null })
  const [clienteId, setClienteId] = useState('')

  useEffect(() => {
    let vivo = true

    api
      .clientes({ pagina: 1, tamano: 100 }, sesion)
      .then((datos) => {
        if (!vivo) return
        setEstado({ cargando: false, items: datos.items, error: null })
        if (datos.items.length > 0) setClienteId(String(datos.items[0].clienteId))
      })
      .catch((fallo) => {
        if (vivo) setEstado({ cargando: false, items: [], error: fallo.message })
      })

    return () => {
      vivo = false
    }
  }, [sesion])

  return (
    <div className="pila">
      <div className="pagina">
        <div>
          <h1 className="pagina__titulo">Historial del cliente</h1>
          <p className="pagina__desc">
            Compras, pedidos, pagos y estados. Cada cliente solo puede consultar su propia
            información; el personal necesita el permiso <strong>clientes.historial.leer</strong>.
          </p>
        </div>
      </div>

      <Tarjeta titulo="Elegir cliente" descripcion="Selecciona un cliente para ver su historial.">
        {estado.cargando ? (
          <Cargando texto="Cargando clientes…" />
        ) : estado.error ? (
          <Alerta tono="error">{estado.error}</Alerta>
        ) : estado.items.length === 0 ? (
          <Vacio titulo="No hay clientes registrados" />
        ) : (
          <Seleccion value={clienteId} onChange={(evento) => setClienteId(evento.target.value)}>
            {estado.items.map((cliente) => (
              <option key={cliente.clienteId} value={cliente.clienteId}>
                {cliente.razonSocial} · {cliente.ci ?? cliente.nit ?? 'sin identificación'}
              </option>
            ))}
          </Seleccion>
        )}
      </Tarjeta>

      {clienteId && <HistorialCliente clienteId={Number(clienteId)} sesion={sesion} />}
    </div>
  )
}
