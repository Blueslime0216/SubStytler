/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg': 'var(--bg-color)',
        'surface': 'var(--surface-color)',
        'highlight': 'var(--highlight-color)',
        'shadow': 'var(--shadow-color)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-accent': 'var(--text-accent)',
        'primary': 'var(--primary-color)',
        'success': 'var(--success-color)',
        'warning': 'var(--warning-color)',
        'error': 'var(--error-color)',
        'info': 'var(--info-color)',
      },
      boxShadow: {
        'outset': 'var(--shadow-outset)',
        'inset': 'var(--shadow-inset)',
        'outset-strong': 'var(--shadow-outset-strong)',
        'inset-strong': 'var(--shadow-inset-strong)',
        'outset-subtle': 'var(--shadow-outset-subtle)',
        'inset-subtle': 'var(--shadow-inset-subtle)',
        'button-normal': 'var(--shadow-button-normal)',
        'button-pressed': 'var(--shadow-button-pressed)',
        'button-focus': 'var(--shadow-button-focus)',
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
      },
    },
  },
  plugins: [],
};
