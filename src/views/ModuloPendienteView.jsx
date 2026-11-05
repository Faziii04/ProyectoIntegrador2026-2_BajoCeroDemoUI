import { Icono } from '../ui'

export default function ModuloPendienteView({ titulo, icono = 'inventario', descripcion, items = [] }) {
  return (
    <div className="pendiente-hero">
      <div className="pendiente-hero__icono">
        <Icono nombre={icono} tamano={26} />
      </div>
      <span className="etiqueta etiqueta--warn">Próximamente</span>
      <h1 style={{ marginTop: 10 }}>{titulo}</h1>
      <p>{descripcion}</p>

      <div className="pendiente-lista">
        {items.map((item) => (
          <div key={item}>
            <Icono nombre="check" tamano={15} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <p className="texto-pequeno texto-suave" style={{ marginTop: 18 }}>
        Este módulo todavía no tiene endpoints en la API. La pestaña queda visible para
        mostrar el mapa completo de trabajo del personal.
      </p>
    </div>
  )
}
