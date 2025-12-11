/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00b2e3',
          dark: '#008cb3',
          light: '#4dd2f5',
        },
        secondary: '#6c757d',
        'text-main': '#2d3748',
        'text-muted': '#718096',
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],      
       },
    },
  },
  plugins: [],
}
