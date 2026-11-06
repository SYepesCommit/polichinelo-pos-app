import React from 'react'

interface LoadingScreenProps {
  mensaje?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  mensaje = 'Cargando información...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4 animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center">
        {/* Anillo exterior animado con destello rojo */}
        <div className="absolute w-20 h-20 rounded-full bg-red-500/20 animate-ping opacity-75" />

        {/* Contenedor idéntico al logo de la cabecera */}
        <div className="relative w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center p-2 shadow-lg shadow-red-500/30 overflow-hidden">
          <img
            src="/logoPoli.png"
            alt="Logo Polichinelo"
            className="w-full h-full object-contain filter drop-shadow animate-pulse"
          />
        </div>
      </div>

      {/* TEXTO DE CARGA */}
      <div className="text-center">
        <p className="text-xs font-black text-slate-200 uppercase tracking-widest animate-pulse">
          {mensaje}
        </p>
        <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
          Por favor espera un momento
        </span>
      </div>
    </div>
  )
}