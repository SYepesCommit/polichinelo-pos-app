/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Redefinición neutra de Slate con variables CSS
        slate: {
          950: 'var(--color-bg-app)',       // Fondo principal (#121212)
          900: 'var(--color-bg-card)',      // Tarjetas / Paneles / Sidebar (#1E1E1E)
          800: 'var(--color-border)',       // Bordes principales (#2C2C2C)
          700: 'var(--color-border-hover)', // Bordes hover (#3E3E3E)
          400: 'var(--color-text-muted)',   // Texto secundario
          200: 'var(--color-text-body)',    // Texto cuerpo
          100: 'var(--color-text-heading)', // Texto títulos
        },
        // Sobrescribimos Amber para que todas las clases bg-amber-400, text-amber-400 usen el Dorado Polichinelo
        amber: {
          300: '#FFC837', // Hover brillante
          400: '#FFB700', // Dorado/Amarillo principal Polichinelo
          500: '#E0A100', // Tono sombra / active
        },
        // Sobrescribimos Red para el Rojo Escarlata del logo Polichinelo
        red: {
          500: '#D3131B', // Rojo Escarlata principal
          600: '#B50F16', // Hover rojo
          900: '#520609', // Sombras/Badges oscuros
        },
      },
    },
  },
  plugins: [],
}