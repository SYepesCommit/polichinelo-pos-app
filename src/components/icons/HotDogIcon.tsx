import React from 'react'

interface IconProps {
  className?: string
}

export const HotDogIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Pan de perro caliente / Bun */}
    <path d="M4 11c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4" />
    <path d="M2 13c0 2.2 1.8 4 4 4h12c2.2 0 4-1.8 4-4" />
    {/* Salchicha sobresaliente */}
    <path d="M3 12c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-1Z" />
    {/* Línea de mostaza/salsa zig-zag */}
    <path d="M6 12.5c1 1 2-1 3 0s2-1 3 0 2-1 3 0 2-1 3 0" strokeWidth="1.5" />
  </svg>
)