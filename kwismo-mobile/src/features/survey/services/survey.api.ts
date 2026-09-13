// Service API backend pour les enquêtes via FastAPI (/surveys)
import { ApiClient } from '../../../shared/services/apiClient';

export interface SurveyQuestion {
  id: string;
  texte_fr: string;
  texte_en: string;
  type_question: string;
  options?: string[];
}

export interface SurveyItem {
  id: string;
  titre_fr: string;
  titre_en: string;
  description_fr?: string;
  description_en?: string;
  questions: SurveyQuestion[];
}

export const surveyApi = {
  async getSurveys() {
    return ApiClient.request<{ items: SurveyItem[] }>('/surveys', {
      method: 'GET',
    });
  },

  async submitAnswers(survey_id: string, reponses: Array<{ question_id: string; valeur: string }>) {
    return ApiClient.request<{ message: string }>(`/surveys/${survey_id}/answers`, {
      method: 'POST',
      body: { reponses },
    });
  },
};

