/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#161E33',
          orange: '#FF9900',
          green: '#32B07F',
          darkGreen: '#104E37',
          mint: '#E6F7F2',
          blue: '#6B98FF',
          darkBg: '#0F1626',
        },
      },
      fontFamily: {
        headline: ['MontserratAlternates-Bold', 'sans-serif'],
        'headline-medium': ['MontserratAlternates-Medium', 'sans-serif'],
        'headline-regular': ['MontserratAlternates-Regular', 'sans-serif'],
        h3: ['MontserratAlternates-Medium', 'sans-serif'],
        ageo: ['Ageo-Regular', 'sans-serif'],
        'ageo-medium': ['Ageo-Medium', 'sans-serif'],
        'ageo-semibold': ['Ageo-SemiBold', 'sans-serif'],
        'ageo-bold': ['Ageo-Bold', 'sans-serif'],
        sans: ['Ageo-Regular', 'sans-serif'],
        medium: ['Ageo-Medium', 'sans-serif'],
        semibold: ['Ageo-SemiBold', 'sans-serif'],
        bold: ['Ageo-Bold', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
