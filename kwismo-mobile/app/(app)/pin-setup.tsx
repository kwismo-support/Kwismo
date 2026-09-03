import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function PinSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  // Simulé : Code PIN actuel déjà configuré ou non
  const [hasExistingPin, setHasExistingPin] = useState(true);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [currentPinError, setCurrentPinError] = useState('');
  const [newPinError, setNewPinError] = useState('');
  const [confirmPinError, setConfirmPinError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSavePin = () => {
    let valid = true;
    setCurrentPinError('');
    setNewPinError('');
    setConfirmPinError('');

    if (hasExistingPin && currentPin !== '123456' && currentPin.length < 6) {
      setCurrentPinError('Code PIN actuel incorrect.');
      valid = false;
    }

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setNewPinError('Le code PIN doit comporter exactement 6 chiffres.');
      valid = false;
    }

    if (newPin !== confirmPin) {
      setConfirmPinError('Les deux codes PIN ne correspondent pas.');
      valid = false;
    }

    if (!valid) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        hasExistingPin
          ? 'Code PIN à 6 chiffres modifié avec succès !'
          : 'Code PIN à 6 chiffres configuré avec succès !'
      );
      router.back();
    }, 600);
  };

  const renderPinDots = (pinValue: string) => {
    return (
      <View style={styles.dotsRow}>
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const filled = idx < pinValue.length;
          return (
            <View
              key={idx}
              style={[
                styles.dotBox,
                {
                  backgroundColor: filled ? colors.green : themeColors.inputBg,
                  borderColor: filled ? colors.green : themeColors.inputBorder,
                },
              ]}
            >
              {filled && <View style={styles.dotInner} />}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header unifié de page secondaire sans cloche */}
      <HeaderBar
        title={hasExistingPin ? 'Modifier le code PIN' : 'Définir un code PIN'}
        showBack={true}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          {hasExistingPin
            ? 'Modifier votre code PIN à 6 chiffres'
            : 'Configuration du code PIN de secours'}
        </Text>

        <Text style={[styles.subText, { color: themeColors.textSecondary }]}>
          Ce code PIN à 6 chiffres sert de méthode de secours si le déverrouillage biométrique (Face ID / Empreinte) échoue ou n'est pas disponible.
        </Text>

        {/* Code PIN Actuel si déjà existant */}
        {hasExistingPin && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>
              Code PIN actuel
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: currentPinError ? '#EF4444' : themeColors.inputBorder }]}>
              <Icon name="solar:key-bold" color={colors.green} size={20} style={{ marginRight: 10 }} />
              <TextInput
                style={[
                  styles.textInput,
                  { color: themeColors.textPrimary },
                  Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
                ]}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
                value={currentPin}
                onChangeText={(text) => {
                  setCurrentPin(text);
                  if (currentPinError) setCurrentPinError('');
                }}
                placeholder="123456"
                placeholderTextColor={themeColors.inputPlaceholder}
              />
            </View>
            {renderPinDots(currentPin)}
            {currentPinError ? (
              <Text style={styles.errorText}>{currentPinError}</Text>
            ) : null}
          </View>
        )}

        {/* Nouveau Code PIN */}
        <View style={{ marginTop: 20 }}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>
            Nouveau code PIN (6 chiffres)
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: newPinError ? '#EF4444' : themeColors.inputBorder }]}>
            <Icon name="solar:lock-keyhole-bold" color={colors.green} size={20} style={{ marginRight: 10 }} />
            <TextInput
              style={[
                styles.textInput,
                { color: themeColors.textPrimary },
                Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
              ]}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
              value={newPin}
              onChangeText={(text) => {
                setNewPin(text);
                if (newPinError) setNewPinError('');
              }}
              placeholder="Saisissez 6 chiffres"
              placeholderTextColor={themeColors.inputPlaceholder}
            />
          </View>
          {renderPinDots(newPin)}
          {newPinError ? <Text style={styles.errorText}>{newPinError}</Text> : null}
        </View>

        {/* Confirmation Nouveau Code PIN */}
        <View style={{ marginTop: 20 }}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>
            Confirmer le nouveau code PIN
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: themeColors.inputBg, borderColor: confirmPinError ? '#EF4444' : themeColors.inputBorder }]}>
            <Icon name="solar:check-read-bold" color={colors.green} size={20} style={{ marginRight: 10 }} />
            <TextInput
              style={[
                styles.textInput,
                { color: themeColors.textPrimary },
                Platform.OS === 'web' ? ({ outline: 'none' } as any) : {},
              ]}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
              value={confirmPin}
              onChangeText={(text) => {
                setConfirmPin(text);
                if (confirmPinError) setConfirmPinError('');
              }}
              placeholder="Confirmez les 6 chiffres"
              placeholderTextColor={themeColors.inputPlaceholder}
            />
          </View>
          {renderPinDots(confirmPin)}
          {confirmPinError ? <Text style={styles.errorText}>{confirmPinError}</Text> : null}
        </View>

        {/* Bouton de soumission */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isSubmitting}
          onPress={handleSavePin}
          style={[styles.saveBtn, { backgroundColor: colors.green, marginTop: 32 }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>
              {hasExistingPin ? 'Enregistrer le nouveau PIN' : 'Valider le code PIN'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollBody: { paddingHorizontal: 20, paddingTop: 20 },
  title: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(17),
    fontWeight: '800',
  },
  subText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    marginTop: 4,
    lineHeight: scaleFont(18),
  },
  label: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(13),
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    letterSpacing: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  dotBox: {
    width: 36,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    color: '#EF4444',
    marginTop: 6,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: colors.white,
  },
});
