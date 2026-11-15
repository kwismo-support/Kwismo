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

  // 3. Détermination de la cible (Production vs Staging/Test) :
  // - Si le profil EAS est 'production' / 'production-apk' OU si APP_ENV est 'production' -> Production (com.kwismo.mobile)
  // - Si on est sur la branche 'main' ET qu'aucun profil non-prod n'a été forcé -> Production (com.kwismo.mobile)
  // - Si on est sur 'staging' / 'dev' OU qu'un profil test/staging/preview est spécifié -> Staging/Test (com.kwismo.mobile.test)
  const isExplicitNonProd = ['preview', 'staging', 'development', 'test-aab'].includes(buildProfile) || ['preview', 'staging', 'development'].includes(rawEnv);
  const isExplicitProd = ['production', 'production-apk'].includes(buildProfile) || rawEnv === 'production';

  const isProd = isExplicitProd || (gitBranch === 'main' && !isExplicitNonProd);
  const isStaging = !isProd && (buildProfile === 'staging' || rawEnv === 'staging' || gitBranch === 'staging');

  const env = isProd ? 'production' : (isStaging ? 'staging' : 'preview');
  const appName = isProd ? 'Kwismo' : (isStaging ? 'Kwismo (Staging)' : 'Kwismo-Test');
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
