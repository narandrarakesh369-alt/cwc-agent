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
        cwc: {
          dark: "#0b0c10",
          card: "#12141a",
          border: "#1f242e",
          accent: "#ff4655", // Anime action red
          gold: "#e5b869",   // Indian royal gold
          cyber: "#00f0ff",  // Phygital QR cyan
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
