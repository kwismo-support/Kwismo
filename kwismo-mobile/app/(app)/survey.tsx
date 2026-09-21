import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Icon } from '@/shared/ui/Icon';
import { HeaderBar } from '@/shared/components/HeaderBar';
import { SatisfactionSurveyModal } from '@/features/survey/components/SatisfactionSurveyModal';
import { surveyApi, SurveyItem } from '@/features/survey/services/survey.api';

export default function SurveyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(true);
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<SurveyItem | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const res = await surveyApi.getActiveSurveys();
      if (res.success && res.data && res.data.length > 0) {
        setSurveys(res.data);
        setActiveSurvey(res.data[0]);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-brand-navy dark:bg-brand-darkBg">
      <StatusBar style="light" />
      <HeaderBar
        title="Enquête de satisfaction"
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} className="p-6">
        <View className="bg-white dark:bg-brand-cardDark rounded-3xl p-6 items-center border border-slate-100 dark:border-slate-800">
          <Icon name="solar:chat-round-dots-bold" color="#F97316" size={56} className="mb-4" />
          <Text className="font-extrabold text-xl text-slate-900 dark:text-white text-center mb-2">
            Votre avis compte pour nous !
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400 text-center leading-5 mb-6">
            Aidez-nous à améliorer la protection et la sécurité des appels en répondant à notre courte enquête de satisfaction.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setModalVisible(true)}
            className="w-full h-12 rounded-2xl bg-brand-orange justify-center items-center shadow-md shadow-brand-orange/30"
          >
            <Text className="text-white text-base font-bold">Ouvrir l'enquête</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SatisfactionSurveyModal
        visible={modalVisible}
        surveyId={activeSurvey?.id}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
