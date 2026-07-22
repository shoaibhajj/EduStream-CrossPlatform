/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F6F7FB",
        surface: "#FFFFFF",
        "surface-secondary": "#F9FAFB",
        border: "#E7EAF3",
        "text-primary": "#101828",
        "text-secondary": "#6A7282",
        "text-muted": "#99A1AF",
        accent: "#7C5CFC",
        "accent-dark": "#5E4CFF",
        "accent-light": "#F3E8FF",
        "accent-foreground": "#FFFFFF",
        success: "#10B981",
        "success-light": "#D0FAE5",
        "success-foreground": "#007A55",
        warning: "#FF8904",
        error: "#EF4444",
        enrolled: "#10B981",
        pending: "#FF8904",
        locked: "#99A1AF",
        preview: "#7C5CFC",
        "year-badge-bg": "#DBEAFE",
        "year-badge-fg": "#155DFC"
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px"
      },
      fontFamily: {
        sans: ["Inter"]
      }
    }
  },
  plugins: []
};
