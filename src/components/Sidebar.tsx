import React, { useState } from 'react'
import { BookOpen, Sun, Moon } from 'lucide-react'
import { SidebarProps } from '../types/sidebar'
import { MENU_ITEMS } from '../config/navigation'
import { useTheme } from '../context/ThemeContext'
import logoPolichinelo from '@/assets/logoPoli.png'
import packageInfo from '../../package.json'
import { ManualUsuarioModal } from './ManualUsuarioModal'

export const Sidebar: React.FC<SidebarProps> = ({ moduloActivo, setModuloActivo }) => {
  const [itemPresionado, setItemPresionado] = useState<string | null>(null)
  const [manualAbierto, setManualAbierto] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="w-20 bg-slate-950 border-r border-slate-800 flex flex-col justify-between items-center py-6 h-screen select-none z-20 shrink-0">
      {/* BRANDING / LOGO COMPACTO POLICHINELO */}
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="w-12 h-12 rounded-2xl bg-red-500 hover:bg-red-600 flex items-center justify-center p-1.5 shadow-lg shadow-red-500/30 cursor-pointer transition-transform active:scale-95 overflow-hidden">
          <img
            src={logoPolichinelo}
            alt="Logo Polichinelo"
            className="w-full h-full object-contain filter drop-shadow"
          />
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="flex flex-col gap-4 w-full px-3">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            const esActivo = moduloActivo === item.id
            const estaPresionado = itemPresionado === item.id

            return (
              <button
                key={item.id}
                onClick={() => setModuloActivo(item.id)}
                onTouchStart={() => setItemPresionado(item.id)}
                onTouchEnd={() => setItemPresionado(null)}
                onMouseDown={() => setItemPresionado(item.id)}
                onMouseUp={() => setItemPresionado(null)}
                onMouseLeave={() => setItemPresionado(null)}
                className={`relative group w-full py-4 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                  esActivo
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 font-black scale-105'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="w-6 h-6" />

                {/* Etiqueta Flotante (Tooltip) */}
                <span
                  className={`absolute left-20 bg-slate-900 text-slate-100 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-2xl ${
                    estaPresionado
                      ? 'opacity-100 scale-100 translate-x-0'
                      : 'opacity-0 scale-95 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* FOOTER: MODO DÍA/NOCHE + MANUAL DE USO + VERSIÓN DISCRETA */}
      <div className="flex flex-col items-center justify-center gap-2 w-full px-3 select-none">
        {/* Switch Modo Día / Modo Noche */}
        <button
          type="button"
          onClick={toggleTheme}
          onTouchStart={() => setItemPresionado('tema')}
          onTouchEnd={() => setItemPresionado(null)}
          onMouseDown={() => setItemPresionado('tema')}
          onMouseUp={() => setItemPresionado(null)}
          onMouseLeave={() => setItemPresionado(null)}
          title={theme === 'dark' ? 'Cambiar a Modo Día' : 'Cambiar a Modo Noche'}
          className="relative group w-full py-3 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-amber-400 transition-all active:scale-95"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}

          <span
            className={`absolute left-20 bg-slate-900 text-slate-100 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-2xl ${
              itemPresionado === 'tema'
                ? 'opacity-100 scale-100 translate-x-0'
                : 'opacity-0 scale-95 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0'
            }`}
          >
            {theme === 'dark' ? 'Modo Día' : 'Modo Noche'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setManualAbierto(true)}
          title="Manual de Uso / Ayuda"
          className="relative group w-full py-3 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-amber-400 transition-all active:scale-95"
        >
          <BookOpen className="w-5 h-5" />
          <span className="absolute left-20 bg-slate-900 text-slate-100 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 opacity-0 scale-95 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
            Manual de Uso
          </span>
        </button>

        <span className="text-[10px] font-bold text-slate-500 tracking-wider opacity-50">
          v{packageInfo.version}
        </span>
      </div>

      {manualAbierto && <ManualUsuarioModal onCerrar={() => setManualAbierto(false)} />}
    </aside>
  )
}
