module.exports = ({ config }) => {
  const buildProfile = process.env.EAS_BUILD_PROFILE || '';
  const rawEnv = process.env.APP_ENV || process.env.EXPO_PUBLIC_APP_ENV || '';

  // Par défaut, nous sommes en production pour éviter tout déploiement de test par inadvertance.
  // Ne bascule en preview que si explicitement demandé.
  const isPreview = rawEnv === 'preview' || buildProfile === 'preview' || buildProfile === 'development';
  const env = isPreview ? 'preview' : 'production';
  const isProd = !isPreview;

  const appName = isProd ? 'Kwismo' : 'Kwismo-Test';
  const bundleIdentifier = isProd ? 'com.kwismo.mobile' : 'com.kwismo.mobile.test';
  const packageName = isProd ? 'com.kwismo.mobile' : 'com.kwismo.mobile.test';
  const scheme = isProd ? 'kwismo' : 'kwismo-test';

  const projectId = process.env.EAS_PROJECT_ID || config.extra?.eas?.projectId || '5dfc0edb-3e81-4bed-b9c2-448832f4b5ec';

  return {
    ...config,
    name: appName,
    slug: 'kwismo-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    scheme: scheme,
    assetBundlePatterns: ['**/*'],
    ios: {
      ...(config.ios || {}),
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
    },
    android: {
      ...(config.android || {}),
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
        monochromeImage: './assets/adaptive-icon-monochrome.png',
      },
      package: packageName,
    },
    web: {
      favicon: './assets/icon.png',
      bundler: 'metro',
    },
    plugins: [
      ...(config.plugins || []),
    ],
    updates: {
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
      url: `https://u.expo.dev/${projectId}`,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    extra: {
      ...(config.extra || {}),
      eas: { projectId },
      appEnv: env,
    },
  };
};
