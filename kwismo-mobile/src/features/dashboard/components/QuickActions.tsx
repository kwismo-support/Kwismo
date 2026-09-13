// Composant d'actions rapides sur l'écran d'accueil
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ActionItem {
  id: string;
  label: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: ActionItem[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <View style={styles.container}>
      {actions.map((act) => (
        <TouchableOpacity key={act.id} style={styles.button} onPress={act.onPress} activeOpacity={0.7}>
          <Text style={styles.buttonText}>{act.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
