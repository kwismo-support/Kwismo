import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Icon } from '@/shared/ui/Icon';

export interface PostCallPromptModalProps {
  visible: boolean;
  phoneNumber: string;
  onReport: (phone: string) => void;
  onDismiss: () => void;
}

export function PostCallPromptModal({
  visible,
  phoneNumber,
  onReport,
  onDismiss,
}: PostCallPromptModalProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/60 justify-end">
        <View className="rounded-t-3xl p-6 pb-9 bg-white dark:bg-brand-darkBg border-t border-slate-200 dark:border-slate-800">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-amber-100 dark:bg-slate-800 items-center justify-center mr-3">
                <Icon name="solar:phone-calling-rounded-bold" color="#F97316" size={22} />
              </View>
              <Text className="font-bold text-base text-slate-900 dark:text-white">
                Fin d'appel récent
              </Text>
            </View>
            <TouchableOpacity onPress={onDismiss}>
              <Icon name="solar:close-circle-bold" color="#94A3B8" size={24} />
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-5">
            Vous venez de terminer un appel avec le numéro{' '}
            <Text className="font-bold text-slate-900 dark:text-white">{phoneNumber}</Text>.
            Souhaitez-vous le signaler s'il s'agit d'une tentative d'arnaque ?
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onDismiss}
              className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 items-center justify-center bg-slate-50 dark:bg-brand-cardDark"
            >
              <Text className="font-bold text-sm text-slate-700 dark:text-slate-300">
                Ignorer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => onReport(phoneNumber)}
              className="flex-1 h-12 rounded-xl bg-orange-500 items-center justify-center shadow-md shadow-orange-500/30"
            >
              <Text className="font-bold text-sm text-white">Signaler l'appel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
