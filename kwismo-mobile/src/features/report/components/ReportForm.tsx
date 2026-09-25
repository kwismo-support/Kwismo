import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ReportPayload } from '../services/report.api';

interface ReportFormProps {
  onSubmit: (payload: ReportPayload) => void;
  submitting?: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, submitting }) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('report.phoneLabel')}</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder={t('auth.phonePlaceholder')}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>{t('report.detailsLabel')}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholder={t('report.detailsPlaceholder')}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => onSubmit({ numero: phone, motif: description })}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? '...' : t('report.submitReport')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  button: {
    backgroundColor: '#DC2626',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
