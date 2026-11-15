module.exports = ({ config }) => {
  const env = process.env.APP_ENV || 'production';
  const appName = 'Kwismo';
  const bundleIdentifier = 'com.kwismo.mobile';
  const packageName = 'com.kwismo.mobile';
  const scheme = 'kwismo';

  const projectId = process.env.EAS_PROJECT_ID || config.extra?.eas?.projectId;

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
      ...(projectId ? { url: `https://u.expo.dev/${projectId}` } : {}),
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    extra: {
      ...(config.extra || {}),
      ...(projectId ? { eas: { projectId } } : {}),
      appEnv: env,
    },
  };
};
