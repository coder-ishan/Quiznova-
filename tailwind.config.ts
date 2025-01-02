import type { Config } from "tailwindcss";

export default {
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
        light: {
          background: "#ffffff",
          foreground: "#000000",
        },
        dark: {
          background: "#000000",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
