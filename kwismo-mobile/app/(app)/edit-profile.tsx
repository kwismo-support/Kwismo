import React, { useState } from 'react';
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
import { Button } from '@/shared/ui/Button';
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
  const { updateProfile, loading: isSaving } = useProfile();

  const [lastName, setLastName] = useState(user?.lastName || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [email] = useState(user?.email || '');
  const [countryName, setCountryName] = useState('Cameroun');
  const [countryCode, setCountryCode] = useState('CM');
  const [, setProfilePhoto] = useState<string | null>(null);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);

  const [nameError, setNameError] = useState('');

  const handleSave = async () => {
    if (!firstName.trim() && !lastName.trim()) {
      setNameError(t('validation.required', 'Le nom ou prénom est obligatoire.'));
      return;
    }

    const res = await updateProfile({
      nom: lastName.trim(),
      prenom: firstName.trim(),
    });

    if (res.success) {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-brand-darkBg">
      <StatusBar style="light" />

      <HeaderBar title={t('profile.personalInfo')} showBack={true} />

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
          label={t('common.firstName', 'Prénom')}
          value={firstName}
          onChangeText={(val) => {
            setFirstName(val);
            if (nameError) setNameError('');
          }}
          placeholder="Ismaël"
          error={nameError}
          iconLeft="solar:user-linear"
        />

        <View className="mt-3">
          <Input
            label={t('common.lastName', 'Nom')}
            value={lastName}
            onChangeText={(val) => {
              setLastName(val);
              if (nameError) setNameError('');
            }}
            placeholder="Cesar"
            iconLeft="solar:user-linear"
          />
        </View>

        <View className="mt-3">
          <Input
            label={t('common.email', 'Adresse email')}
            value={email}
            editable={false}
            keyboardType="email-address"
            placeholder="votre.email@kwismo.com"
            iconLeft="solar:letter-linear"
          />
        </View>

        <View className="mt-3">
          <CountrySelectInput
            label={t('common.country', 'Pays')}
            value={countryName}
            countryCode={countryCode}
            onSelectCountry={(name, code) => {
              setCountryName(name);
              setCountryCode(code);
            }}
          />
        </View>

        <Button
          title={t('common.saveChanges', 'Enregistrer les modifications')}
          onPress={handleSave}
          loading={isSaving}
          variant="primary"
          size="md"
          className="mt-8"
        />
      </ScrollView>

      <ProfilePhotoPickerModal
        visible={isPhotoPickerOpen}
        onClose={() => setIsPhotoPickerOpen(false)}
        onSelectPhoto={(url) => setProfilePhoto(url)}
      />
    </View>
  );
}

