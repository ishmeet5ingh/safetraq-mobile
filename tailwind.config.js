/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1D4ED8',
          secondary: '#0F766E',
          accent: '#38BDF8',
          live: '#16A34A',
          warning: '#F59E0B',
          danger: '#DC2626',
        },

        light: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          muted: '#EFF6FF',
          card: '#FFFFFF',
          text: '#0F172A',
          subtext: '#475569',
          border: '#E2E8F0',
          overlay: 'rgba(29, 78, 216, 0.78)',
          badge: 'rgba(255,255,255,0.16)',
          badgeBorder: 'rgba(255,255,255,0.22)',
          heroText: '#FFFFFF',
          heroSubtext: 'rgba(255,255,255,0.92)',
        },

        dark: {
          bg: '#020617',
          surface: '#0F172A',
          muted: '#111827',
          card: '#111827',
          text: '#F8FAFC',
          subtext: '#94A3B8',
          border: '#1E293B',
          overlay: 'rgba(15, 23, 42, 0.76)',
          badge: 'rgba(255,255,255,0.10)',
          badgeBorder: 'rgba(255,255,255,0.14)',
          heroText: '#FFFFFF',
          heroSubtext: 'rgba(255,255,255,0.86)',
        },
      },
      borderRadius: {
        '4xl': '32px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};