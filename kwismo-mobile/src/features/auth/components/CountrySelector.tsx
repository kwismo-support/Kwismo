import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CountrySelectorProps {
  selectedCountry?: string;
  onSelect?: (country: string) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ selectedCountry = 'CM (+237)', onSelect }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onSelect && onSelect(selectedCountry)}>
      <Text style={styles.text}>{selectedCountry}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
