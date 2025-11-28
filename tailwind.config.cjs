/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1fb6ff',
        accent: '#ff6b6b'
      }
    }
  },
  plugins: []
};
