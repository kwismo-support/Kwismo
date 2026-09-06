import { ApiClient } from './apiClient';
import { UserSimNumber, MOCK_SIM_NUMBERS } from '../mock/simNumbersMock';

export class SimService {
  public static async getMyNumbers() {
    return ApiClient.request<UserSimNumber[]>('/my-numbers', {
      method: 'GET',
      mockDataFallback: MOCK_SIM_NUMBERS,
    });
  }

  public static async addNumber(payload: { countryCode: string; callingCode: string; phone: string }) {
    return ApiClient.request<UserSimNumber>('/my-numbers', {
      method: 'POST',
      body: payload,
      mockDataFallback: {
        id: `num-${Date.now()}`,
        countryCode: payload.countryCode,
        callingCode: payload.callingCode,
        phone: payload.phone,
        operator: 'Orange',
        status: 'pending',
        addedDate: "Aujourd'hui",
      },
    });
  }

  public static async declareCompromised(id: string) {
    return ApiClient.request(`/my-numbers/${id}/compromised`, {
      method: 'PUT',
      mockDataFallback: { success: true },
    });
  }

  public static async restoreSecurity(id: string) {
    return ApiClient.request(`/my-numbers/${id}/restore`, {
      method: 'PUT',
      mockDataFallback: { success: true },
    });
  }
}
