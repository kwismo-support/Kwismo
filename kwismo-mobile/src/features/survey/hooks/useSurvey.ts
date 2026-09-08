// Hook React pour gérer les réponses aux sondages
import { useState } from 'react';
import { surveyApi, SurveyResponsePayload } from '../services/survey.api';

export function useSurvey() {
  const [loading, setLoading] = useState(false);

  const submitFeedback = async (payload: SurveyResponsePayload) => {
    setLoading(true);
    try {
      return await surveyApi.submitSurvey(payload);
    } finally {
      setLoading(false);
    }
  };

  return { submitFeedback, loading };
}
