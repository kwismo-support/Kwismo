import React, { useState } from 'react';
import { View, Image, Text, ViewStyle } from 'react-native';

interface CountryFlagProps {
  countryCode: string;
  size?: number;
  style?: ViewStyle;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  size = 24,
  style,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const code = (countryCode || '').toLowerCase().trim();

  const fallbackEmoji = countryCode
    ? countryCode.toUpperCase().replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    : 'solar:global-linear';

  if (!code || hasError || code.length !== 2) {
    return (
      <View
        className={`overflow-hidden rounded-xl items-center justify-center bg-slate-200 dark:bg-slate-800 ${className}`}
        style={[
          { width: size, height: size },
          style,
        ]}
      >
        <Text style={{ fontSize: size * 0.65 }}>{fallbackEmoji}</Text>
      </View>
    );
  }

  return (
    <View
      className={`overflow-hidden rounded-xl items-center justify-center bg-slate-200 dark:bg-slate-800 ${className}`}
      style={[
        { width: size, height: size },
        style,
      ]}
    >
      <Image
        className="rounded-xl"
        source={{ uri: `https://flagcdn.com/w80/${code}.png` }}
        style={{ width: size, height: size }}
        resizeMode="cover"
        onError={() => setHasError(true)}
      />
    </View>
  );
};

export default CountryFlag;
