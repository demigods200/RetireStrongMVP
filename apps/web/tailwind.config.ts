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
        base: ["18px", { lineHeight: "1.7" }],
        lg: ["20px", { lineHeight: "1.7" }],
        xl: ["24px", { lineHeight: "1.6" }],
        "2xl": ["28px", { lineHeight: "1.5" }],
        "3xl": ["32px", { lineHeight: "1.4" }],
        "4xl": ["36px", { lineHeight: "1.3" }],
        "5xl": ["42px", { lineHeight: "1.2" }],
      },
      colors: {
        // High contrast colors for accessibility
        primary: {
          DEFAULT: "#0066CC",
          dark: "#004499",
          light: "#3385D6",
          50: "#E6F2FF",
          100: "#CCE5FF",
          200: "#99CBFF",
          300: "#66B0FF",
          400: "#3396FF",
          500: "#0066CC",
          600: "#0052A3",
          700: "#003D7A",
          800: "#002952",
          900: "#001429",
        },
      },
      spacing: {
        // Larger touch targets (minimum 44x44px)
        touch: "44px",
        // Consistent spacing scale
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "soft": "0 2px 8px 0 rgba(0, 0, 0, 0.08)",
        "medium": "0 4px 16px 0 rgba(0, 0, 0, 0.12)",
        "large": "0 8px 24px 0 rgba(0, 0, 0, 0.16)",
        "primary": "0 4px 16px 0 rgba(0, 102, 204, 0.2)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
      },
    },
  },
  plugins: [],
};

export default config;
