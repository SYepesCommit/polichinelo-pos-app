import React from 'react'

interface IconProps {
  className?: string
}

export const PolichineloIcon: React.FC<IconProps> = ({ className = "w-9 h-9" }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* --- SOMBRERO DE ARLEQUÍN (Formas curvas y naturales) --- */}
      {/* Oreja/Curva Izquierda (Amarillo/Azul) */}
      <path
        d="M26 14C17 14 10 18 11 26C12 30 17 28 20 27C21 21 24 16 26 14Z"
        fill="#FFB700"
      />
      <path
        d="M21 16.5C16 18.5 12 21 13 25.5C14 27.5 17 26.5 19.5 25.5C20.5 21.5 21 18.5 21 16.5Z"
        fill="#1E3A8A"
      />

      {/* Oreja/Curva Derecha (Amarillo/Azul) */}
      <path
        d="M38 14C47 14 54 18 53 26C52 30 47 28 44 27C43 21 40 16 38 14Z"
        fill="#FFB700"
      />
      <path
        d="M43 16.5C48 18.5 52 21 51 25.5C50 27.5 47 26.5 44.5 25.5C43.5 21.5 43 18.5 43 16.5Z"
        fill="#1E3A8A"
      />

      {/* Punta Central caída (Rojo) */}
      <path
        d="M32 8C27 10 26 15 32 17C38 15 37 10 32 8Z"
        fill="#D3131B"
      />
      <path
        d="M32 8C33.5 10 35 11 36.5 11.5C36 12 34 13.5 32 17C30 13.5 28 12 27.5 11.5C29 11 30.5 10 32 8Z"
        fill="#1E3A8A"
      />

      {/* Cascabeles de las Puntas */}
      <circle cx="9.5" cy="26" r="1.8" fill="#FFFFFF" />
      <circle cx="54.5" cy="26" r="1.8" fill="#FFFFFF" />
      <circle cx="32" cy="7" r="1.8" fill="#FFFFFF" />

      {/* --- MÁSCARA / ROSTRO REDONDO (Evita forma de antorcha) --- */}
      <path
        d="M23 26C23 23 41 23 41 26C41 33 39 39 32 39C25 39 23 33 23 26Z"
        fill="#FFFFFF"
      />

      {/* Detalle de ojos de la máscara */}
      <circle cx="28" cy="29" r="1.2" fill="#0F0F0F" />
      <path
        d="M36 27L39 30L36 33L33 30L36 27Z"
        fill="#D3131B"
      />

      {/* Pequeña Sonrisa */}
      <path
        d="M28.5 34.5C29.5 35.5 34.5 35.5 35.5 34.5"
        stroke="#D3131B"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* --- CUELLO DE PUNTAS (Rompe la base vertical) --- */}
      <path
        d="M20 34L23 41L27 36L32 43L37 36L41 41L44 34H20Z"
        fill="#FFFFFF"
      />

      {/* Cascabeles colgantes del cuello */}
      <circle cx="21.5" cy="42" r="1.2" fill="#FFB700" />
      <circle cx="26.5" cy="41" r="1.2" fill="#FFB700" />
      <circle cx="32" cy="44" r="1.2" fill="#FFB700" />
      <circle cx="37.5" cy="41" r="1.2" fill="#FFB700" />
      <circle cx="42.5" cy="42" r="1.2" fill="#FFB700" />
    </svg>
  )
}