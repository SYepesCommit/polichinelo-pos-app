export type ModuloTipo = 'pos' | 'pedidos' | 'productos' | 'gastos' | 'reportes'

export interface DashboardViewProps {
  onSelectModulo: (modulo: ModuloTipo) => void
}