// Composant de pavé numérique PIN 6 chiffres pour la sécurité biométrique et verrouillage
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '../ui/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, fonts } from '../../styles/tokens';
import { scaleFont } from '../lib/responsive';
import { verifyUserPin, saveUserPin } from '../lib/secureStore';

const PIN_LEN = 6;
type Mode = 'setup' | 'verify';

interface PinPadProps {
  mode: Mode;
  title?: string;
  subtitle?: string;
  onSuccess: (pin?: string) => void;
  onCancel?: () => void;
  showBiometric?: boolean;
  onBiometric?: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'] as const;

export const PinPad: React.FC<PinPadProps> = ({
  mode,
  title,
  subtitle,
  onSuccess,
  onCancel,
  showBiometric = false,
  onBiometric,
}) => {
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();

  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pin.length < PIN_LEN) return;

    if (mode === 'setup') {
      if (step === 'enter') {
        setFirstPin(pin);
        setPin('');
        setStep('confirm');
        setError('');
      } else {
        if (pin === firstPin) {
          saveUserPin(pin);
          onSuccess(pin);
        } else {
          setError(t('security.pinMismatch', 'Les codes PIN ne correspondent pas. Réessayez.'));
          setPin('');
          setFirstPin('');
          setStep('enter');
        }
      }
      return;
    }

    // Mode 'verify'
    const check = async () => {
      setLoading(true);
      const ok = await verifyUserPin(pin);
      setLoading(false);
      if (ok) {
        onSuccess(pin);
      } else {
        setError(t('security.pinWrong', 'Code PIN incorrect. Veuillez réessayer.'));
        setPin('');
      }
    };
    check();
  }, [pin, firstPin, mode, step, onSuccess, t]);

  const press = useCallback(
    (k: (typeof KEYS)[number]) => {
      if (loading) return;
      setError('');
      if (k === 'del') {
        setPin((p) => p.slice(0, -1));
      } else if (k === 'bio') {
        onBiometric?.();
      } else {
        setPin((p) => (p.length < PIN_LEN ? p + k : p));
      }
    },
    [loading, onBiometric]
  );

  const currentTitle =
    title ||
    (mode === 'setup'
      ? step === 'confirm'
        ? t('security.confirmPin', 'Confirmez votre code PIN à 6 chiffres')
        : t('security.definePin', 'Définissez un code PIN à 6 chiffres')
      : t('security.enterPin', 'Entrez votre code PIN'));

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      {/* En-tête avec Icône de cadenats unifiée */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: themeColors.inputBg }]}>
          <Icon name="solar:lock-password-bold" size={32} color={colors.green} />
        </View>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>{currentTitle}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>

      {/* Indicateur de saisie à 6 points */}
      <View style={styles.dotsRow}>
        {Array.from({ length: PIN_LEN }).map((_, i) => {
          const filled = i < pin.length;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: filled ? colors.green : 'transparent',
                  borderColor: filled ? colors.green : themeColors.inputBorder,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Affichage d'erreur avec traduction i18n */}
      {error ? (
        <Text style={[styles.error, { color: '#EF4444' }]}>{error}</Text>
      ) : (
        <View style={styles.errorPlaceholder} />
      )}

      {loading && <ActivityIndicator color={colors.green} style={styles.spinner} />}

      {/* Clavier numérique */}
      <View style={styles.numpad}>
        {KEYS.map((k) => {
          if (k === 'bio') {
            return showBiometric && mode === 'verify' ? (
              <TouchableOpacity
                key="bio"
                style={styles.key}
                onPress={() => press('bio')}
                activeOpacity={0.7}
              >
                <Icon name="solar:fingerprint-bold" size={28} color={colors.green} />
              </TouchableOpacity>
            ) : (
              <View key="bio" style={styles.key} />
            );
          }

          if (k === 'del') {
            return (
              <TouchableOpacity
                key="del"
                style={styles.key}
                onPress={() => press('del')}
                activeOpacity={0.7}
              >
                <Icon name="solar:backspace-linear" size={26} color={themeColors.textPrimary} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={k}
              style={[styles.key, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}
              onPress={() => press(k)}
              activeOpacity={0.7}
            >
              <Text style={[styles.keyText, { color: themeColors.textPrimary }]}>{k}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bouton Annuler */}
      {onCancel ? (
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
          <Text style={[styles.cancelText, { color: themeColors.textSecondary }]}>
            {t('common.cancel', 'Annuler')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: scaleFont(18),
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: scaleFont(13),
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  error: {
    fontSize: scaleFont(12),
    fontFamily: fonts.regular,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorPlaceholder: {
    height: 20,
    marginBottom: 8,
  },
  spinner: {
    marginBottom: 12,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 252,
    justifyContent: 'center',
    gap: 14,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: scaleFont(22),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 24,
  },
  cancelText: {
    fontSize: scaleFont(14),
    fontFamily: fonts.headlineBold,
    fontWeight: '600',
  },
});
