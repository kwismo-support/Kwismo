import { Platform } from 'react-native';

/**
 * Design Tokens
 */

export const colors = {
  navy: '#161E33',
  orange: '#FF9900',
  green: '#32B07F',
  blue: '#6B98FF',

  darkBg: '#0F1626',
  darkGreenOverlay: 'rgba(15, 30, 35, 0.95)',
  gradientGreenStart: '#32B07F',
  gradientNavyEnd: '#161E33',

  white: '#FFFFFF',
  offWhite: '#F8FAF9',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  black: '#000000',

  inputBorder: 'rgba(255, 255, 255, 0.6)',
  inputPlaceholder: '#A0AEC0',

  activeIndicator: '#FF9900',
  inactiveIndicator: 'rgba(255, 255, 255, 0.5)',

  disabled: '#D1D5DB',
  disabledText: '#94A3B8',
};

// Font configuration
export const HEADLINE_FONT = 'Montserrat Alternates';
export const BODY_FONT = 'Ageo';

const getFont = (family: string, weightSuffix: string) => {
  const cleanName = family.replace(/\s+/g, '');
  return Platform.select({
    web: `'${family}', '${cleanName}-${weightSuffix}', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`,
    default: `${cleanName}-${weightSuffix}`,
  });
};

export const fonts = {
  h1: getFont(HEADLINE_FONT, 'Bold'),
  h2: getFont(HEADLINE_FONT, 'Bold'),
  h3: getFont(HEADLINE_FONT, 'Medium'),
  h4: getFont(HEADLINE_FONT, 'Regular'),
  h5: getFont(HEADLINE_FONT, 'Regular'),
  h6: getFont(HEADLINE_FONT, 'Regular'),
  headlineBold: getFont(HEADLINE_FONT, 'Bold'),
  headlineMedium: getFont(HEADLINE_FONT, 'Medium'),
  headlineRegular: getFont(HEADLINE_FONT, 'Regular'),

  bodyLarge: getFont(BODY_FONT, 'Medium'),
  bodyMedium: getFont(BODY_FONT, 'Medium'),
  bodySmall: getFont(BODY_FONT, 'Regular'),
  caption: getFont(BODY_FONT, 'SemiBold'),
  footnote: getFont(BODY_FONT, 'SemiBold'),
  regular: getFont(BODY_FONT, 'Regular'),
  medium: getFont(BODY_FONT, 'Medium'),
  semiBold: getFont(BODY_FONT, 'SemiBold'),
  semibold: getFont(BODY_FONT, 'SemiBold'),
  bold: getFont(BODY_FONT, 'Bold'),
};

// Typography scale
export const typography = {
  h1: { fontSize: 56, lineHeight: 72, fontFamily: fonts.h1, fontWeight: '700' as const },
  h2: { fontSize: 40, lineHeight: 56, fontFamily: fonts.h2, fontWeight: '700' as const },
  h3: { fontSize: 28, lineHeight: 40, fontFamily: fonts.h3, fontWeight: '500' as const },
  h4: { fontSize: 26, lineHeight: 32, fontFamily: fonts.h4, fontWeight: '400' as const },
  h5: { fontSize: 22, lineHeight: 32, fontFamily: fonts.h5, fontWeight: '400' as const },
  h6: { fontSize: 20, lineHeight: 28, fontFamily: fonts.h6, fontWeight: '400' as const },

  bodyLarge: { fontSize: 16, lineHeight: 27, fontFamily: fonts.bodyLarge, fontWeight: '500' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bodyMedium, fontWeight: '500' as const },
  bodySmall: { fontSize: 12, lineHeight: 16, fontFamily: fonts.bodySmall, fontWeight: '400' as const },

  caption: { fontSize: 14, lineHeight: 21, fontFamily: fonts.caption, fontWeight: '600' as const },
  footnote: { fontSize: 12, lineHeight: 16, fontFamily: fonts.footnote, fontWeight: '600' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
