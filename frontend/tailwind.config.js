/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./componenets/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          lighter: "#209AAB",
          darker: "#0D3E45",
        },
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
}