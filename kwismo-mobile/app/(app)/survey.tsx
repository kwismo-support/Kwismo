import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, fonts } from '../../src/styles/tokens';

export default function SurveyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enquête</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.white },
});
