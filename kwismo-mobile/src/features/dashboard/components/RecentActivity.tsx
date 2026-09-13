// Composant d'affichage des activités récentes du tableau de bord
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Activités récents</Text>
      {activities.length === 0 ? (
        <Text style={styles.emptyText}>Aucune activité récente</Text>
      ) : (
        activities.map((act) => (
          <View key={act.id} style={styles.item}>
            <View style={styles.itemContent}>
              <Text style={styles.title}>{act.title}</Text>
              <Text style={styles.desc}>{act.description}</Text>
            </View>
            <Text style={styles.time}>{act.timestamp}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  desc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 8,
  },
});
