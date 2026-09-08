// Composant de sélection des contacts destinataires de l'alerte
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

interface ContactItem {
  id: string;
  name: string;
  phone: string;
}

interface ContactPickerProps {
  contacts: ContactItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

export const ContactPicker: React.FC<ContactPickerProps> = ({
  contacts,
  selectedIds,
  onToggleSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sélectionner les destinataires</Text>
      {contacts.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.row, isSelected && styles.rowSelected]}
            onPress={() => onToggleSelect(item.id)}
          >
            <View style={styles.checkbox}>
              <Text style={styles.checkText}>{isSelected ? '✓' : ''}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rowSelected: {
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#64748B',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  phone: {
    fontSize: 12,
    color: '#64748B',
  },
});
