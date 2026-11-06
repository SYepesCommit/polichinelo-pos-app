export interface BackupConfig {
  carpetaDestino: string
  autoJuevesADomingo: boolean
  ultimoBackupFecha?: string | null
  ultimoBackupArchivo?: string | null
  ultimoBackupTipo?: 'AUTOMATICO' | 'MANUAL' | null
}

export interface BackupArchivoItem {
  nombre: string
  rutaCompleta: string
  fechaModificacion: string
  tamanoBytes: number
}

export interface BackupEstadoRespuesta {
  config: BackupConfig
  esDiaAutoBackup: boolean
  nombreDiaHoy: string
  archivosRecientes: BackupArchivoItem[]
}

export interface BackupModalProps {
  onCerrar: () => void
}
