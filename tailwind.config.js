/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        blood: {
          DEFAULT: '#8B0000',
          light: '#DC143C',
          dark: '#5c0000',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#e5c048',
          dark: '#b8960f',
        },
        dragon: {
          DEFAULT: '#2A2A2A',
          light: '#3a3a3a',
          dark: '#1a1a1a',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        noto: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'flame': 'flame 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-blood': 'linear-gradient(135deg, #8B0000, #DC143C)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37, #FFD700)',
        'gradient-dark': 'linear-gradient(180deg, #0D0D0D, #1a1a1a)',
      },
    },
  },
  plugins: [],
};
