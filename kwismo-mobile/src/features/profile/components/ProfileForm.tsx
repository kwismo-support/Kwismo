// Formulaire d'édition des informations personnelles
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

interface ProfileFormProps {
  initialValues: { fullName: string; email: string; phone: string };
  onSubmit: (values: { fullName: string; email: string; phone: string }) => void;
  loading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialValues, onSubmit, loading }) => {
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [email, setEmail] = useState(initialValues.email);
  const [phone, setPhone] = useState(initialValues.phone);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nom complet</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

      <Text style={styles.label}>Adresse Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

      <Text style={styles.label}>Téléphone principal</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <TouchableOpacity
        style={styles.button}
        onPress={() => onSubmit({ fullName, email, phone })}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#0F172A',
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
