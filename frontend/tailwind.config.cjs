/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ── DARK THEME (navy + orange + red) ── */
        primary: {
          DEFAULT: "#05091A",   // deep navy background
          light:   "#0B1530",   // slightly lighter navy
          dark:    "#020612",   // darkest navy
        },
        /* ── LIGHT THEME surface ── */
        surface: "#FFFFFF",       // pure white
        "surface-2": "#FFF8E7",   // warm yellow-tinted white
        "content-primary": "#111827",
        "content-secondary": "#374151",

        /* ── ACCENT: orange (primary CTA) ── */
        accent: {
          DEFAULT: "#F97316",   // vibrant orange
          light:   "#FB923C",
          dark:    "#EA580C",
        },

        /* ── SECONDARY: yellow (light theme CTA) ── */
        secondary: {
          DEFAULT: "#FBBF24",   // amber yellow
          light:   "#FDE68A",
          dark:    "#D97706",
        },

        /* ── DANGER: red accent ── */
        danger: {
          DEFAULT: "#EF4444",
          light:   "#FCA5A5",
          dark:    "#DC2626",
        },

        /* ── NAVY shades (dark mode cards/borders) ── */
        navy: {
          50:  "#EFF6FF",
          100: "#DBEAFE",
          200: "#93C5FD",
          700: "#1D3461",
          800: "#0F1E3D",
          900: "#060E26",
          950: "#030A1A",
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'slide-up':   'slideUp 0.4s ease-out forwards',
        'float':      'floatY 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'shimmer':    'shimmer 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        slideUp:   { '0%': { opacity:'0', transform:'translateY(12px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        floatY:    { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
        glowPulse: { '0%,100%': { boxShadow:'0 0 0 0 rgba(249,115,22,0)' }, '50%': { boxShadow:'0 0 24px 6px rgba(249,115,22,0.3)' } },
        shimmer:   { '0%': { backgroundPosition:'-200% center' }, '100%': { backgroundPosition:'200% center' } },
      },
      boxShadow: {
        'orange':     '0 4px 24px rgba(249,115,22,0.25)',
        'yellow':     '0 4px 24px rgba(251,191,36,0.30)',
        'navy':       '0 4px 24px rgba(5,9,26,0.50)',
        'card-light': '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
        'card-dark':  '0 1px 3px rgba(0,0,0,0.40), 0 8px 32px rgba(0,0,0,0.30)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-dark': 'linear-gradient(135deg, #05091A 0%, #0B1530 50%, #0F1E3D 100%)',
        'hero-light': 'linear-gradient(135deg, #FFFFFF 0%, #FFF8E7 50%, #FEF3C7 100%)',
        'orange-glow': 'radial-gradient(ellipse at 60% 0%, rgba(249,115,22,0.18) 0%, transparent 70%)',
      },
    }
  },
  plugins: [],
};
