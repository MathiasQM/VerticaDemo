/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./pages/**/*.{html,js}",
    "./components/**/*.{html,js}",
    "./layouts/**/*.{html,js}",
    "./src/**/*.js",
  ],
  darkMode: "class",
  theme: {
    screens: {
      xs: "320px", // Extra small devices
      sm: "480px", // Small devices
      smd: "640px", // Between small and medium
      md: "768px", // Medium devices
      lg: "976px", // Large devices
      mdxl: "1280px", // Between large and extra large
      xl: "1540px", // Extra large devices
      "2xl": "1920px", // Large desktops
      "3xl": "2560px", // Ultra large screens
    },
    colors: {
      "vertica-purple": {
        light: "#ECEDFEFF",
        dark: "#00395a",
        green: "#28dd97",
      },
      "vertica-green": "#28dd97",
      "dash-light": "#A8AAAE",
      "purple-light": "#B78BF2",
      "purple-dark": "#7B61FF",
      purple: {
        50: "#f3f2ff",
        100: "#e9e8ff",
        200: "#d5d4ff",
        300: "#b7b1ff",
        400: "#9385ff",
        500: "#7b61ff",
        600: "#5d30f7",
        700: "#4f1ee3",
        800: "#4218bf",
        900: "#37169c",
        950: "#200b6a",
      },
      light: {
        50: "#f7f7f7",
        100: "#e7e7e7",
        200: "#dfdfdf",
        300: "#c8c8c8",
        400: "#adadad",
        500: "#999999",
        600: "#888888",
        700: "#7b7b7b",
        800: "#676767",
        900: "#545454",
        950: "#363636",
      },
      dark: {
        50: "#fafafa",
        100: "#f4f4f5",
        200: "#e4e4e7",
        300: "#d4d4d8",
        400: "#a1a1aa",
        500: "#71717a",
        600: "#52525b",
        700: "#3f3f46",
        800: "#27272a",
        900: "#18181b",
        950: "#09090b",
      },
      creme: "#E7E7E7",
      white: "#fff",
      black: "#000000",
      grey: "#D9D9D9",
      lightgrey: "#969696",
      blue: "#2969FF",
      green: "rgb(54,195,114)",
      yellow: "#ECD719",
      red: "#D72638",
      darkgrey: "#161616",
      lightdark: "#222222",
      lighterdark: "#333333",
    },
    extend: {
      fontFamily: {
        lora: ["Lora", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        xsmall: [
          "12px",
          {
            fontWeight: "200",
            lineHeight: "18px",
          },
        ],
        small: [
          "15px",
          {
            fontWeight: "400",
            lineHeight: "22px",
          },
        ],
        p: [
          "20px",
          {
            fontWeight: "400",
            lineHeight: "30px", // Adjusting to approximate golden ratio inspired progression
          },
        ],
        h4: [
          "30px",
          {
            fontWeight: "400",
            lineHeight: "45px", // Adjusting for visual harmony
          },
        ],
        h3: [
          "45px",
          {
            fontWeight: "600",
            lineHeight: "68px", // Enhanced for readability and aesthetic spacing
          },
        ],
        h3sm: [
          "35px",
          {
            fontWeight: "600",
            lineHeight: "53px", // Adjusted to maintain visual flow
          },
        ],
        h3xs: [
          "25px",
          {
            fontWeight: "600",
            lineHeight: "38px", // Adjusted for coherence with the set
          },
        ],
        h2: [
          "56px",
          {
            fontWeight: "600",
            lineHeight: "85px", // Fine-tuned for balance and proportion
          },
        ],
        h1: [
          "72px",
          {
            fontWeight: "900",
            lineHeight: "110px", // Setting for standout headings
          },
        ],
        h1sm: [
          "52px",
          {
            fontWeight: "900",
            lineHeight: "78px", // Modified for size variation
          },
        ],
        h1semi: [
          "72px",
          {
            fontWeight: "500",
            lineHeight: "110px", // Consistent with h1 but with different weight
          },
        ],
        h1smsemi: [
          "52px",
          {
            fontWeight: "500",
            lineHeight: "78px", // Aligned with h1sm adjustments
          },
        ],
      },
    },
  },
};
