/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        mist: '#eef2ff',
        ember: '#c2410c',
        pine: '#0f766e',
        sand: '#fff7ed',
        primary: '#002244',
        sidebar: '#002244',
        fondo: '#F1F5F9',
        strongPrimary: '#4670e3',
        sidebarSelected: '#E2E8F0',
        actionButton: '#065F46',
        ownText: '#676464',
        giftRed: '#BC0000',
        giftYellow: '#FFE95C'
      },
      boxShadow: {
        panel: '0 18px 48px rgba(15, 23, 42, 0.12)',
      },
      fontFamily: {
        sans: ['Inter','Space Grotesk', 'Segoe UI', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

