/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#f3fbf6",
        "surface-bright": "#f3fbf6",
        "surface-dim": "#d3dcd7",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#edf6f1",
        "surface-container": "#e7f0eb",
        "surface-container-high": "#e2eae5",
        "surface-container-highest": "#dce4e0",
        "on-surface": "#151d1a",
        "on-surface-variant": "#424844",
        "inverse-surface": "#2a322f",
        "inverse-on-surface": "#eaf3ee",
        
        "primary": "#172a22",
        "on-primary": "#ffffff",
        "primary-container": "#2d4037",
        "on-primary-container": "#96aba0",
        "primary-fixed": "#d2e8db",
        "primary-fixed-dim": "#b6ccbf",
        
        "secondary": "#496454",
        "on-secondary": "#ffffff",
        "secondary-container": "#cbead5",
        "on-secondary-container": "#4f6a5a",
        "secondary-fixed": "#cbead5",
        "secondary-fixed-dim": "#afceba",
        
        "tertiary": "#3b1f00",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#56340e",
        "on-tertiary-container": "#cd9d6d",
        
        "outline": "#737874",
        "outline-variant": "#c2c8c3",
        "surface-tint": "#4f6359",
        "background": "#f3fbf6",
        
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a"
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        headline: ["'Playfair Display'", "serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
        label: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
      }
    },
  },
  plugins: [],
};
