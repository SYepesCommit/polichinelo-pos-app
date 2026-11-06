import React, { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { DashboardView } from './modules/dashboard/DashboardView'
import { PosView } from './modules/pos/PosView'
import { ModuloActivo } from './types/sidebar'
import { VentasHistorialView } from './modules/ventas/VentasHistorialView'
import { ProductosView } from './modules/productos/ProductosView'
import { PinSupervisorModal } from './components/PinSupervisorModal'

// Módulos protegidos que exigen PIN para ingresar (información financiera, arqueos, carta)
const MODULOS_PROTEGIDOS: ModuloActivo[] = ['pedidos', 'productos']

export const App: React.FC = () => {
  const [moduloActivo, setModuloActivo] = useState<ModuloActivo>('dashboard')
  const [moduloPendiente, setModuloPendiente] = useState<ModuloActivo | null>(null)

  const handleIntentarCambioModulo = (nuevoModulo: ModuloActivo) => {
    // Si es POS o Dashboard no requiere autorización
    if (!MODULOS_PROTEGIDOS.includes(nuevoModulo)) {
      setModuloActivo(nuevoModulo)
      return
    }

    // Si ya estamos en el módulo no vuelve a pedir PIN
    if (moduloActivo === nuevoModulo) return

    // Solicitar PIN de supervisor
    setModuloPendiente(nuevoModulo)
  }

  const handlePinAutorizado = () => {
    if (moduloPendiente) {
      setModuloActivo(moduloPendiente)
      setModuloPendiente(null)
    }
  }

  const handleCancelarPin = () => {
    setModuloPendiente(null)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Sidebar Fijo a la Izquierda */}
      <Sidebar
        moduloActivo={moduloActivo}
        setModuloActivo={handleIntentarCambioModulo}
      />

      <main className="flex-1 h-screen overflow-hidden bg-slate-950">
        {moduloActivo === 'dashboard' && (
          <DashboardView onSelectModulo={(m) => handleIntentarCambioModulo(m as ModuloActivo)} />
        )}
        {moduloActivo === 'pos' && <PosView />}
        {moduloActivo === 'pedidos' && <VentasHistorialView />}
        {moduloActivo === 'productos' && <ProductosView />}
      </main>

      {/* MODAL DE BLOQUEO POR PIN PARA ACCEDER A HISTÓRICO / REPORTES / CONFIGURACIÓN */}
      {moduloPendiente && (
        <PinSupervisorModal
          titulo="Acceso Restringido"
          descripcion={`Ingresa el PIN de supervisor para ver ${
            moduloPendiente === 'pedidos'
              ? 'el Histórico de Ventas, Arqueo y Egresos'
              : 'el Catálogo de Productos y Costos'
          }`}
          onExito={handlePinAutorizado}
          onCancelar={handleCancelarPin}
        />
      )}
    </div>
  )
}

export default App
