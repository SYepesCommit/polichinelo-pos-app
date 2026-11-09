import { modulosDashboardView } from '@/config/navigation'
import { DashboardViewProps } from '@/types/pos/dashboard.types'
import { Lock, KeyRound, CloudUpload, RefreshCw, CheckCircle2, DownloadCloud, BookOpen } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { CambiarPinModal } from '@/components/CambiarPinModal'
import { BackupModal } from '@/components/BackupModal'
import { PinSupervisorModal } from '@/components/PinSupervisorModal'
import { ManualUsuarioModal } from '@/components/ManualUsuarioModal'
import packageInfo from '../../../package.json'

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectModulo }) => {
  const [modalCambiarPinAbierto, setModalCambiarPinAbierto] = useState(false)
  const [pidiendoPinBackup, setPidiendoPinBackup] = useState(false)
  const [modalBackupAbierto, setModalBackupAbierto] = useState(false)
  const [modalManualAbierto, setModalManualAbierto] = useState(false)

  // Estado del auto-updater
  const [infoUpdater, setInfoUpdater] = useState<{
    estado: 'idle' | 'comprobando' | 'disponible' | 'descargando' | 'descargada' | 'al-dia' | 'error'
    version?: string
    progreso?: number
  }>({ estado: 'idle' })

  useEffect(() => {
    if (window.electronAPI?.onUpdaterEstado) {
      const desuscribir = window.electronAPI.onUpdaterEstado((data) => {
        setInfoUpdater(data)
      })
      return desuscribir
    }
  }, [])

  const handleComprobarUpdates = async () => {
    if (window.electronAPI?.comprobarActualizaciones) {
      setInfoUpdater({ estado: 'comprobando' })
      await window.electronAPI.comprobarActualizaciones()
    }
  }

  const handleReiniciarParaActualizar = () => {
    if (window.electronAPI?.reiniciarEInstalarActualizacion) {
      window.electronAPI.reiniciarEInstalarActualizacion()
    }
  }

  return (
    <div className="h-full w-full flex flex-col justify-center items-center p-8 select-none">
      <div className="w-full max-w-7xl">
        {/* HEADER COMBINADO */}
        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-left">
            <h1 className="text-3xl font-black text-slate-100 tracking-wider uppercase">
              POLICHINELO <span className="text-amber-400">CAJA</span>
            </h1>
            <p className="text-slate-400 mt-1 font-semibold text-xs tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Centro de Control y Ventas
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setModalManualAbierto(true)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 text-xs font-extrabold uppercase tracking-wider transition active:scale-95 shadow-lg"
              title="Abrir guía paso a paso de uso del sistema"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Manual de Uso</span>
            </button>

            <button
              type="button"
              disabled={infoUpdater.estado === 'comprobando' || infoUpdater.estado === 'descargando'}
              onClick={
                infoUpdater.estado === 'descargada'
                  ? handleReiniciarParaActualizar
                  : handleComprobarUpdates
              }
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-extrabold uppercase tracking-wider transition active:scale-95 shadow-lg ${
                infoUpdater.estado === 'descargada'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30'
                  : infoUpdater.estado === 'descargando'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-sky-400'
              }`}
              title="Comprobar e instalar actualizaciones desde GitHub"
            >
              {infoUpdater.estado === 'comprobando' ? (
                <>
                  <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : infoUpdater.estado === 'descargando' ? (
                <>
                  <DownloadCloud className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Descargando ({infoUpdater.progreso}%)</span>
                </>
              ) : infoUpdater.estado === 'descargada' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instalar v{infoUpdater.version}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-sky-400" />
                  <span>Actualizaciones</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setPidiendoPinBackup(true)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 text-xs font-extrabold uppercase tracking-wider transition active:scale-95 shadow-lg"
            >
              <CloudUpload className="w-4 h-4 text-emerald-400" />
              <span>Backups / Drive</span>
            </button>

            <button
              type="button"
              onClick={() => setModalCambiarPinAbierto(true)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 text-xs font-extrabold uppercase tracking-wider transition active:scale-95 shadow-lg"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Cambiar PIN</span>
            </button>
          </div>
        </div>

        {/* GRID TÁCTIL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulosDashboardView.map((mod) => {
            const Icono = mod.icono
            const esProtegido = mod.id === 'pedidos' || mod.id === 'productos'

            return (
              <button
                key={mod.id}
                onClick={() => onSelectModulo(mod.id)}
                className="p-6 rounded-2xl border-l-4 border-l-amber-400 border-y border-r border-red-500/30 bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-900 shadow-xl shadow-red-500/5 cursor-pointer relative overflow-hidden touch-manipulation transition-transform duration-75 active:scale-95 active:bg-amber-500/10 text-left flex flex-col justify-between h-52 group"
              >
                <div className="flex justify-between items-start">
                  <div className="p-3.5 rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
                    <Icono className="w-7 h-7 stroke-[2.5]" />
                  </div>

                  {esProtegido ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border bg-amber-500/10 text-amber-300 border-amber-500/30 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      PIN
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border bg-red-500/20 text-red-400 border-red-500/40">
                      Libre
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-100 mb-1 flex items-center gap-2">
                    <span>{mod.titulo}</span>
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed">
                    {mod.descripcion}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* BARRA INFERIOR DE ESTADO / ACTUALIZACIONES */}
      <div className="w-full max-w-7xl mt-8 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
        <span className="font-mono">Polichinelo POS · v{packageInfo.version}</span>

        <div className="flex items-center gap-2">
          {infoUpdater.estado === 'comprobando' && (
            <span className="flex items-center gap-1.5 text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Buscando actualizaciones...</span>
            </span>
          )}

          {infoUpdater.estado === 'descargando' && (
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <DownloadCloud className="w-3.5 h-3.5 animate-bounce" />
              <span>Descargando v{infoUpdater.version} ({infoUpdater.progreso}%)</span>
            </span>
          )}

          {infoUpdater.estado === 'descargada' && (
            <button
              type="button"
              onClick={handleReiniciarParaActualizar}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold hover:bg-emerald-500/30 transition active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>v{infoUpdater.version} lista · Reiniciar para aplicar</span>
            </button>
          )}

          {infoUpdater.estado === 'al-dia' && (
            <span className="text-slate-400 font-semibold">Sistema al día</span>
          )}
        </div>
      </div>

      {modalCambiarPinAbierto && (
        <CambiarPinModal onCerrar={() => setModalCambiarPinAbierto(false)} />
      )}

      {pidiendoPinBackup && (
        <PinSupervisorModal
          titulo="Copias de Seguridad"
          descripcion="Ingresa el PIN de supervisor para gestionar los respaldos y la carpeta de Google Drive"
          onExito={() => {
            setPidiendoPinBackup(false)
            setModalBackupAbierto(true)
          }}
          onCancelar={() => setPidiendoPinBackup(false)}
        />
      )}

      {modalBackupAbierto && (
        <BackupModal onCerrar={() => setModalBackupAbierto(false)} />
      )}

      {modalManualAbierto && (
        <ManualUsuarioModal onCerrar={() => setModalManualAbierto(false)} />
      )}
    </div>
  )
}
