/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Fira Code", "monospace"],
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px #2dd4bf" },
          "50%": { boxShadow: "0 0 20px #2dd4bf" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      animation: {
        glow: "glow 2s ease-in-out infinite",
        fadeIn: "fadeIn 0.5s ease-out",
        scaleIn: "scaleIn 0.3s ease-out",
      },
      boxShadow: {
        glow: "0 0 15px rgba(45, 212, 191, 0.4), 0 0 5px rgba(45, 212, 191, 0.2)",
      },
    },
  },
  plugins: [],
};
