import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { KwismoLogo } from '../../src/shared/components/KwismoLogo';
import { colors, fonts } from '../../src/styles/tokens';

export default function DashboardHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <KwismoLogo size={120} variant="white" />
        <Text style={styles.title}>Accueil / Dashboard</Text>
        <Text style={styles.subtitle}>Bienvenue sur l'application KWISMO</Text>
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
    marginTop: 24,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.gray300,
    marginTop: 8,
  },
});
