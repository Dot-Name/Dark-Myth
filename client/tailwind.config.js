/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101010',
        charcoal: '#252321',
        taupe: '#A69A8C',
        stone: '#D7CFC4',
        ivory: '#F7F3EC',
        muted: '#77716B',
        line: '#E5DED4',
        blood: '#6D2529',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: { soft: '0 18px 40px -24px rgba(16,16,16,0.35)' },
    },
  },
  plugins: [],
};
