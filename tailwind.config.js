/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        hemplifier: {
          light: '#F5F2EB',
          dark: '#051009',
          accent: '#D6D1C7',
          text: '#1A4D2E',
          muted: '#5D5A53',
          stone: '#A8A29E',
        }
      },
      animation: {
        'blob': 'blob 10s infinite',
        'fade-in-up': 'fade-in-up 1s cubic-bezier(0.2, 1, 0.3, 1) forwards',
        'spin-slow': 'spin 15s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#5D5A53',
            a: {
              color: '#1A4D2E',
              '&:hover': {
                color: '#0d2617',
              },
            },
          },
        },
      },
    }
  },
  plugins: [],
}
