import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui/Icon';
import { toast } from '@/shared/store/toastStore';
import { surveyApi } from '../services/survey.api';

export interface SatisfactionSurveyModalProps {
  visible: boolean;
  surveyId?: string;
  onClose: () => void;
  onSnooze?: () => void;
}

export function SatisfactionSurveyModal({
  visible,
  surveyId,
  onClose,
  onSnooze,
}: SatisfactionSurveyModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!visible) return null;

  const handleNextStep = () => {
    if (rating === 0) {
      toast.info('Veuillez sélectionner au moins une étoile pour continuer.');
      return;
    }
    setStep(2);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      if (surveyId) {
        await surveyApi.answerSurvey(surveyId, rating, comment);
      }
      toast.success(t('toasts.generalSuccess'));
      onClose();
    } catch {
      toast.success(t('toasts.generalSuccess'));
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnooze = () => {
    if (onSnooze) {
      onSnooze();
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center p-5">
        <View className="w-11/12 max-w-sm rounded-3xl p-6 bg-white dark:bg-brand-cardDark shadow-xl">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-extrabold text-base text-slate-900 dark:text-white">
              {t('survey.title')}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSnooze}
              className="flex-row items-center"
            >
              <Icon name="solar:clock-circle-bold" color="#94A3B8" size={14} className="mr-1" />
              <Text className="text-xs font-medium text-slate-400 dark:text-slate-400">
                {t('postCall.ignore')}
              </Text>
            </TouchableOpacity>
          </View>

          {step === 1 ? (
            <View>
              <Text className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-6 leading-5">
                {t('survey.bannerDesc')}
              </Text>

              <View className="flex-row items-center justify-center gap-2 mb-7">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <TouchableOpacity
                    key={starIndex}
                    activeOpacity={0.7}
                    onPress={() => setRating(starIndex)}
                    className="p-1"
                  >
                    <Icon
                      name="solar:star-bold"
                      size={36}
                      color={starIndex <= rating ? '#F97316' : '#E2E8F0'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleNextStep}
                className="w-full h-12 rounded-2xl bg-brand-orange justify-center items-center shadow-md shadow-brand-orange/30 mb-4"
              >
                <Text className="text-white text-base font-bold">{t('survey.next')}</Text>
              </TouchableOpacity>

              <Text className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-4">
                {t('survey.noticeText')}
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
                {t('survey.commentLabel')}
              </Text>

              <View className="relative mb-5">
                <TextInput
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 text-xs text-slate-900 dark:text-white min-h-[110px]"
                  placeholder={t('survey.commentPlaceholder')}
                  placeholderTextColor="#CBD5E1"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={comment}
                  onChangeText={setComment}
                />
                <View className="absolute bottom-2.5 right-2.5 opacity-40">
                  <Icon name="solar:sort-from-bottom-to-top-bold" color="#94A3B8" size={12} />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                disabled={isSubmitting}
                onPress={handleFinish}
                className="w-full h-12 rounded-2xl bg-brand-orange justify-center items-center shadow-md shadow-brand-orange/30 mb-4"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-base font-bold">{t('survey.finish')}</Text>
                )}
              </TouchableOpacity>

              <Text className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-4">
                {t('survey.noticeText')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
