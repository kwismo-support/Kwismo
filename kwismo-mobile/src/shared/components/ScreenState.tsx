import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface ScreenStateProps {
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export const ScreenState: React.FC<ScreenStateProps> = ({ loading, error, children }) => {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
});
