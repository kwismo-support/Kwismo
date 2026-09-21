import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { verifyUserPin, saveUserPin } from '@/shared/lib/secureStore';

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
    if (showBiometric && mode === 'verify' && onBiometric) {
      const timer = setTimeout(() => {
        onBiometric();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [showBiometric, mode, onBiometric]);

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
    (mode === 'setup'
      ? step === 'confirm'
        ? t('pinPad.setupTitlePhase2')
        : t('pinPad.setupTitlePhase1')
      : t('pinPad.verifyTitle'));

  const currentSubtitle =
    (mode === 'setup'
      ? step === 'confirm'
        ? t('pinPad.setupSubPhase2')
        : t('pinPad.setupSubPhase1')
      : t('pinPad.verifySub'));

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg rounded-t-[28px] items-center pt-8 px-6">
      <View className="items-center mb-6">
        <View className="wx-25 hx-25 rounded-full bg-emerald-50 dark:bg-emerald-950/30 items-center justify-center mb-4">
          <Icon name="solar:lock-keyhole-bold" size={42} color="#25B876" />
        </View>
        <Text className="font-montserrat-bold text-xl font-bold text-center mb-1.5 text-slate-900 dark:text-white">
          {currentTitle}
        </Text>
        <Text className="text-xs text-center text-slate-400 dark:text-slate-400 max-w-[280px] leading-5">
          {currentSubtitle}
        </Text>
      </View>

      <View className="flex-row gap-4 mb-6">
        {Array.from({ length: PIN_LEN }).map((_, i) => {
          const filled = i < pin.length;
          return (
            <View
              key={i}
              className={`wx-5 hx-5 rounded-full border-2 ${
                filled
                  ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white'
                  : 'bg-transparent border-slate-300 dark:border-slate-700'
              }`}
            />
          );
        })}
      </View>

      {error ? (
        <Text className="text-xs mb-2 text-center text-red-500 font-medium">{error}</Text>
      ) : (
        <View className="h-5 mb-2" />
      )}

      {loading && <ActivityIndicator color="#25B46E" className="mb-3" />}

      <View className="flex-row flex-wrap w-72 justify-center gap-4 mt-2">
        {KEYS.map((k) => {
          if (k === 'bio') {
            return showBiometric && mode === 'verify' ? (
              <TouchableOpacity
                key="bio"
                className="wx-18 hx-18 rounded-full border border-slate-200 dark:border-slate-700 items-center justify-center"
                onPress={() => press('bio')}
                activeOpacity={0.7}
              >
                <Icon name="solar:fingerprint-bold" size={28} color="#25B46E" />
              </TouchableOpacity>
            ) : (
              <View key="bio" className="wx-18 hx-18" />
            );
          }

          if (k === 'del') {
            return (
              <TouchableOpacity
                key="del"
                className="wx-18 hx-18 rounded-full border border-slate-200 dark:border-slate-700 items-center justify-center"
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
              className="wx-18 hx-18 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-brand-cardDark items-center justify-center"
              onPress={() => press(k)}
              activeOpacity={0.7}
            >
              <Text className="font-montserrat-bold text-2xl font-bold text-slate-900 dark:text-white">
                {k}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PinPad;
