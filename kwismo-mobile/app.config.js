const { execSync } = require('child_process');

module.exports = ({ config }) => {
  // 1. Détection de la branche Git courante (en local ou dans EAS Build)
  let gitBranch = process.env.EAS_BUILD_GIT_BRANCH || '';
  if (!gitBranch) {
    try {
      gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();
    } catch {
      gitBranch = '';
    }
  }

  // 2. Détection du profil de compilation EAS et de la variable APP_ENV
  const buildProfile = (process.env.EAS_BUILD_PROFILE || '').toLowerCase();
  const rawEnv = (process.env.APP_ENV || process.env.EXPO_PUBLIC_APP_ENV || '').toLowerCase();

  // 3. Détermination précise selon la table :
  // - Production : profil 'production' / 'production-apk', env 'production', ou branche 'main'
  // - Staging : profil 'staging' / 'staging-aab', env 'staging', ou branche 'staging'
  // - Dev / Preview : profil 'preview' / 'preview-aab' / 'development', branche 'dev', etc.
  const isProd =
    ['production', 'production-apk'].includes(buildProfile) ||
    rawEnv === 'production' ||
    (gitBranch === 'main' && !['staging', 'staging-aab', 'preview', 'preview-aab', 'development', 'test-aab'].includes(buildProfile) && !['staging', 'preview', 'dev', 'development'].includes(rawEnv));

  const isStaging =
    !isProd &&
    (['staging', 'staging-aab'].includes(buildProfile) ||
      rawEnv === 'staging' ||
      (gitBranch === 'staging' && !['preview', 'preview-aab', 'development', 'test-aab'].includes(buildProfile) && !['preview', 'dev', 'development'].includes(rawEnv)));

  let bundleIdentifier = 'com.kwismo.mobile.dev';
  let packageName = 'com.kwismo.mobile.dev';
  let appName = 'Kwismo-Dev';
  let scheme = 'kwismo-dev';
  let env = 'preview';

  if (isProd) {
    bundleIdentifier = 'com.kwismo.mobile';
    packageName = 'com.kwismo.mobile';
    appName = 'Kwismo';
    scheme = 'kwismo';
    env = 'production';
  } else if (isStaging) {
    bundleIdentifier = 'com.kwismo.mobile.staging';
    packageName = 'com.kwismo.mobile.staging';
    appName = 'Kwismo-Staging';
    scheme = 'kwismo-staging';
    env = 'staging';
  }

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
      gitBranch: gitBranch,
      buildProfile: buildProfile,
    },
  };
};
