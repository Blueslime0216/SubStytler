/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neu-base': 'var(--neu-base)',
        'neu-surface': 'var(--neu-surface)',
        'neu-light': 'var(--neu-light)',
        'neu-dark': 'var(--neu-dark)',
        'neu-darker': 'var(--neu-darker)',
        'neu-accent': 'var(--neu-accent)',
        'neu-text-primary': 'var(--neu-text-primary)',
        'neu-text-secondary': 'var(--neu-text-secondary)',
        'neu-text-muted': 'var(--neu-text-muted)',
        'neu-text-accent': 'var(--neu-text-accent)',
        'neu-primary': 'var(--neu-primary)',
        'neu-success': 'var(--neu-success)',
        'neu-warning': 'var(--neu-warning)',
        'neu-error': 'var(--neu-error)',
        'neu-info': 'var(--neu-info)',
      },
      boxShadow: {
        'neu-inset': 'var(--neu-shadow-inset)',
        'neu-inset-soft': 'var(--neu-shadow-inset-soft)',
        'neu-inset-deep': 'var(--neu-shadow-inset-deep)',
        'neu-outset': 'var(--neu-shadow-outset)',
        'neu-outset-strong': 'var(--neu-shadow-outset-strong)',
      },
      borderRadius: {
        'neu': '16px',
        'neu-lg': '24px',
        'neu-sm': '8px',
      },
    },
  },
  plugins: [],
};
