import React from 'react'
import {
  DollarSign,
  Banknote,
  Smartphone,
  TrendingDown,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Eye,
  Trophy,
  Wallet,
  CupSoda,
  Printer,
} from 'lucide-react'
import { VentasMetricsProps } from '@/types/ventas/ventas.types'

export const VentasMetrics: React.FC<VentasMetricsProps> = ({
  metricas,
  totalGastos,
  totalGastosEfectivo = 0,
  totalGastosTransferencia = 0,
  efectivoEsperado,
  formatMoneda,
  handleAbrirDetalleGastos,
  handleAbrirRankingProductos,
  handleAbrirDesgloseBancos,
  handleAbrirLiquidacionDomicilios,
}) => {
  const rankingPlatos = (metricas.rankingProductos || []).filter((p) => !p.esBebida)
  const rankingBebidas = (metricas.rankingProductos || []).filter((p) => p.esBebida)

  const top1Plato =
    rankingPlatos.length > 0
      ? rankingPlatos[0]
      : metricas.rankingProductos && metricas.rankingProductos.length > 0
      ? metricas.rankingProductos[0]
      : null
  const top1Bebida = rankingBebidas.length > 0 ? rankingBebidas[0] : null

  const totalUnidades = metricas.totalUnidadesVendidas || 0
  const totalPlatosUnds =
    metricas.totalUnidadesPlatos !== undefined
      ? metricas.totalUnidadesPlatos
      : rankingPlatos.reduce((acc, p) => acc + p.cantidadVendida, 0)
  const totalBebidasUnds =
    metricas.totalUnidadesBebidas !== undefined
      ? metricas.totalUnidadesBebidas
      : rankingBebidas.reduce((acc, p) => acc + p.cantidadVendida, 0)
  const totalBebidasMonto =
    metricas.totalMontoBebidas !== undefined
      ? metricas.totalMontoBebidas
      : rankingBebidas.reduce((acc, p) => acc + p.totalGenerado, 0)
  const totalDomiciliosMonto = metricas.totalDomiciliosMonto || 0

  return (
    <div className="mb-5">
      {/* FILA 1: MÉTRICAS DE DINERO Y ARQUEO */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-amber-400" /> Total Facturado
          </span>
          <span className="text-xl font-black text-amber-400 mt-1">
            ${formatMoneda(metricas.totalMonto || 0)}
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5 text-emerald-400" /> Efvo. Ventas
          </span>
          <span className="text-xl font-black text-emerald-400 mt-1">
            ${formatMoneda(metricas.totalEfectivo || 0)}
          </span>
        </div>

        {/* TARJETA INTERACTIVA DE BANCOS (DESGLOSE POR ENTIDAD) */}
        <div
          onClick={handleAbrirDesgloseBancos}
          className="bg-slate-900 border border-purple-500/30 hover:border-purple-400/70 bg-purple-500/5 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition group shadow-sm active:scale-[0.98]"
          title="Toca para ver cuánto entró a cada banco (Nequi, Bancolombia, etc.)"
        >
          <span className="text-[10px] font-extrabold text-purple-300 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" /> Bancos / Transf.
            </span>
            <Eye className="w-3.5 h-3.5 text-purple-400/50 group-hover:text-purple-300 transition" />
          </span>
          <span className="text-xl font-black text-purple-300 mt-1">
            ${formatMoneda(metricas.totalBancos || 0)}
          </span>
          {metricas.desgloseBancos && metricas.desgloseBancos.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-purple-500/20">
              {metricas.desgloseBancos.map((b) => (
                <span
                  key={b.bancoId}
                  className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-200 border border-purple-500/30"
                >
                  {b.nombre}: ${formatMoneda(b.totalMonto)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* TARJETA INTERACTIVA DE SALIDAS DE DINERO */}
        <div
          onClick={handleAbrirDetalleGastos}
          className="bg-slate-900 border border-rose-900/50 hover:border-rose-500/60 bg-rose-950/20 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition group shadow-sm active:scale-[0.98]"
          title="Toca para ver el detalle de salidas"
        >
          <span className="text-[10px] font-extrabold text-rose-400 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Salidas / Gastos
            </span>
            <Eye className="w-3.5 h-3.5 text-rose-400/50 group-hover:text-rose-400 transition" />
          </span>
          <span className="text-xl font-black text-rose-400 mt-1">
            -${formatMoneda(totalGastos || 0)}
          </span>
          {totalGastos > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-rose-500/20">
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-200 border border-rose-500/30">
                Caja: -${formatMoneda(totalGastosEfectivo)}
              </span>
              {totalGastosTransferencia > 0 && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-200 border border-purple-500/30">
                  Transf: -${formatMoneda(totalGastosTransferencia)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* EFECTIVO ESPERADO EN CAJA */}
        <div className="bg-slate-900 border border-amber-500/30 bg-amber-500/5 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-amber-300 uppercase flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-amber-400" /> Efvo. en Caja
          </span>
          <span className="text-xl font-black text-slate-100 mt-1">
            ${formatMoneda(efectivoEsperado)}
          </span>
        </div>
      </div>

      {/* FILA 2: MÉTRICAS OPERATIVAS, DOMICILIOS Y PRODUCTOS MÁS VENDIDOS */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between min-w-[175px]">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Pedidos Activos
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <UtensilsCrossed className="w-3 h-3" /> {metricas.mesas || 0} Mesa
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" /> {metricas.llevar || 0} Llevar
            </span>
          </div>
        </div>

        {/* TARJETA DE DOMICILIOS CON TOTAL DE ENVÍOS PARA LIQUIDAR DOMICILIARIOS */}
        <div
          onClick={handleAbrirLiquidacionDomicilios}
          className="bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/60 rounded-2xl p-3 flex flex-col justify-between min-w-[215px] cursor-pointer transition group shadow-sm active:scale-[0.98]"
          title="Toca para generar e imprimir el ticket de liquidación para el domiciliario"
        >
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-emerald-400" />
              <span>Domicilios</span>
            </span>
            <span className="text-[9px] font-bold text-emerald-300/80 group-hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
              <Printer className="w-3 h-3 text-emerald-400" />
              <span>Ticket Repartidor</span>
            </span>
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-black text-emerald-400 flex items-center gap-1.5">
              <span>{metricas.domicilios || 0}</span>
              <span className="text-xs font-bold text-slate-400">despachados</span>
            </span>
            <span className="text-xs font-black text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md">
              ${formatMoneda(totalDomiciliosMonto)} en envíos
            </span>
          </div>
        </div>

        {/* TARJETA INTERACTIVA DE PRODUCTOS Y BEBIDAS VENDIDAS */}
        <div
          onClick={handleAbrirRankingProductos}
          className="flex-1 min-w-[260px] bg-slate-900 border border-amber-500/30 hover:border-amber-500/70 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition group shadow-sm active:scale-[0.99]"
          title="Toca para abrir el ranking de productos y el cuadre de bebidas / categorías"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Productos Vendidos ({totalPlatosUnds} platos
                {totalBebidasUnds > 0
                  ? ` · ${totalBebidasUnds} beb.`
                  : totalUnidades > 0 && totalPlatosUnds === 0
                  ? `${totalUnidades} unds`
                  : ''}
                )
              </span>
            </span>

            <div className="flex items-center gap-2">
              {totalBebidasUnds > 0 && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <CupSoda className="w-3 h-3 text-cyan-400" />
                  <span>
                    Bebidas: {totalBebidasUnds} (${formatMoneda(totalBebidasMonto)})
                  </span>
                </span>
              )}
              <span className="text-[10px] font-bold text-amber-300/80 group-hover:text-amber-300 flex items-center gap-1">
                <span>Ver Top</span>
                <Eye className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {top1Plato ? (
            <div className="flex items-center justify-between gap-3 mt-1.5">
              <span className="text-xs font-black text-slate-100 truncate">
                🥇 {top1Plato.nombre}
                {top1Bebida && top1Bebida.nombre !== top1Plato.nombre && (
                  <span className="text-[10px] font-bold text-cyan-300 ml-2">
                    · 🥤 {top1Bebida.nombre} ({top1Bebida.cantidadVendida})
                  </span>
                )}
              </span>
              <span className="text-xs font-black text-amber-400 shrink-0 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                {top1Plato.cantidadVendida}{' '}
                {top1Plato.cantidadVendida === 1 ? 'vendido' : 'vendidos'} · $
                {formatMoneda(top1Plato.totalGenerado)}
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-500 mt-1">
              Sin platos ni bebidas vendidas en este período
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
