import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#040507",
        foreground: "#f3f4f6"
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0, 0, 0, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
