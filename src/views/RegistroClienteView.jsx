import { useState } from 'react'
import { api } from '../api'
import { Alerta, Boton, Campo, Entrada, Icono, Seleccion } from '../ui'

const FORMULARIO_INICIAL = {
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

export default function RegistroClienteView({ onVolver, onIngresar }) {
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const esParticular = formulario.tipo === 'particular'

  function actualizar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setCargando(true)

    const cuerpo = {
      tipo: formulario.tipo,
      nombreUsuario: formulario.nombreUsuario.trim(),
      contrasena: formulario.contrasena,
      razonSocial: formulario.razonSocial.trim(),
      ci: esParticular ? formulario.ci.trim() : null,
      nit: esParticular ? null : formulario.nit.trim(),
      telefono: formulario.telefono.trim() || null,
      correo: formulario.correo.trim() || null,
      preferidoCanal: formulario.preferidoCanal,
    }

    try {
      await api.autorregistro(cuerpo)
      const sesion = await api.login(cuerpo.nombreUsuario, cuerpo.contrasena, 'cliente')
      onIngresar(sesion)
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
              <span className="marca__detalle">Clientes</span>
            </div>
          </div>

          <h1 className="acceso__titulo">Crea tu cuenta y consulta tus compras.</h1>
          <p className="acceso__bajada">
            El registro crea tu cuenta de acceso y tu ficha de cliente en un solo paso.
            Después podrás ver tus compras, pedidos y pagos.
          </p>

          <ul className="acceso__lista">
            <li>
              <Icono nombre="check" tamano={15} />
              Registro para personas particulares y empresas
            </li>
            <li>
              <Icono nombre="check" tamano={15} />
              Un identificador de acceso por cuenta
            </li>
            <li>
              <Icono nombre="check" tamano={15} />
              Historial propio, sin acceso a datos de otros clientes
            </li>
          </ul>
        </div>

        <p className="acceso__pie">Proyecto BajoCero · API ASP.NET Core + React</p>
      </aside>

      <main className="acceso__panel">
        <form className="acceso__formulario" onSubmit={enviar}>
          <h1>Crear cuenta</h1>
          <p className="acceso__subtitulo">Completa tus datos para registrarte como cliente.</p>

          {error && (
            <div style={{ marginBottom: 14 }}>
              <Alerta tono="error">{error}</Alerta>
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

          <div className="form-grid">
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

            <Campo etiqueta="Contraseña" requerido ayuda="Mínimo 8 caracteres, con letras y números.">
              <Entrada
                type="password"
                value={formulario.contrasena}
                onChange={(evento) => actualizar('contrasena', evento.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </Campo>

            <Campo etiqueta={esParticular ? 'Nombre completo' : 'Razón social'} requerido>
              <Entrada
                value={formulario.razonSocial}
                onChange={(evento) => actualizar('razonSocial', evento.target.value)}
                placeholder={esParticular ? 'María López' : 'Comercial El Sol SRL'}
                required
                maxLength={150}
              />
            </Campo>

            {esParticular ? (
              <Campo etiqueta="CI" requerido>
                <Entrada
                  value={formulario.ci}
                  onChange={(evento) => actualizar('ci', evento.target.value)}
                  placeholder="55556666"
                  required
                  maxLength={30}
                />
              </Campo>
            ) : (
              <Campo etiqueta="NIT" requerido>
                <Entrada
                  value={formulario.nit}
                  onChange={(evento) => actualizar('nit', evento.target.value)}
                  placeholder="1020304050"
                  required
                  maxLength={30}
                />
              </Campo>
            )}

            <div className="form-grid form-grid--2">
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

            <Campo etiqueta="Canal preferido" ayuda="Solo informativo para la demo.">
              <Seleccion
                value={formulario.preferidoCanal}
                onChange={(evento) => actualizar('preferidoCanal', evento.target.value)}
              >
                <option value="correo">Correo</option>
                <option value="telefono">Teléfono</option>
                <option value="whatsapp">WhatsApp</option>
              </Seleccion>
            </Campo>
          </div>

          <div className="form-acciones">
            <Boton variante="fantasma" onClick={onVolver}>
              Volver
            </Boton>
            <Boton tipo="submit" variante="primario" cargando={cargando}>
              {cargando ? 'Creando cuenta…' : 'Crear cuenta y entrar'}
            </Boton>
          </div>
        </form>
      </main>
    </div>
  )
}
