// Hook React pour les enquêtes utilisateur
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { surveyApi, SurveyItem } from '../services/survey.api';
import { toast } from '../../../shared/store/toastStore';

export function useSurvey() {
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await surveyApi.getSurveys();
      if (res.success && res.data) {
        setSurveys(res.data.items || []);
      } else {
        setError(res.message || t('errors.generalMessage', 'Erreur de sondages.'));
      }
    } catch (err: any) {
      setError(err.message || t('toasts.networkError', 'Erreur réseau.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const submitAnswers = async (survey_id: string, answers: Array<{ question_id: string; valeur: string }>) => {
    setLoading(true);
    try {
      const res = await surveyApi.submitAnswers(survey_id, answers);
      if (res.success) {
        toast.success(t('toasts.generalSuccess', 'Merci pour vos réponses !'));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    surveys,
    loading,
    error,
    refresh: fetchSurveys,
    submitAnswers,
  };
}
