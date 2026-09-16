const percentScale = Array.from({ length: 100 }, (_, i) => i + 1).reduce((acc, val) => {
  acc[val] = `${val}%`;
  return acc;
}, {});

const plugin = require('tailwindcss/plugin');

// Custom pixel spacing map for wx-* and hx-* classes (e.g. wx-13 = width: 52px, hx-13 = height: 52px)
const pixelSpacingMap = {
  '13': '52px',
  '15': '60px',
  '17': '68px',
  '18': '72px',
  '19': '76px',
  '25': '100px',
  '34': '136px',
  '50': '200px',
  '55': '220px',
  '90': '360px',
};
Array.from({ length: 100 }, (_, i) => i + 1).forEach((val) => {
  if (!pixelSpacingMap[val]) {
    pixelSpacingMap[val] = `${val * 4}px`;
  }
});

module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      height: {
        ...percentScale,
      },
      minHeight: {
        ...percentScale,
      },
      maxHeight: {
        ...percentScale,
      },
      width: {
        ...percentScale,
      },
      minWidth: {
        ...percentScale,
      },
      maxWidth: {
        ...percentScale,
      },
      spacing: {
        '13': '52px',
        '15': '60px',
        '17': '68px',
        '18': '72px',
        '19': '76px',
        '25': '100px',
        '34': '136px',
        '50': '200px',
        '55': '220px',
        '90': '360px',
      },
      colors: {
        transparent: 'transparent',
        brand: {
          navy: '#161E33',
          orange: '#FF9900',
          green: '#32B07F',
          darkGreen: '#104E37',
          mint: '#E6F7F2',
          blue: '#6B98FF',
          darkBg: '#0F1626',
          cardDark: '#162035',
        },
        primary: {
          50: '#e7e9f0',
          100: '#c4c9da',
          200: '#9ba4bf',
          300: '#717fa4',
          400: '#495988',
          500: '#161E33',
          600: '#121829',
          700: '#0e1320',
          800: '#0a0e18',
          900: '#05070c',
        },
        secondary: {
          50: '#fff4e5',
          100: '#ffe0b2',
          500: '#FF9900',
          600: '#e08700',
        },
        success: '#32B07F',
        danger: '#e53e3e',
        warning: '#FF9900',
        info: '#6B98FF',
      },
      fontFamily: {
        sans: ['Ageo-Regular'],
        title: ['MontserratAlternates-Bold'],
        body: ['Ageo-Regular'],
        headline: ['MontserratAlternates-Bold'],
        'headline-medium': ['MontserratAlternates-Medium'],
        'headline-regular': ['MontserratAlternates-Regular'],
        h1: ['MontserratAlternates-Bold'],
        h2: ['MontserratAlternates-Bold'],
        h3: ['MontserratAlternates-Medium'],
        h4: ['MontserratAlternates-Medium'],
        h5: ['MontserratAlternates-Medium'],
        h6: ['MontserratAlternates-Medium'],
        medium: ['Ageo-Medium'],
        semibold: ['Ageo-SemiBold'],
        bold: ['Ageo-Bold'],
        montserrat: ['MontserratAlternates-Bold'],
        'montserrat-bold': ['MontserratAlternates-Bold'],
        'montserrat-semibold': ['MontserratAlternates-SemiBold'],
        'montserrat-medium': ['MontserratAlternates-Medium'],
        'montserrat-regular': ['MontserratAlternates-Regular'],
      },
      fontSize: {
        h1: ['56px', { lineHeight: '72px' }],
        h2: ['40px', { lineHeight: '56px' }],
        h3: ['28px', { lineHeight: '40px' }],
        h4: ['26px', { lineHeight: '32px' }],
        h5: ['22px', { lineHeight: '32px' }],
        h6: ['20px', { lineHeight: '28px' }],
        'body-lg': ['16px', { lineHeight: '27px' }],
        'body-md': ['14px', { lineHeight: '20px' }],
        'body-sm': ['12px', { lineHeight: '16px' }],
        caption: ['14px', { lineHeight: '21px' }],
        footnote: ['12px', { lineHeight: '16px' }],
        '3xs': ['9px', { lineHeight: '12px' }],
        '2xs': ['11px', { lineHeight: '14px' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '42px' }],
        '5xl': ['42px', { lineHeight: '48px' }],
      },
      borderRadius: {
        sm: 4,
        DEFAULT: 8,
        md: 12,
        lg: 16,
        xl: 20,
        full: 9999,
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {};
      Object.entries(pixelSpacingMap).forEach(([key, val]) => {
        newUtilities[`.wx-${key}`] = { width: val };
        newUtilities[`.hx-${key}`] = { height: val };
      });
      addUtilities(newUtilities);
    }),
  ],
};
