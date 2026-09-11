module.exports = ({ config }) => {
  const env = process.env.APP_ENV || 'preview';
  const isProd = env === 'production';

  const appName = isProd ? 'Kwismo' : 'Kwismo-Test';
  const bundleIdentifier = isProd ? 'com.kwismo.mobile' : 'com.kwismo.mobile.test';
  const packageName = isProd ? 'com.kwismo.mobile' : 'com.kwismo.mobile.test';
  const scheme = isProd ? 'kwismo' : 'kwismo-test';

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
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#161E33',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#161E33',
        monochromeImage: './assets/adaptive-icon-monochrome.png',
      },
      package: packageName,
    },
    web: {
      favicon: './assets/icon.png',
      bundler: 'metro',
    },
    plugins: ['expo-router'],
    updates: {
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
      ...(projectId ? { url: `https://u.expo.dev/${projectId}` } : {}),
    },
    runtimeVersion: '1.0.0',
    extra: {
      ...(config.extra || {}),
      ...(projectId ? { eas: { projectId } } : {}),
      appEnv: env,
    },
  };
};
