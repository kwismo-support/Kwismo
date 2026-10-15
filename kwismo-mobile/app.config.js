module.exports = ({ config }) => {
  const env = process.env.APP_ENV || 'preview';
  const isProd = env === 'production';

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
