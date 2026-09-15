import React from 'react';
import { View, Modal as RNModal } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ visible, onClose, children, className = '' }) => {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center p-5">
        <View className={`w-full max-w-sm bg-white dark:bg-brand-cardDark rounded-2xl p-5 shadow-xl border border-slate-200 dark:border-slate-700/60 ${className}`}>
          {children}
        </View>
      </View>
    </RNModal>
  );
};
