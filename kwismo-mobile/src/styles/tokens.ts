/**
 * Design Tokens for Kwismo Mobile
 */

export const colors = {
  // Primary brand palette specified in requirements
  navy: '#161E33',
  orange: '#FF9900',
  green: '#32B07F',
  blue: '#6B98FF',

  // Dark variations & gradients
  darkBg: '#0F1626',
  darkGreenOverlay: 'rgba(15, 30, 35, 0.95)',
  gradientGreenStart: '#32B07F',
  gradientNavyEnd: '#161E33',

  // Neutral tones
  white: '#FFFFFF',
  offWhite: '#F8FAF9',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  black: '#000000',

  // Input border & placeholders
  inputBorder: 'rgba(255, 255, 255, 0.6)',
  inputPlaceholder: '#A0AEC0',

  // Pagination indicators
  activeIndicator: '#FF9900',
  inactiveIndicator: 'rgba(255, 255, 255, 0.5)',
};

/**
 * Typography matching official style guide specs:
 * Headline: Montserrat Alternates
 * Body & Buttons: Ageo
 */
export const fonts = {
  // Headlines - Montserrat Alternates
  h1: 'MontserratAlternates-Bold',
  h2: 'MontserratAlternates-Bold',
  h3: 'MontserratAlternates-Medium',
  h4: 'MontserratAlternates-Regular',
  h5: 'MontserratAlternates-Regular',
  h6: 'MontserratAlternates-Regular',
  headlineBold: 'MontserratAlternates-Bold',
  headlineMedium: 'MontserratAlternates-Medium',
  headlineRegular: 'MontserratAlternates-Regular',

  // Body & Buttons - Ageo
  bodyLarge: 'Ageo-Medium',
  bodyMedium: 'Ageo-Medium',
  bodySmall: 'Ageo-Regular',
  caption: 'Ageo-SemiBold',
  footnote: 'Ageo-SemiBold',
  regular: 'Ageo-Regular',
  medium: 'Ageo-Medium',
  semiBold: 'Ageo-SemiBold',
  semibold: 'Ageo-SemiBold',
  bold: 'Ageo-Bold',
};

/**
 * Typography Hierarchy Rules specified in style guide:
 * H1: Size 56, LineHeight 72
 * H2: Size 40, LineHeight 56
 * H3: Size 28, LineHeight 40
 * H4: Size 26, LineHeight 32
 * H5: Size 22, LineHeight 32
 * H6: Size 20, LineHeight 28
 * Body Large: Size 16, LineHeight 27
 * Body Medium: Size 14, LineHeight 20
 * Body Small: Size 12, LineHeight 16
 * Caption: Size 14, LineHeight 21
 * Footnote: Size 12, LineHeight 16
 */
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
