import { useState } from 'react'
import { puede } from '../session'
import { Boton, Icono } from '../ui'
import { iniciales } from '../formato'
import ClientesView from './ClientesView'
import EmpleadosView from './EmpleadosView'
import HistorialView from './HistorialView'
import InicioView from './InicioView'
import ModuloPendienteView from './ModuloPendienteView'
import RolesView from './RolesView'

const PESTANAS = [
  {
    id: 'inicio',
    titulo: 'Inicio',
    icono: 'inicio',
    grupo: 'General',
    descripcion: 'Resumen general y accesos rápidos.',
  },
  {
    id: 'clientes',
    titulo: 'Clientes',
    icono: 'clientes',
    grupo: 'Operación',
    rf: 'RF28',
    permiso: 'clientes.leer',
    descripcion: 'Registro y consulta de clientes particulares y empresas.',
  },
  {
    id: 'historial',
    titulo: 'Historial',
    icono: 'historial',
    grupo: 'Operación',
    rf: 'RF30',
    permiso: 'clientes.historial.leer',
    descripcion: 'Compras, pedidos, pagos y estados por cliente.',
  },
  {
    id: 'empleados',
    titulo: 'Empleados',
    icono: 'empleados',
    grupo: 'Administración',
    rf: 'RF01 · RF03',
    permiso: 'empleados.leer',
    descripcion: 'Altas, roles y desactivación de cuentas.',
  },
  {
    id: 'roles',
    titulo: 'Roles y permisos',
    icono: 'roles',
    grupo: 'Administración',
    rf: 'RF02',
    permiso: 'roles.leer',
    descripcion: 'Permisos por rol y asignaciones con vigencia.',
  },
  {
    id: 'inventario',
    titulo: 'Inventario',
    icono: 'inventario',
    grupo: 'Próximamente',
    pendiente: true,
    descripcion: 'Insumos, lotes, stock por almacén y vencimientos.',
    items: [
      'Insumos, almacenes y stock por lote',
      'Movimientos, ajustes y mermas',
      'Alertas de stock mínimo y vencimiento',
    ],
  },
  {
    id: 'produccion',
    titulo: 'Producción',
    icono: 'produccion',
    grupo: 'Próximamente',
    pendiente: true,
    descripcion: 'Órdenes de producción y consumo de insumos.',
    items: [
      'Órdenes de producción por producto',
      'Recetas y consumo de insumos',
      'Pérdidas y control de calidad',
    ],
  },
  {
    id: 'ventas',
    titulo: 'Ventas',
    icono: 'ventas',
    grupo: 'Próximamente',
    pendiente: true,
    descripcion: 'Ventas de mostrador, facturación y pagos.',
    items: [
      'Venta rápida y carrito',
      'Facturación y comprobantes',
      'Pagos, reembolsos y promociones',
    ],
  },
  {
    id: 'reparto',
    titulo: 'Reparto',
    icono: 'reparto',
    grupo: 'Próximamente',
    pendiente: true,
    descripcion: 'Recorridos, entregas y zonas de cobertura.',
    items: [
      'Recorridos y asignación de vehículos',
      'Entregas, intentos e incidencias',
      'Zonas de cobertura y tarifas de envío',
    ],
  },
  {
    id: 'reportes',
    titulo: 'Reportes',
    icono: 'reportes',
    grupo: 'Próximamente',
    pendiente: true,
    descripcion: 'Indicadores de ventas, stock y clientes.',
    items: [
      'Ventas por período y producto',
      'Stock valorizado',
      'Clientes frecuentes y consumo',
    ],
  },
]

const GRUPOS = ['General', 'Operación', 'Administración', 'Próximamente']

export default function Backoffice({ sesion, onSalir }) {
  const [activa, setActiva] = useState('inicio')
  const [refresco, setRefresco] = useState(0)

  const visibles = PESTANAS.filter(
    (pestana) => pestana.pendiente || !pestana.permiso || puede(sesion, pestana.permiso),
  )

  const actual = PESTANAS.find((pestana) => pestana.id === activa) ?? PESTANAS[0]

  function navegar(id) {
    setActiva(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="marca">
          <div className="marca__icono">B</div>
          <div>
            <span className="marca__nombre">BajoCero</span>
            <span className="marca__detalle">Backoffice</span>
          </div>
        </div>

        <div className="sidebar__grupo">
          {GRUPOS.map((grupo) => {
            const items = visibles.filter((pestana) => pestana.grupo === grupo)
            if (items.length === 0) return null

            return (
              <div className="nav-grupo" key={grupo}>
                <span className="nav-grupo__titulo">{grupo}</span>
                <nav className="nav">
                  {items.map((pestana) => (
                    <button
                      key={pestana.id}
                      type="button"
                      className={`nav__item ${activa === pestana.id ? 'nav__item--activo' : ''} ${
                        pestana.pendiente ? 'nav__item--pendiente' : ''
                      }`}
                      onClick={() => navegar(pestana.id)}
                    >
                      <Icono nombre={pestana.icono} tamano={17} />
                      <span className="nav__texto">{pestana.titulo}</span>
                      {pestana.rf && <span className="nav__rf">{pestana.rf}</span>}
                      {pestana.pendiente && <span className="nav__punto" title="Próximamente" />}
                    </button>
                  ))}
                </nav>
              </div>
            )
          })}
        </div>

        <div className="sidebar__pie">
          <div className="usuario">
            <span className="usuario__avatar">{iniciales(sesion.nombre)}</span>
            <span className="usuario__datos">
              <span className="usuario__nombre">{sesion.nombre}</span>
              <span className="usuario__rol">{sesion.roles.join(' · ') || 'sin rol'}</span>
            </span>
          </div>
          <Boton variante="fantasma" className="sidebar__salir" onClick={onSalir}>
            <Icono nombre="salir" tamano={16} />
            Cerrar sesión
          </Boton>
        </div>
      </aside>

      <div className="contenido">
        <header className="topbar">
          <div>
            <div className="topbar__titulo">{actual?.titulo}</div>
            <div className="topbar__sub">{actual?.descripcion}</div>
          </div>
          <div className="topbar__acciones">
            <Boton variante="secundario" onClick={() => setRefresco((valor) => valor + 1)}>
              <Icono nombre="refrescar" tamano={16} />
              Refrescar
            </Boton>
          </div>
        </header>

        <main className="principal">
          {activa === 'inicio' && (
            <InicioView key={refresco} sesion={sesion} onNavegar={navegar} />
          )}
          {activa === 'clientes' && <ClientesView key={refresco} sesion={sesion} />}
          {activa === 'historial' && <HistorialView key={refresco} sesion={sesion} />}
          {activa === 'empleados' && <EmpleadosView key={refresco} sesion={sesion} />}
          {activa === 'roles' && <RolesView key={refresco} sesion={sesion} />}
          {actual?.pendiente && (
            <ModuloPendienteView
              key={activa}
              titulo={actual.titulo}
              icono={actual.icono}
              descripcion={actual.descripcion}
              items={actual.items}
            />
          )}
        </main>
      </div>
    </div>
  )
}
