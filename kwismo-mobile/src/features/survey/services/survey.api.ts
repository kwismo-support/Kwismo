// Service API backend pour la soumission de sondages / avis utilisateurs
import { ApiClient } from '../../../shared/services/apiClient';

export interface SurveyResponsePayload {
  surveyId: string;
  rating: number;
  feedback?: string;
}

export const surveyApi = {
  async submitSurvey(payload: SurveyResponsePayload) {
    return ApiClient.request<{ message: string }>('/surveys', {
      method: 'POST',
      body: payload,
      mockDataFallback: { message: 'Merci pour votre retour !' },
    });
  },
};
