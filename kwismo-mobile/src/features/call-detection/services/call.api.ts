// Service API backend pour la détection et la vérification d'appels entrants suspects
import { ApiClient } from '../../../shared/services/apiClient';

export interface CallDetectionPayload {
  incomingNumber: string;
  timestamp: string;
}

export interface CallDetectionResult {
  isSpam: boolean;
  spamCategory?: string;
  riskScore: number;
  callerName?: string;
}

export const callApi = {
  async evaluateIncomingCall(payload: CallDetectionPayload) {
    return ApiClient.request<CallDetectionResult>('/call-detection/evaluate', {
      method: 'POST',
      body: payload,
      mockDataFallback: {
        isSpam: false,
        riskScore: 5,
        callerName: 'Numéro inconnu',
      },
    });
  },
};
