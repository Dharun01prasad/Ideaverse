/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent-color)',
        main: 'var(--bg-main)',
        card: 'var(--bg-card)',
        sidebar: 'var(--bg-sidebar)',
        surface: {
          50: 'var(--surface-50)',
          100: 'var(--surface-100)',
          200: 'var(--surface-200)',
        },
        text: {
          main: 'var(--text-main)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          primary: 'var(--text-primary)',
        },
        border: {
          main: 'var(--border-main)',
          surface200: 'var(--surface-200)',
        },
      },
    },
  },
  plugins: [],
};
