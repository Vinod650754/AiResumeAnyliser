/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#050816',
        panel: '#0b1120',
        glow: '#5eead4',
        accent: '#60a5fa',
        roseglow: '#fb7185'
      },
      boxShadow: {
        neon: '0 0 0 1px rgba(148,163,184,.15), 0 20px 60px rgba(15,23,42,.45), 0 0 40px rgba(96,165,250,.18)'
      },
      fontFamily: {
        display: ['Instrument Serif', 'serif'],
        body: ['Barlow', 'sans-serif']
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
