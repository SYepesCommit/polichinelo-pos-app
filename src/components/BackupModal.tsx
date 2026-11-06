import React from 'react'
import {
  CloudUpload,
  FolderOpen,
  HardDriveDownload,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Database,
} from 'lucide-react'
import { BackupModalProps } from '@/types/backup/backup.types'
import { useBackupModal } from '@/hooks/backup/useBackupModal'

export const BackupModal: React.FC<BackupModalProps> = ({ onCerrar }) => {
  const {
    estado,
    cargando,
    ejecutandoManual,
    mensajeExito,
    mensajeError,
    handleSeleccionarCarpeta,
    handleToggleAutoJuevesADomingo,
    handleCrearBackupManual,
    handleAbrirCarpeta,
    formatearFechaLegible,
    formatearTamano,
  } = useBackupModal()

  const autoActivo = estado?.config.autoJuevesADomingo ?? true

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* CABECERA */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                Copias de Seguridad (Base de Datos / Google Drive)
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                Respaldo automático de Jueves a Domingo y copias manuales en cualquier momento
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scrollbar">
          {/* ALERTAS DE ÉXITO O ERROR */}
          {mensajeExito && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{mensajeExito}</span>
            </div>
          )}

          {mensajeError && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{mensajeError}</span>
            </div>
          )}

          {/* 1. CARPETA DESTINO (GOOGLE DRIVE FOR DESKTOP / LOCAL) */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4" />
                Carpeta de Destino (Sincronización con Google Drive)
              </span>
              <button
                type="button"
                onClick={handleAbrirCarpeta}
                className="text-[11px] font-bold text-slate-300 hover:text-amber-300 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-amber-500/40 transition active:scale-95"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Abrir en Windows</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 break-all">
              {cargando ? 'Cargando ruta...' : estado?.config.carpetaDestino}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                En el PC del negocio, instala <strong>Google Drive para Escritorio</strong> y selecciona aquí su carpeta para que cada backup suba solo a la nube.
              </p>
              <button
                type="button"
                onClick={handleSeleccionarCarpeta}
                className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-extrabold shrink-0 transition active:scale-95"
              >
                Cambiar Carpeta Destino
              </button>
            </div>
          </div>

          {/* 2. PROGRAMACIÓN AUTOMÁTICA (JUEVES A DOMINGO) Y ACCIÓN MANUAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-purple-400" />
                    Auto-Backup (Jue - Dom)
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleAutoJuevesADomingo}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition active:scale-95 border ${
                      autoActivo
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {autoActivo ? 'ACTIVO' : 'PAUSADO'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  De <strong>jueves a domingo</strong> crea una carpeta por fin de semana (<code>FinDeSemana_Jueves_al_Domingo</code>) con 1 archivo por noche, actualizándolo al abrir, cada 30 min y al cerrar.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">
                  Hoy ({estado?.nombreDiaHoy || '...'}):
                </span>
                <span
                  className={`font-black ${
                    estado?.esDiaAutoBackup ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {estado?.esDiaAutoBackup
                    ? 'Día incluido en ciclo Jue-Dom'
                    : 'Fuera de ciclo (Solo manual)'}
                </span>
              </div>
            </div>

            {/* RESPALDO MANUAL */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1.5">
                  <HardDriveDownload className="w-4 h-4" />
                  Respaldo Manual Instantáneo
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Último backup:{' '}
                  <strong className="text-slate-200">
                    {formatearFechaLegible(estado?.config.ultimoBackupFecha)}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                disabled={ejecutandoManual}
                onClick={handleCrearBackupManual}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4" />
                <span>
                  {ejecutandoManual ? 'Generando Copia...' : 'Crear Backup Manual Ahora'}
                </span>
              </button>
            </div>
          </div>

          {/* 3. HISTORIAL DE ARCHIVOS EN LA CARPETA */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              Últimas Copias Guardadas en la Carpeta ({estado?.archivosRecientes.length || 0})
            </span>

            {!estado?.archivosRecientes || estado.archivosRecientes.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-bold">
                Aún no hay archivos de respaldo en esta carpeta. Toca "Crear Backup Manual Ahora" para generar el primero.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {estado.archivosRecientes.map((item) => (
                  <div
                    key={item.nombre}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-bold text-slate-200 truncate">{item.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400 font-semibold">
                      <span>{formatearTamano(item.tamanoBytes)}</span>
                      <span>{formatearFechaLegible(item.fechaModificacion)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PIE DEL MODAL */}
        <div className="pt-3 border-t border-slate-800 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-extrabold transition active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
