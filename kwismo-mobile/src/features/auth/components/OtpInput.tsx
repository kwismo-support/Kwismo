import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (code: string) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({ length = 6, value, onChange }) => {
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, '');

    if (clean.length > 1) {
      const digits = clean.slice(0, length);
      onChange(digits);
      const nextIndex = Math.min(digits.length, length - 1);
      inputs.current[nextIndex]?.focus();
      return;
    }

    const currentArray = (value || '').padEnd(length, ' ').split('');
    currentArray[index] = clean || ' ';
    const codeStr = currentArray.join('').trimEnd();
    onChange(codeStr);

    if (clean && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => { inputs.current[i] = ref; }}
          style={styles.box}
          keyboardType="number-pad"
          maxLength={length}
          value={value[i] || ''}
          onChangeText={(val) => handleChange(val, i)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  box: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#020617',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#020617',
  },
});
