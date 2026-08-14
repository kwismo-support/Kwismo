import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        secondary: {
          50:  'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
        },
        success: 'var(--color-success)',
        danger:  'var(--color-danger)',
        warning: 'var(--color-warning)',
        info:    'var(--color-info)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      backgroundColor: {
        DEFAULT: 'var(--color-bg)',
        subtle:  'var(--color-bg-subtle)',
      },
      borderColor: {
        DEFAULT: 'var(--color-border)',
      },
      textColor: {
        DEFAULT: 'var(--color-text)',
        muted:   'var(--color-text-muted)',
      },
    },
  },
  plugins: [],
};

export default config;
