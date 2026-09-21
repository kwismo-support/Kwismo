import { ApiClient } from '../../../shared/services/apiClient';

export interface SurveyItem {
  id: string;
  question: string;
  actif: boolean;
}

export interface SurveyResponseData {
  id: string;
  survey_id: string;
  reponse: string;
  date_reponse: string;
}

export const surveyApi = {
  async getActiveSurveys() {
    return ApiClient.request<SurveyItem[]>('/surveys/active', {
      method: 'GET',
    });
  },

  async getSurveys() {
    const res = await ApiClient.request<SurveyItem[]>('/surveys/active', {
      method: 'GET',
    });
    return {
      ...res,
      data: res.data ? { items: res.data } : undefined,
    };
  },

  async answerSurvey(surveyId: string, rating: number, comment?: string) {
    const payload = JSON.stringify({ rating, comment: comment?.trim() || '' });
    return ApiClient.request<SurveyResponseData>(`/surveys/${surveyId}/answer`, {
      method: 'POST',
      body: { reponse: payload },
    });
  },

  async submitAnswers(surveyId: string, answers: any) {
    const payload = typeof answers === 'string' ? answers : JSON.stringify(answers);
    return ApiClient.request<SurveyResponseData>(`/surveys/${surveyId}/answer`, {
      method: 'POST',
      body: { reponse: payload },
    });
  },
};
