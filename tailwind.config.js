const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          primary: "#FF306E",
          black: "#000000",
          white: "#ffffff",
          black10: "rgba(0, 0, 0, 0.1)",
          black40: "rgba(0, 0, 0, 0.4)",
          black50: "rgba(0, 0, 0, 0.5)",
          gray100: "#A5A5A5",
        },
      },
      screens: {
        1440: "1440px",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
