/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0065ff'
      },
      fontFamily: {
        title: ['PaytoneOne-Regular', 'sans-serif'],
        'text-regular': ['Lato-Regular', 'sans-serif'],
        'text-light': ['Lato-Light', 'sans-serif'],
        'text-semibold': ['Lato-Bold', 'sans-serif'],
        'text-bold': ['Lato-Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
