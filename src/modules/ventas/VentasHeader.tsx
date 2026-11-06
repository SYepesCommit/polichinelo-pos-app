import React from 'react'
import { FileText, MinusCircle, Calendar, CalendarRange, RotateCcw, Download } from 'lucide-react'
import { VentasHeaderProps } from '@/types/ventas/ventas.types'

export const VentasHeader: React.FC<VentasHeaderProps> = (props) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-400" />
          <span>Histórico y Arqueo</span>
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Auditoría de tiquetes, salidas de dinero y cierre de turno.
        </p>

        {/* BOTONES DE ACCIÓN DE CAJA */}
        <div className="flex items-center gap-2.5 mt-4 flex-wrap">
          <button
            type="button"
            onClick={() => props.setModalGastoAbierto(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 text-rose-400 rounded-xl text-xs font-bold transition active:scale-95"
          >
            <MinusCircle className="w-4 h-4" />
            <span>Registrar Salida</span>
          </button>

          <button
            type="button"
            onClick={props.handleExportarCsv}
            disabled={props.exportandoCsv || props.cargando}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50"
            title="Descargar reporte completo en Excel (.csv)"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{props.exportandoCsv ? 'Exportando...' : 'Exportar Excel (.csv)'}</span>
          </button>
        </div>
      </div>

      {/* CONTROLES DE FECHA TÁCTIL */}
      <div className="flex flex-col gap-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mr-1">
            Rango Rápido:
          </span>
          <button
            type="button"
            onClick={props.handleIrAHoy}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-amber-400 font-extrabold text-xs transition active:scale-95"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={props.handleIrAAyer}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 font-bold text-xs transition active:scale-95"
          >
            Ayer
          </button>
          <button
            type="button"
            onClick={props.handleIrAEstaSemana}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 font-bold text-xs transition active:scale-95"
          >
            Esta Semana
          </button>
          <button
            type="button"
            onClick={props.handleIrAEsteMes}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 font-bold text-xs transition active:scale-95"
          >
            Este Mes
          </button>
          <button
            type="button"
            onClick={props.recargarVentas}
            disabled={props.cargando}
            className="p-1.5 ml-auto rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 transition active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${props.cargando ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => props.setModoFecha('UNICA')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                props.modoFecha === 'UNICA'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Día Único
            </button>
            <button
              type="button"
              onClick={() => props.setModoFecha('RANGO')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                props.modoFecha === 'RANGO'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rango
            </button>
          </div>
          {props.modoFecha === 'UNICA' ? (
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-amber-400 absolute left-3 pointer-events-none" />
              <input
                type="date"
                value={props.fechaUnica}
                onChange={(e) => props.setFechaUnica(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="relative flex items-center">
                <CalendarRange className="w-4 h-4 text-amber-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={props.fechaInicio}
                  onChange={(e) => props.setFechaInicio(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl pl-8 pr-2 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>
              <span className="text-slate-600 text-xs">-</span>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-amber-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={props.fechaFin}
                  onChange={(e) => props.setFechaFin(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl pl-8 pr-2 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
