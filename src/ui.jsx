import { textoEstado } from './formato'

const RUTAS = {
  inicio: [
    'M3 10.8 12 3l9 7.8',
    'M5.5 9.6V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9.6',
  ],
  clientes: [
    'M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20',
    'M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7',
    'M17 3.8a3.5 3.5 0 0 1 0 6.9',
    'M21 20v-1.5a4 4 0 0 0-3-3.8',
  ],
  historial: ['M12 3a9 9 0 1 0 9 9', 'M21 3v6h-6', 'M12 7.5V12l3 2'],
  empleados: [
    'M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20',
    'M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7',
    'm15.5 12.5 2 2 4-4',
  ],
  roles: [
    'M12 21s7.5-3.5 7.5-9.2V5.6L12 2.5 4.5 5.6v6.2C4.5 17.5 12 21 12 21Z',
    'm9 11.5 2 2 4-4',
  ],
  inventario: ['m12 3 8.5 4.6L12 12.2 3.5 7.6 12 3Z', 'M3.5 7.6v8.8L12 21l8.5-4.6V7.6', 'M12 12.2V21'],
  produccion: ['M3 21V9.5l6 3.8V9.5l6 3.8V9.5l6 3.8V21H3Z', 'M3 21h18'],
  ventas: [
    'M3 4h2.2l2.4 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 7H6',
    'M9.5 20.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4',
    'M18 20.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4',
  ],
  reparto: [
    'M3 6h11v10H3z',
    'M14 9h4l3 3.2V16h-7',
    'M7 19a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 7 19',
    'M17.5 19a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2',
  ],
  reportes: ['M4 4v16h16', 'm7.5 14 3.5-4 3 2.5L19 7'],
  salir: ['M10 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5', 'm16 16 4-4-4-4', 'M20 12H9'],
  mas: ['M12 5v14', 'M5 12h14'],
  buscar: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16', 'm21 21-4.3-4.3'],
  refrescar: ['M20 11a8 8 0 1 0-.8 4', 'M20 4v7h-7'],
  cerrar: ['M6 6l12 12', 'M18 6 6 18'],
  check: ['m4 12.5 5 5L20 6.5'],
  alerta: ['M12 8v5', 'M12 16.5v.5', 'M12 3 2.5 20h19L12 3Z'],
  candado: ['M6 10V8a6 6 0 0 1 12 0v2', 'M5 10h14v10H5z'],
  usuario: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M4 21a8 8 0 0 1 16 0'],
  reloj: ['M12 3a9 9 0 1 0 9 9', 'M12 7v5l3 2'],
  chevron: ['m9 6 6 6-6 6'],
}

export function Icono({ nombre, tamano = 18, className = '' }) {
  const rutas = RUTAS[nombre] ?? []
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {rutas.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export function Boton({
  variante = 'secundario',
  tipo = 'button',
  cargando = false,
  children,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      type={tipo}
      className={`boton boton--${variante} ${className}`.trim()}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && <span className="girador" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function Campo({ etiqueta, ayuda, requerido = false, children }) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">
        {etiqueta}
        {requerido && <span className="campo__req">*</span>}
      </span>
      {children}
      {ayuda && <span className="campo__ayuda">{ayuda}</span>}
    </label>
  )
}

export function Entrada({ className = '', ...props }) {
  return <input className={`entrada ${className}`.trim()} {...props} />
}

export function Seleccion({ className = '', children, ...props }) {
  return (
    <select className={`entrada ${className}`.trim()} {...props}>
      {children}
    </select>
  )
}

export function AreaTexto({ className = '', ...props }) {
  return <textarea className={`entrada entrada--area ${className}`.trim()} {...props} />
}

export function Etiqueta({ tono = 'neutro', children }) {
  return <span className={`etiqueta etiqueta--${tono}`}>{children}</span>
}

const TONOS_ESTADO = {
  activo: 'ok',
  activa: 'ok',
  completada: 'ok',
  completado: 'ok',
  entregado: 'ok',
  pagado: 'ok',
  confirmado: 'ok',
  aprobado: 'ok',
  inactivo: 'off',
  inactiva: 'off',
  cancelado: 'mal',
  cancelada: 'mal',
  rechazado: 'mal',
  bloqueado: 'mal',
  vencido: 'mal',
  pendiente: 'warn',
  pendiente_activacion: 'warn',
  en_preparacion: 'info',
  en_camino: 'info',
  planificada: 'info',
  planificado: 'info',
}

export function Estado({ valor }) {
  const clase = TONOS_ESTADO[String(valor ?? '').toLowerCase()] ?? 'neutro'
  return <Etiqueta tono={clase}>{textoEstado(valor)}</Etiqueta>
}

export function Tarjeta({ titulo, descripcion, acciones, children, className = '' }) {
  return (
    <section className={`tarjeta ${className}`.trim()}>
      {(titulo || acciones) && (
        <header className="tarjeta__cabecera">
          <div>
            {titulo && <h2>{titulo}</h2>}
            {descripcion && <p>{descripcion}</p>}
          </div>
          {acciones && <div className="tarjeta__acciones">{acciones}</div>}
        </header>
      )}
      <div className="tarjeta__cuerpo">{children}</div>
    </section>
  )
}

export function Stat({ etiqueta, valor, detalle }) {
  return (
    <div className="stat">
      <span className="stat__etiqueta">{etiqueta}</span>
      <strong className="stat__valor">{valor}</strong>
      {detalle && <span className="stat__detalle">{detalle}</span>}
    </div>
  )
}

export function Alerta({ tono = 'error', children }) {
  return (
    <div className={`alerta alerta--${tono}`} role={tono === 'error' ? 'alert' : 'status'}>
      <Icono nombre={tono === 'exito' ? 'check' : 'alerta'} tamano={16} />
      <div>{children}</div>
    </div>
  )
}

export function Cargando({ texto = 'Cargando información…' }) {
  return (
    <div className="cargando">
      <span className="girador girador--grande" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  )
}

export function Vacio({ titulo = 'Sin resultados', detalle, accion }) {
  return (
    <div className="vacio">
      <p className="vacio__titulo">{titulo}</p>
      {detalle && <p className="vacio__detalle">{detalle}</p>}
      {accion}
    </div>
  )
}

export function Modal({ abierto, titulo, descripcion, onCerrar, children, pie, ancho = 'md' }) {
  if (!abierto) return null

  return (
    <div
      className="modal-fondo"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar?.()
      }}
    >
      <div className={`modal modal--${ancho}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <header className="modal__cabecera">
          <div>
            <h2>{titulo}</h2>
            {descripcion && <p>{descripcion}</p>}
          </div>
          <button className="boton boton--fantasma boton--icono" onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" tamano={18} />
          </button>
        </header>
        <div className="modal__cuerpo">{children}</div>
        {pie && <footer className="modal__pie">{pie}</footer>}
      </div>
    </div>
  )
}

export function Tabla({ columnas, children, alineaciones = [] }) {
  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            {columnas.map((columna, indice) => (
              <th key={columna} className={alineaciones[indice] ? `texto-${alineaciones[indice]}` : ''}>
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Dato({ etiqueta, valor }) {
  return (
    <div className="dato">
      <span className="dato__etiqueta">{etiqueta}</span>
      <span className="dato__valor">{valor ?? '—'}</span>
    </div>
  )
}
