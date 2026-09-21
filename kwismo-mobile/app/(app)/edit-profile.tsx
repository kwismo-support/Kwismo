import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '@/shared/ui/Input';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { CountrySelectInput } from '@/shared/components/CountrySelectInput';
import { ProfilePhotoPickerModal } from '@/shared/components/ProfilePhotoPickerModal';
import { useAuthStore } from '@/shared/store/authStore';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { toast } from '@/shared/store/toastStore';
import { colors } from '@/styles/tokens';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { user } = useAuthStore();
  const { profile, updateProfile, loading: isSaving } = useProfile();

  const initialEmail = user?.email || profile?.email || '';

  const [lastName, setLastName] = useState(user?.lastName || profile?.nom || '');
  const [firstName, setFirstName] = useState(user?.firstName || profile?.prenom || '');
  const [email, setEmail] = useState(initialEmail);
  const [countryName, setCountryName] = useState('Cameroun');
  const [countryCode, setCountryCode] = useState('CM');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(profile?.photo_url || null);

  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [emailWarningModalVisible, setEmailWarningModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.nom) setLastName(profile.nom);
      if (profile.prenom) setFirstName(profile.prenom);
      if (profile.email) setEmail(profile.email);
    }
  }, [profile]);

  const handleSaveClick = () => {
    if (!firstName.trim() && !lastName.trim()) {
      setNameError(t('validation.required'));
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setEmailError(t('validation.emailInvalid'));
      return;
    }

    const emailHasChanged = email.trim().toLowerCase() !== initialEmail.trim().toLowerCase();

    if (emailHasChanged) {
      setEmailWarningModalVisible(true);
    } else {
      executeSaveProfile({ email: initialEmail });
    }
  };

  const handleConfirmSendOtp = () => {
    setEmailWarningModalVisible(false);
    setOtpModalVisible(true);
    toast.info(t('profile.otpSentToEmail', { email: email.trim() }));
  };

  const handleVerifyOtpAndSave = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpCode;
    if (finalCode.length < 4) {
      toast.error(t('validation.otpIncomplete'));
      return;
    }

    setOtpLoading(true);
    try {
      await executeSaveProfile({ email: email.trim() });
      setOtpModalVisible(false);
    } catch {
      toast.error(t('profile.otpValidationError'));
    } finally {
      setOtpLoading(false);
    }
  };

  const executeSaveProfile = async (overrides: { email?: string } = {}) => {
    const res = await updateProfile({
      nom: lastName.trim(),
      prenom: firstName.trim(),
      email: overrides.email || email.trim(),
      photo_url: profilePhoto || undefined,
    });

    if (res.success) {
      toast.success(t('profile.updatedSuccess'));
      router.back();
    } else {
      toast.error((res as any).message || t('errors.generalMessage'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-brand-darkBg"
    >
      <StatusBar style="light" />

      <HeaderBar
        title={t('profile.personalInfo')}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSaveClick}
            disabled={isSaving}
            className="p-1"
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Icon name="gravity-ui:check" color="#FFFFFF" size={24} />
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: insets.bottom + 80,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="self-center relative mb-6">
          <View className="wx-24 hx-24 rounded-full items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 overflow-hidden border-2 border-brand-green">
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Text className="font-headline-bold text-3xl font-extrabold text-brand-green dark:text-emerald-400">
                {(firstName || lastName || 'K').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsPhotoPickerOpen(true)}
            className="absolute bottom-0.5 right-0.5 wx-8 hx-8 rounded-full bg-brand-green items-center justify-center border-2 border-white dark:border-slate-800 shadow-md"
          >
            <Icon name="solar:camera-bold" color={colors.white} size={18} />
          </TouchableOpacity>
        </View>

        <Input
          label={t('common.firstName')}
          value={firstName}
          onChangeText={(val) => {
            setFirstName(val);
            if (nameError) setNameError('');
          }}
          placeholder={t('common.firstNamePlaceholder')}
          error={nameError}
          iconLeft="solar:user-linear"
        />

        <View className="mt-4">
          <Input
            label={t('common.lastName')}
            value={lastName}
            onChangeText={(val) => {
              setLastName(val);
              if (nameError) setNameError('');
            }}
            placeholder={t('common.lastNamePlaceholder')}
            iconLeft="solar:user-linear"
          />
        </View>

        <View className="mt-4">
          <Input
            label={t('common.email')}
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (emailError) setEmailError('');
            }}
            keyboardType="email-address"
            placeholder={t('common.emailPlaceholder')}
            error={emailError}
            iconLeft="solar:letter-linear"
          />
        </View>

        <View className="mt-4">
          <CountrySelectInput
            label={t('common.country')}
            value={countryName}
            countryCode={countryCode}
            onSelectCountry={(name, code) => {
              setCountryName(name);
              setCountryCode(code);
            }}
          />
        </View>
      </ScrollView>

      <ProfilePhotoPickerModal
        visible={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        onSelectPhoto={(url) => setProfilePhoto(url)}
      />

      <Modal visible={emailWarningModalVisible} transparent animationType="fade">
        <Pressable className="flex-1 justify-center items-center bg-black/60 px-5" onPress={() => setEmailWarningModalVisible(false)}>
          <Pressable className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-brand-cardDark border border-slate-100 dark:border-slate-800 shadow-2xl">
            <View className="wx-12 hx-12 rounded-full bg-amber-100 dark:bg-amber-950/40 items-center justify-center mb-4 self-center">
              <Icon name="solar:shield-warning-bold" color="#F59E0B" size={28} />
            </View>

            <Text className="font-montserrat-bold text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
              {t('profile.emailChangeTitle')}
            </Text>

            <Text className="text-xs text-slate-600 dark:text-slate-300 text-center leading-5 mb-6">
              {t('profile.emailChangeWarning', { email })}
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setEmailWarningModalVisible(false)}
                className="flex-1 hx-11 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center"
              >
                <Text className="font-bold text-xs text-slate-700 dark:text-slate-300">
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleConfirmSendOtp}
                className="flex-1 hx-11 rounded-xl bg-brand-green items-center justify-center"
              >
                <Text className="font-bold text-xs text-white">
                  {t('common.continue')}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={otpModalVisible} transparent animationType="slide">
        <Pressable className="flex-1 justify-end bg-black/60" onPress={() => setOtpModalVisible(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="rounded-t-3xl p-6 pb-8 bg-white dark:bg-brand-cardDark"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-headline-bold text-base font-extrabold text-slate-900 dark:text-white">
                {t('profile.otpModalTitle')}
              </Text>
              <TouchableOpacity onPress={() => setOtpModalVisible(false)}>
                <Icon name="solar:close-circle-bold" color="#94A3B8" size={24} />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {t('profile.otpModalSubtitle', { email })}
            </Text>

            <View className="mb-6">
              <TextInput
                autoFocus
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={(val: string) => {
                  setOtpCode(val);
                  if (val.length === 6) {
                    handleVerifyOtpAndSave(val);
                  }
                }}
                className="h-14 bg-slate-100 dark:bg-brand-cardDark rounded-2xl text-center text-2xl font-bold tracking-widest text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                placeholder="000000"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleVerifyOtpAndSave()}
              disabled={otpLoading}
              className="w-full h-12 rounded-2xl bg-brand-green items-center justify-center flex-row"
            >
              {otpLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="font-bold text-sm text-white">
                  {t('profile.validateAndSave')}
                </Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

