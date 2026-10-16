import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: {
          300: "#F5DC9E",
          400: "#ECC87B",
          500: "#E5C07B",
          600: "#CCA055",
          DEFAULT: "#E5C07B",
        },
        surface: {
          950: "#070709",
          900: "#0C0C10",
          850: "#101015",
          800: "#15151D",
          700: "#1E1E28",
          600: "#2B2B38",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
