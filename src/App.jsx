import { useState } from 'react'
import { borrarSesion, crearSesionDesdeLogin, guardarSesion, leerSesion } from './session'
import Backoffice from './views/Backoffice'
import LoginView from './views/LoginView'
import PortalCliente from './views/PortalCliente'
import RegistroClienteView from './views/RegistroClienteView'

export default function App() {
  const [sesion, setSesion] = useState(() => leerSesion())
  const [vista, setVista] = useState('login')

  function iniciarSesion(datos) {
    const nuevaSesion = crearSesionDesdeLogin(datos)
    guardarSesion(nuevaSesion)
    setSesion(nuevaSesion)
    setVista('login')
  }

  function salir() {
    borrarSesion()
    setSesion(null)
    setVista('login')
  }

  if (!sesion) {
    if (vista === 'registro') {
      return (
        <RegistroClienteView
          onVolver={() => setVista('login')}
          onIngresar={iniciarSesion}
        />
      )
    }

    return (
      <LoginView
        onIngresar={iniciarSesion}
        onIrRegistro={() => setVista('registro')}
      />
    )
  }

  if (sesion.tipo === 'cliente') {
    return <PortalCliente sesion={sesion} onSalir={salir} />
  }

  return <Backoffice sesion={sesion} onSalir={salir} />
}
