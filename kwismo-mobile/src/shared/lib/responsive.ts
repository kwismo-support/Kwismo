import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline dimensions based on standard mobile screen (iPhone 11 / standard Android: 375 x 812)
const baseWidth = 375;
const baseHeight = 812;

const scaleWidth = SCREEN_WIDTH / baseWidth;
const scaleHeight = SCREEN_HEIGHT / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

/**
 * Scale font size moderately to prevent overly large or small text
 */
export function scaleFont(size: number, factor = 0.5): number {
  if (Platform.OS === 'web') {
    // On web, maintain readable clamping
    return Math.max(12, Math.min(size * (1 + (scale - 1) * factor), size * 1.25));
  }
  const newSize = size + (scale - 1) * size * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Scale horizontal spacing or width
 */
export function scaleSpacing(size: number): number {
  if (Platform.OS === 'web') {
    return Math.min(size * 1.1, size);
  }
  return Math.round(PixelRatio.roundToNearestPixel(size * scaleWidth));
}

/**
 * Get current screen dimensions
 */
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 360,
  isTablet: SCREEN_WIDTH >= 768,
  isWeb: Platform.OS === 'web',
};
