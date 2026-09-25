import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface AlertMessageFormProps {
  message: string;
  onChangeMessage: (msg: string) => void;
}

export const AlertMessageForm: React.FC<AlertMessageFormProps> = ({ message, onChangeMessage }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('whatsapp.alertMessageTitle')}</Text>
      <TextInput
        style={styles.textArea}
        value={message}
        onChangeText={onChangeMessage}
        multiline
        numberOfLines={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    height: 80,
    textAlignVertical: 'top',
  },
});
