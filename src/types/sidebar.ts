import { LucideIcon } from 'lucide-react'

export type ModuloActivo = 
  | 'dashboard' 
  | 'pos' 
  | 'pedidos'
  | 'productos';

export interface MenuItem {
  id: ModuloActivo
  label: string
  icon: LucideIcon
}

export interface SidebarProps {
  moduloActivo: ModuloActivo
  setModuloActivo: (modulo: ModuloActivo) => void
}