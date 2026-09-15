import React from 'react';
import { View, Modal as RNModal, TouchableWithoutFeedback } from 'react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, children, className = '' }) => {
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className={`bg-white dark:bg-brand-cardDark rounded-t-3xl p-5 min-h-50 border-t border-slate-200 dark:border-slate-700/60 ${className}`}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};
