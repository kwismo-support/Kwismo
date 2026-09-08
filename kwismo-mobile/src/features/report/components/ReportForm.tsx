// Composant formulaire de signalement
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { ReportPayload } from '../services/report.api';

interface ReportFormProps {
  onSubmit: (payload: ReportPayload) => void;
  submitting?: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, submitting }) => {
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Numéro suspect</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="+2376XXXXXX"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Description du problème</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholder="Détails du problème ou tentative d'arnaque..."
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => onSubmit({ targetPhone: phone, category: 'fraud', description })}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? 'Envoi...' : 'Envoyer le signalement'}</Text>
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
