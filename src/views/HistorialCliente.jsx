import { useEffect, useState } from 'react'
import { api } from '../api'
import { bolivianos, fechaHora, textoEstado } from '../formato'
import { Alerta, Cargando, Estado, Etiqueta, Icono, Stat, Tarjeta, Vacio } from '../ui'

function LineaProducto({ producto }) {
  return (
    <div className="linea-producto">
      <span>
        <strong>{producto.producto}</strong>
        <span className="texto-suave"> · {producto.formato}</span>
      </span>
      <span className="texto-right">{producto.cantidadPaquetes} pqt</span>
      <span className="texto-right">{bolivianos(producto.precioUnitario)}</span>
      <span className="texto-right">{bolivianos(producto.importe)}</span>
    </div>
  )
}

function DetalleVenta({ venta }) {
  return (
    <details className="desplegable">
      <summary>
        <span className="mono">#{venta.ventaId}</span>
        <span>
          {fechaHora(venta.fecha)} <span className="texto-suave">· {venta.tipo}</span>
        </span>
        <span className="texto-right celda-principal">{bolivianos(venta.total)}</span>
        <span>
          <Estado valor={venta.estadoPago} />
        </span>
        <Icono nombre="chevron" tamano={16} className="desplegable__flecha" />
      </summary>

      <div className="desplegable__cuerpo">
        <div className="fila fila--entre fila--wrap">
          <span className="texto-pequeno texto-suave">
            Estado de la venta: <strong>{textoEstado(venta.estado)}</strong>
          </span>
          {venta.factura && (
            <span className="texto-pequeno texto-suave">
              Factura <strong>{venta.factura.numero}</strong> · {bolivianos(venta.factura.total)}
            </span>
          )}
          {venta.fechaVencimientoPago && (
            <span className="texto-pequeno texto-suave">
              Vence: <strong>{venta.fechaVencimientoPago}</strong>
            </span>
          )}
        </div>

        <div>
          <div className="grupo-permisos__titulo">Productos</div>
          {venta.productos.length === 0 ? (
            <p className="texto-suave texto-pequeno">Sin detalle de productos.</p>
          ) : (
            venta.productos.map((producto) => (
              <LineaProducto key={producto.formatoId} producto={producto} />
            ))
          )}
        </div>

        {venta.pagos.length > 0 && (
          <div>
            <div className="grupo-permisos__titulo">Pagos</div>
            <div className="pagos">
              {venta.pagos.map((pago) => (
                <span className="pago" key={pago.pagoId}>
                  {bolivianos(pago.importe)} · {pago.medio} · <Estado valor={pago.estado} />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  )
}

function DetallePedido({ pedido }) {
  return (
    <details className="desplegable">
      <summary>
        <span className="mono">#{pedido.pedidoClienteId}</span>
        <span>
          {fechaHora(pedido.fechaPedido)} <span className="texto-suave">· {pedido.modalidad}</span>
        </span>
        <span className="texto-right celda-principal">
          {pedido.total ? bolivianos(pedido.total) : '—'}
        </span>
        <span>
          <Estado valor={pedido.estado} />
        </span>
        <Icono nombre="chevron" tamano={16} className="desplegable__flecha" />
      </summary>

      <div className="desplegable__cuerpo">
        <div className="fila fila--entre fila--wrap">
          <span className="texto-pequeno texto-suave">
            {pedido.destinoDireccion ?? 'Retiro en tienda'}
          </span>
          {pedido.numeroFactura && (
            <span className="texto-pequeno texto-suave">Factura {pedido.numeroFactura}</span>
          )}
          {pedido.motivoCancelacion && (
            <span className="texto-pequeno" style={{ color: '#b91c1c' }}>
              Motivo: {pedido.motivoCancelacion}
            </span>
          )}
        </div>

        <div>
          <div className="grupo-permisos__titulo">Productos</div>
          {pedido.productos.map((producto) => (
            <LineaProducto key={producto.formatoId} producto={producto} />
          ))}
        </div>

        <div>
          <div className="grupo-permisos__titulo">Historial de estados</div>
          <div className="pila pila--chica">
            {pedido.historial.map((cambio, indice) => (
              <div className="fila" key={`${cambio.fechaHora}-${indice}`}>
                <Etiqueta tono="info">{textoEstado(cambio.estadoNuevo)}</Etiqueta>
                <span className="texto-pequeno texto-suave">{fechaHora(cambio.fechaHora)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </details>
  )
}

export default function HistorialCliente({ clienteId, sesion, propio = false }) {
  const [estado, setEstado] = useState({ cargando: true, datos: null, error: null })

  useEffect(() => {
    let vivo = true
    setEstado({ cargando: true, datos: null, error: null })

    const peticion = propio ? api.miHistorial(sesion) : api.historial(clienteId, sesion)

    peticion
      .then((datos) => {
        if (vivo) setEstado({ cargando: false, datos, error: null })
      })
      .catch((fallo) => {
        if (vivo) setEstado({ cargando: false, datos: null, error: fallo.message })
      })

    return () => {
      vivo = false
    }
  }, [clienteId, propio, sesion])

  if (estado.cargando) return <Cargando texto="Cargando historial…" />
  if (estado.error) return <Alerta tono="error">{estado.error}</Alerta>

  const { resumen, compras, pedidos } = estado.datos

  return (
    <div className="historial">
      <div className="historial__resumen">
        <Stat etiqueta="Compras" valor={resumen.totalCompras} detalle="ventas registradas" />
        <Stat etiqueta="Importe total" valor={bolivianos(resumen.importeTotal)} detalle="histórico" />
        <Stat
          etiqueta="Saldo pendiente"
          valor={bolivianos(resumen.saldoPendiente)}
          detalle="por cobrar"
        />
        <Stat
          etiqueta="Pedidos"
          valor={resumen.totalPedidos}
          detalle={`${resumen.pedidosCancelados} cancelados`}
        />
      </div>

      <Tarjeta
        titulo="Compras"
        descripcion={
          resumen.ultimaCompra ? `Última compra: ${fechaHora(resumen.ultimaCompra)}` : 'Sin compras todavía'
        }
      >
        {compras.length === 0 ? (
          <Vacio
            titulo="Sin compras"
            detalle={propio ? 'Cuando compres, tus facturas aparecerán aquí.' : 'Este cliente todavía no tiene ventas.'}
          />
        ) : (
          compras.map((venta) => <DetalleVenta key={venta.ventaId} venta={venta} />)
        )}
      </Tarjeta>

      <Tarjeta titulo="Pedidos" descripcion="Incluye el historial de estados de cada pedido.">
        {pedidos.length === 0 ? (
          <Vacio titulo="Sin pedidos" detalle="No hay pedidos registrados para este cliente." />
        ) : (
          pedidos.map((pedido) => <DetallePedido key={pedido.pedidoClienteId} pedido={pedido} />)
        )}
      </Tarjeta>
    </div>
  )
}
