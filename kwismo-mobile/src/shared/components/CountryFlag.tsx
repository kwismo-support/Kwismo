import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';

interface CountryFlagProps {
  countryCode: string;
  size?: number;
  style?: ViewStyle;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  size = 24,
  style,
}) => {
  const [hasError, setHasError] = useState(false);
  const code = (countryCode || '').toLowerCase().trim();

  // Fallback emoji
  const fallbackEmoji = countryCode
    ? countryCode.toUpperCase().replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    : '🌐';

  if (!code || hasError || code.length !== 2) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
      >
        <Text style={{ fontSize: size * 0.65 }}>{fallbackEmoji}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Image
        source={{ uri: `https://flagcdn.com/w80/${code}.png` }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
        onError={() => setHasError(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
