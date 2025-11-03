module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "Segoe UI", "Arial", "sans-serif"],
    },
    extend: {
      colors: {
        blue: {
          600: "#1887fa",
          700: "#1067bc"
        },
        neutral: {
          900: "#171819"
        }
      },
    },
  },
  plugins: [],
};
