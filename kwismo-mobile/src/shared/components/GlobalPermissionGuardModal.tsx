import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';

interface GlobalPermissionGuardModalProps {
  visible: boolean;
  missingCount: number;
  onGrant: () => void;
  onDismiss: () => void;
}

export const GlobalPermissionGuardModal: React.FC<GlobalPermissionGuardModalProps> = ({
  visible,
  missingCount,
  onGrant,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/75 justify-center items-center px-5">
        <View className="w-full max-w-sm rounded-3xl border border-amber-300/40 dark:border-amber-700/40 bg-white dark:bg-brand-cardDark p-6 items-center shadow-2xl elevation-12">
          <View className="wx-16 hx-16 rounded-full bg-amber-100 dark:bg-amber-950/60 justify-center items-center mb-4 border border-amber-300/50">
            <Icon name="solar:shield-warning-bold" size={38} color="#D97706" />
          </View>

          <Text className="text-lg font-montserrat-bold font-bold text-center text-slate-900 dark:text-white mb-2">
            Avertissement de Sécurité Kwismo
          </Text>

          <Text className="text-xs font-medium text-slate-600 dark:text-slate-300 text-center leading-5 mb-5">
            Pour détecter les numéros d'arnaqueurs lors des appels et sécuriser vos transactions Mobile Money en temps réel, Kwismo nécessite les autorisations Contacts, Journal d'Appels et Notifications.
          </Text>

          <View className="w-full bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3.5 mb-6 border border-amber-200 dark:border-amber-900/50">
            <Text className="text-2xs font-semibold text-amber-800 dark:text-amber-300 text-center">
              ⚠️ Sans ces autorisations, la sécurité de vos appels n'est pas optimale et les alertes d'anti-arnaque ne pourront pas fonctionner en arrière-plan.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onGrant}
            className="w-full hx-13 bg-brand-green rounded-xl justify-center items-center mb-3 shadow-md shadow-emerald-500/30"
          >
            <Text className="font-montserrat-bold text-sm font-bold text-white">
              Activer les protections maintenant
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onDismiss}
            className="py-2"
          >
            <Text className="font-medium text-xs text-slate-400 dark:text-slate-500 underline">
              Continuer en mode restreint
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
