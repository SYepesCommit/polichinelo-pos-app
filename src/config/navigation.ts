import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  Receipt,
  ShoppingCart,
} from 'lucide-react'
import { MenuItem } from '../types/sidebar'
import { ModuloTipo } from '@/types/pos/dashboard.types'

export const MENU_ITEMS: readonly MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Caja POS', icon: UtensilsCrossed },
  { id: 'pedidos', label: 'Pedidos / Historico', icon: ShoppingBag },
  { id: 'productos', label: 'Productos', icon: Package }
] as const

export const modulosDashboardView = [
  {
    id: 'pos' as ModuloTipo,
    titulo: 'Nuevo Pedido (POS)',
    descripcion: 'Tomar comanda para mesa, llevar o domicilio',
    icono: ShoppingCart,
  },
  {
    id: 'pedidos' as ModuloTipo,
    titulo: 'Historico de ventas',
    descripcion: 'Estado y despachos del día',
    icono: Receipt,
  },
  {
    id: 'productos' as ModuloTipo,
    titulo: 'Catálogo de Productos',
    descripcion: 'Gestión de menú, precios y disponibilidad',
    icono: Package,
  }
]