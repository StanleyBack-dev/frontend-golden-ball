/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Near-black surfaces, from page background (950) up to raised cards.
        ink: {
          950: "#07070a",
          900: "#0d0d12",
          850: "#121218",
          800: "#18181f",
          700: "#22222b",
          600: "#2e2e3a",
          500: "#464656",
        },
        gold: {
          100: "#fbf1d0",
          200: "#f7e2a0",
          300: "#f2d06b",
          400: "#e9b949",
          500: "#d4a12a",
          600: "#b3831b",
          700: "#8a6414",
        },
        ember: {
          400: "#ff9a3c",
          500: "#f97316",
          600: "#ea580c",
        },
      },
      fontFamily: {
        display: ['"Oswald Variable"', "Oswald", "system-ui", "sans-serif"],
        sans: ['"Inter Variable"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(233,185,73,0.35), 0 10px 40px -10px rgba(233,185,73,0.35)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #f7e2a0 0%, #e9b949 40%, #f97316 100%)",
      },
    },
  },
  plugins: [],
};
