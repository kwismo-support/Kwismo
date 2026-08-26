import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../../src/styles/tokens';

export default function OtpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Vérification OTP</Text>
        <Text style={styles.subtitle}>Saisissez le code reçu par SMS</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(app)')}
        >
          <Text style={styles.buttonText}>Valider</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.gray300,
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: colors.green,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.white,
  },
});
