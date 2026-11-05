import { useState } from 'react'
import { api } from '../api'
import { Alerta, Boton, Campo, Entrada, Icono } from '../ui'

const DEMO = {
  empleado: { usuario: 'admin', contrasena: 'Admin2026!' },
  cliente: { usuario: 'cliente.demo', contrasena: 'Cliente2026!' },
}

export default function LoginView({ onIngresar, onIrRegistro }) {
  const [tipo, setTipo] = useState('empleado')
  const [usuario, setUsuario] = useState(DEMO.empleado.usuario)
  const [contrasena, setContrasena] = useState(DEMO.empleado.contrasena)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  function cambiarTipo(nuevoTipo) {
    setTipo(nuevoTipo)
    setUsuario(DEMO[nuevoTipo].usuario)
    setContrasena(DEMO[nuevoTipo].contrasena)
    setError('')
  }

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setCargando(true)

    try {
      const datos = await api.login(usuario.trim(), contrasena, tipo)
      onIngresar(datos)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="acceso">
      <aside className="acceso__marca">
        <div>
          <div className="marca">
            <div className="marca__icono">B</div>
            <div>
              <span className="marca__nombre">BajoCero</span>
              <span className="marca__detalle">Heladería · Backoffice</span>
            </div>
          </div>

          <h1 className="acceso__titulo">Un solo lugar para atender a tus clientes.</h1>
          <p className="acceso__bajada">
            Demo del backoffice con las pestañas que usará el personal: clientes, empleados,
            roles y permisos, e historial de compras.
          </p>

          <ul className="acceso__lista">
            <li>
              <Icono nombre="check" tamano={15} />
              Inicio de sesión para empleados y clientes (RF04)
            </li>
            <li>
              <Icono nombre="check" tamano={15} />
              Registro de clientes particulares y empresas (RF28)
            </li>
            <li>
              <Icono nombre="check" tamano={15} />
              Roles con fechas de vigencia e historial (RF02)
            </li>
            <li>
              <Icono nombre="check" tamano={15} />
              Desactivación inmediata de cuentas (RF03)
            </li>
            <li>
              <Icono nombre="check" tamano={15} />
              Historial de compras y pedidos (RF30)
            </li>
          </ul>
        </div>

        <p className="acceso__pie">Proyecto BajoCero · API ASP.NET Core + React</p>
      </aside>

      <main className="acceso__panel">
        <form className="acceso__formulario" onSubmit={enviar}>
          <h1>Iniciar sesión</h1>
          <p className="acceso__subtitulo">Elige el tipo de cuenta e ingresa tus credenciales.</p>

          <div className="pestanas" role="tablist" aria-label="Tipo de cuenta">
            <button
              type="button"
              role="tab"
              aria-selected={tipo === 'empleado'}
              className={`pestana ${tipo === 'empleado' ? 'pestana--activa' : ''}`}
              onClick={() => cambiarTipo('empleado')}
            >
              Empleado
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tipo === 'cliente'}
              className={`pestana ${tipo === 'cliente' ? 'pestana--activa' : ''}`}
              onClick={() => cambiarTipo('cliente')}
            >
              Cliente
            </button>
          </div>

          {error && (
            <div style={{ marginBottom: 14 }}>
              <Alerta tono="error">{error}</Alerta>
            </div>
          )}

          <div className="form-grid">
            <Campo etiqueta="Usuario" requerido>
              <Entrada
                value={usuario}
                onChange={(evento) => setUsuario(evento.target.value)}
                autoComplete="username"
                placeholder="admin"
                required
              />
            </Campo>

            <Campo etiqueta="Contraseña" requerido>
              <Entrada
                type="password"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </Campo>
          </div>

          <div style={{ marginTop: 18 }}>
            <Boton tipo="submit" variante="primario" className="boton--bloque" cargando={cargando}>
              {cargando ? 'Validando…' : 'Entrar'}
            </Boton>
          </div>

          <div className="credenciales">
            <div className="credenciales__titulo">Cuentas de prueba</div>
            <div className="credenciales__fila">
              <span className="mono">admin / Admin2026!</span>
              <button type="button" onClick={() => cambiarTipo('empleado')}>
                usar
              </button>
            </div>
            <div className="credenciales__fila">
              <span className="mono">cliente.demo / Cliente2026!</span>
              <button type="button" onClick={() => cambiarTipo('cliente')}>
                usar
              </button>
            </div>
          </div>

          <div style={{ marginTop: 18, textAlign: 'center' }} className="texto-pequeno">
            ¿Eres cliente y aún no tienes cuenta?{' '}
            <button type="button" className="enlace" onClick={onIrRegistro}>
              Crear cuenta
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
