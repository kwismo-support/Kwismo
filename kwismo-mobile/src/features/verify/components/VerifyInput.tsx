// Composant de recherche / vérification rapide d'un numéro
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface VerifyInputProps {
  onSearch: (phone: string) => void;
  loading?: boolean;
}

export const VerifyInput: React.FC<VerifyInputProps> = ({ onSearch, loading }) => {
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Entrez un numéro à vérifier..."
        keyboardType="phone-pad"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => onSearch(phone)}
        disabled={loading || !phone}
      >
        <Text style={styles.buttonText}>{loading ? '...' : 'Vérifier'}</Text>
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
