/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-bg': 'var(--primary-bg)',
        'secondary-bg': 'var(--secondary-bg)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent': 'var(--accent)',
        'button-bg': 'var(--button-bg)',
        'button-text': 'var(--button-text)',
        'card-bg': 'var(--card-bg)',
        'border-color': 'var(--border-color)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}