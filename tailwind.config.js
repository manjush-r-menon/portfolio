module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("@tailwindcss/typography")],
  theme: {
    extend: {
      fontSize: {
        xs: ["0.8125rem", "1.5rem"],
        sm: ["0.875rem", "1.5rem"],
        base: ["1rem", "1.75rem"],
        lg: ["1.125rem", "1.75rem"],
        xl: ["1.25rem", "2rem"],
        "2xl": ["1.5rem", "2rem"],
        "3xl": ["1.875rem", "2.25rem"],
        "4xl": ["2rem", "2.5rem"],
        "5xl": ["3rem", "3.5rem"],
        "6xl": ["3.75rem", "1"],
        "7xl": ["4.5rem", "1"],
        "8xl": ["6rem", "1"],
        "9xl": ["8rem", "1"],
      },
    },
  },
};
