// Composant représentant la carte d'un contact dans la liste
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBadge } from './StatusBadge';
import { ContactItem as ContactData } from '../services/contacts.api';

interface ContactItemProps {
  contact: ContactData;
  onPress?: () => void;
}

export const ContactItem: React.FC<ContactItemProps> = ({ contact, onPress }) => {
  const displayName = `${contact.prenom || ''} ${contact.nom}`.trim() || contact.numero_valeur;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.phone}>{contact.numero_valeur}</Text>
      </View>
      <StatusBadge status={contact.insigne_reputation as any || 'unknown'} />
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  phone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});
