// Composant d'indicateur d'étape du transfert d'argent
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TransferStepperProps {
  currentStep: number;
  totalSteps?: number;
}

export const TransferStepper: React.FC<TransferStepperProps> = ({ currentStep, totalSteps = 3 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNum = index + 1;
        const isActive = stepNum <= currentStep;
        return (
          <View key={stepNum} style={styles.stepWrapper}>
            <View style={[styles.circle, isActive && styles.circleActive]}>
              <Text style={[styles.stepText, isActive && styles.stepTextActive]}>{stepNum}</Text>
            </View>
            {stepNum < totalSteps && <View style={[styles.line, isActive && styles.lineActive]} />}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleActive: {
    backgroundColor: '#0F172A',
  },
  stepText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  line: {
    width: 40,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  lineActive: {
    backgroundColor: '#0F172A',
  },
});
