/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      colors: {
        paper: '#FAF9F6',
        'paper-dark': '#F0EFE9',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-slide': 'fadeSlide 0.4s ease-out forwards',
        'pulse-ring': 'pulse-ring 3s cubic-bezier(0.24, 0, 0.38, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeSlide: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.4' },
          '50%': { opacity: '0' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}