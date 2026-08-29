import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { KwismoLogo } from '../../src/shared/components/KwismoLogo';
import { LanguageSwitcher } from '../../src/shared/components/LanguageSwitcher';
import { colors, fonts } from '../../src/styles/tokens';
export default function AuthWelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {/* Background Gradient matching Image 2 */}
      <LinearGradient
        colors={['#32B07F', '#248563', '#1C433D', '#161E33', '#161E33']}
        locations={[0, 0.3, 0.55, 0.8, 1]}
        colors={[
          '#2EAF7D',
          '#238A64',
          '#223948',
          '#4D6274',
          '#BDC9D4',
          '#FFFFFF',
        ]}
        locations={[0, 0.22, 0.45, 0.65, 0.82, 0.93]}
        style={StyleSheet.absoluteFill}
      />
      {/* Top right language switcher */}
      <View style={[styles.langWrapper, { top: insets.top + 16 }]}>
      <View style={[styles.langWrapper, { top: Math.max(insets.top + 16, 20) }]}>
        <LanguageSwitcher darkTheme={true} />
