import React from 'react'

interface IconProps {
  className?: string
}

export const HamburgerIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Pan superior */}
    <path d="M3 11c0-3.87 3.13-7 7-7h4c3.87 0 7 3.13 7 7Z" />
    {/* Queso / Lechuga */}
    <path d="M3 11h18v2H3z" />
    {/* Carne */}
    <path d="M5 16h14" />
    {/* Pan inferior */}
    <path d="M4 19c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-1H4v1Z" />
    {/* Semillas sésamo */}
    <path d="M9 7h.01M15 7h.01M12 6h.01" strokeWidth="2.5" />
  </svg>
)