import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
import { colors } from '@/styles/tokens';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { user } = useAuthStore();
  const { profile, updateProfile, loading: isSaving } = useProfile();

  const [lastName, setLastName] = useState(user?.lastName || profile?.nom || '');
  const [firstName, setFirstName] = useState(user?.firstName || profile?.prenom || '');
  const [phone, setPhone] = useState(profile?.telephone || '');
  const [email] = useState(user?.email || profile?.email || '');
  const [countryName, setCountryName] = useState('Cameroun');
  const [countryCode, setCountryCode] = useState('CM');
  const [, setProfilePhoto] = useState<string | null>(profile?.photo_url || null);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (profile) {
      if (profile.nom) setLastName(profile.nom);
      if (profile.prenom) setFirstName(profile.prenom);
      if (profile.telephone) setPhone(profile.telephone);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!firstName.trim() && !lastName.trim()) {
      setNameError(t('validation.required'));
      return;
    }

    const res = await updateProfile({
      nom: lastName.trim(),
      prenom: firstName.trim(),
      telephone: phone.trim(),
      indicatif_pays: countryCode,
    });

    if (res.success) {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      <HeaderBar
        title={t('profile.personalInfo')}
        showBack={true}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSave}
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
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="self-center relative mb-6">
          <View className="wx-24 hx-24 rounded-full items-center justify-center bg-slate-200 dark:bg-slate-700">
            <Text className="font-extrabold text-3xl text-slate-900 dark:text-white">
              {(firstName || lastName || 'K').charAt(0).toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsPhotoPickerOpen(true)}
            className="absolute bottom-0.5 right-0.5 wx-7 hx-7 rounded-full bg-brand-green items-center justify-center border-2 border-white dark:border-slate-800"
          >
            <Icon name="solar:camera-bold" color={colors.white} size={16} />
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

        <View className="mt-3">
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

        <View className="mt-3">
          <Input
            label={t('common.email')}
            value={email}
            editable={false}
            keyboardType="email-address"
            placeholder={t('common.emailPlaceholder')}
            iconLeft="solar:letter-linear"
          />
        </View>

        <View className="mt-3">
          <Input
            label={t('common.phoneNumber')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+237 600 00 00 00"
            iconLeft="solar:phone-calling-linear"
          />
        </View>

        <View className="mt-3">
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
    </View>
  );
}
