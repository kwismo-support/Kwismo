import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Hook de mise à jour automatique et silencieuse (EAS Update).
 * Vérifie au démarrage, télécharge et applique directement la mise à jour
 * SANS demander de permission et SANS afficher de modale ou pop-up.
 */
export function useOTAUpdates() {
  useEffect(() => {
    async function checkAndApplyUpdatesSilently() {
      // Ignorer les vérifications en environnement de développement local ou web
      if (__DEV__ || Platform.OS === 'web') return;

      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          console.log('[OTA Updates] Nouvelle version détectée. Téléchargement silencieux...');
          await Updates.fetchUpdateAsync();

          console.log('[OTA Updates] Application de la mise à jour et rechargement...');
          // Recharger l'application immédiatement et silencieusement avec le nouveau code
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.warn('[OTA Updates] Vérification silencieuse échouée:', error);
      }
    }

    checkAndApplyUpdatesSilently();
  }, []);
}
