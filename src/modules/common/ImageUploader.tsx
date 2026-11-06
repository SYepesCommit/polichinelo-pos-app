import React, { useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'

interface ImageUploaderProps {
  imagenUrl?: string | null
  onImageSelected: (relativePath: string | null) => void
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ imagenUrl, onImageSelected }) => {
  const [preview, setPreview] = useState<string | null>(
    imagenUrl ? `pos-media://${imagenUrl}` : null
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !window.electronAPI) return

    const filePath = (file as any).path
    const result = await window.electronAPI.uploadProductImage({
      filePath,
      fileName: file.name
    })

    if (result.success && result.relativePath) {
      setPreview(`pos-media://${result.relativePath}`)
      onImageSelected(result.relativePath)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageSelected(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Imagen del producto
      </label>

      {preview ? (
        <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group">
          <img src={preview} alt="Producto" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-xl bg-red-500/80 text-white hover:bg-red-600 transition backdrop-blur-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-700 hover:border-red-500/50 bg-slate-900/50 hover:bg-slate-900 flex flex-col items-center justify-center cursor-pointer transition text-slate-400 hover:text-slate-200 gap-2">
          <ImagePlus className="w-6 h-6 text-red-500" />
          <span className="text-[10px] font-bold">Subir Foto</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      )}
    </div>
  )
}