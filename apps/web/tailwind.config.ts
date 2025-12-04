import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 50+ friendly design: larger text, high contrast
      fontSize: {
        base: ["18px", { lineHeight: "1.6" }],
        lg: ["20px", { lineHeight: "1.6" }],
        xl: ["24px", { lineHeight: "1.5" }],
      },
      colors: {
        // High contrast colors for accessibility
        primary: {
          DEFAULT: "#0066CC",
          dark: "#004499",
          light: "#3385D6",
        },
      },
      spacing: {
        // Larger touch targets (minimum 44x44px)
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
