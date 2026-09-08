// Composant d'entrée pour le montant du transfert avec suffixe FCFA
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const AmountInput: React.FC<AmountInputProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#94A3B8"
      />
      <Text style={styles.currency}>FCFA</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  currency: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 8,
  },
});
