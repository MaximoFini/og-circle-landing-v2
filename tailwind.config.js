/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Now Var"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        yellow: {
          400: '#f5b813',
          500: '#d99e00',
        },
      },
    },
  },
  plugins: [],
};
