/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E88E5',
        'kakao-blue': '#1E88E5',
        'kakao-dark': '#1976D2'
      }
    }
  },
  plugins: []
};
