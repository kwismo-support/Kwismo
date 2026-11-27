import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { useAppTheme } from '@/shared/hooks/useAppTheme';
import { AuthGradientBackground } from '@/shared/components/AuthGradientBackground';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { validateEmail } from '@/shared/lib/validation';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors: themeColors } = useAppTheme();
  const { handleForgotPassword } = useForgotPassword();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleReset = async () => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError(t('validation.emailRequired'));
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError(t('validation.emailInvalid'));
      return false;
    }

    const res = await handleForgotPassword(email);
    if (res.success) {
      setIsSent(true);
      return true;
    }
    return false;
  };

  if (isSent) {
    return (
      <AuthGradientBackground>
        <StatusBar style="light" />
        <View className="flex-1 px-6 justify-center items-center">
          <View className="w-full bg-white/10 dark:bg-slate-900/60 p-6 rounded-3xl border border-white/20 items-center">
            <View className="w-16 h-16 rounded-full bg-emerald-500/20 items-center justify-center mb-4 border border-emerald-500/30">
              <Icon name="solar:letter-opened-bold" color="#10B981" size={36} />
            </View>
            <Text className="font-montserrat-bold text-2xl text-white text-center mb-2">
              {t('auth.emailSentTitle', 'Lien envoyé !')}
            </Text>
            <Text className="text-white/90 text-sm text-center mb-6 leading-5">
              {t('auth.emailSentDesc', 'Un email contenant un lien de réinitialisation sécurisé a été envoyé à')} :
              {'\n'}
              <Text className="font-bold text-emerald-400">{email}</Text>
              {'\n\n'}
              {t('auth.emailSentInstruction', 'Veuillez ouvrir votre boîte de réception et cliquer sur ce lien pour choisir votre nouveau mot de passe.')}
            </Text>
            <View className="w-full gap-3">
              <Button
                title={t('auth.openEmailApp', 'Ouvrir ma boîte mail')}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('message://').catch(() => Linking.openURL('mailto:'));
                  } else {
                    Linking.openURL('mailto:');
                  }
                }}
                variant="primary"
                size="md"
              />
              <Button
                title={t('common.backToLogin', 'Retour à la connexion')}
                onPress={() => router.replace('/(auth)/login')}
                variant="secondary"
                size="md"
              />
            </View>
          </View>
        </View>
      </AuthGradientBackground>
    );
  }

  return (
    <AuthGradientBackground>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1 px-6 z-10"
          contentContainerStyle={{
            paddingTop: Math.max(insets.top + 40, 60),
            paddingBottom: Math.max(insets.bottom + 40, 60),
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <Text className="font-montserrat-bold text-3xl text-white mt-5">
            {t('auth.forgotTitle')}
          </Text>
          <Text className="font-medium text-base text-white/95 mt-3 mb-10">
            {t('auth.forgotSubtitle')}
          </Text>

          <View className="mb-6">
            <Input
              placeholder={t('common.email')}
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Icon name="solar:letter-linear" color={themeColors.inputPlaceholder} size={20} />}
            />
          </View>

          <Button
            title={t('common.reset')}
            onPress={handleReset}
            variant="primary"
            size="md"
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="mt-4 items-center py-2.5"
          >
            <Text className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              {t('common.back')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthGradientBackground>
  );
}
