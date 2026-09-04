import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: 'var(--color-brand-navy)',
          orange: 'var(--color-brand-orange)',
          green: 'var(--color-brand-green)',
          blue: 'var(--color-brand-blue)',
          darkBg: 'var(--color-brand-dark-bg)',
        },
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
        sans:  ['var(--font-sans)'],
        title: ['var(--font-title)'],
        body:  ['var(--font-body)'],
        mono:  ['var(--font-mono)'],
      },
      fontSize: {
        '2xs': ['var(--text-2xs)', { lineHeight: 'var(--leading-tight)' }],
        xs:    ['var(--text-xs)',  { lineHeight: 'var(--leading-normal)' }],
        sm:    ['var(--text-sm)',  { lineHeight: 'var(--leading-normal)' }],
        base:  ['var(--text-base)',{ lineHeight: 'var(--leading-relaxed)' }],
        lg:    ['var(--text-lg)',  { lineHeight: 'var(--leading-relaxed)' }],
        xl:    ['var(--text-xl)',  { lineHeight: 'var(--leading-snug)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-snug)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-none)' }],
      },
      lineHeight: {
        none:    'var(--leading-none)',
        tight:   'var(--leading-tight)',
        snug:    'var(--leading-snug)',
        normal:  'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
        loose:   'var(--leading-loose)',
      },
      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight:   'var(--tracking-tight)',
        normal:  'var(--tracking-normal)',
        wide:    'var(--tracking-wide)',
        wider:   'var(--tracking-wider)',
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
