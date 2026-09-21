import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface VerifyInputProps {
  onSearch: (phone: string) => void;
  loading?: boolean;
}

export const VerifyInput: React.FC<VerifyInputProps> = ({ onSearch, loading }) => {
  const [phone, setPhone] = useState('');
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder={t('common.phonePlaceholder')}
        keyboardType="phone-pad"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => onSearch(phone)}
        disabled={loading || !phone}
      >
        <Text style={styles.buttonText}>{loading ? '...' : t('common.verify')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
