// Composant de feuille ou carte de sondage de satisfaction
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

interface SurveySheetProps {
  surveyId: string;
  title?: string;
  onSubmit: (rating: number, feedback?: string) => void;
}

export const SurveySheet: React.FC<SurveySheetProps> = ({
  title = 'Votre avis compte',
  onSubmit,
}) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Un commentaire à partager ?"
        value={feedback}
        onChangeText={setFeedback}
      />

      <TouchableOpacity style={styles.button} onPress={() => onSubmit(rating, feedback)}>
        <Text style={styles.buttonText}>Envoyer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  star: {
    fontSize: 28,
    color: '#CBD5E1',
    marginHorizontal: 4,
  },
  starActive: {
    color: '#EAB308',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#0F172A',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
