// Service API backend pour l'alerte WhatsApp via FastAPI (/whatsapp-alerts/incident et /whatsapp-alerts/broadcast)
import { ApiClient } from '../../../shared/services/apiClient';

export interface DeclareIncidentPayload {
  user_phone_id: string;
  custom_message?: string;
}

export interface BroadcastPayload {
  incident_id: string;
  recipient_phones: string[];
}

export interface IncidentOut {
  id: string;
  user_phone_id: string;
  statut: string;
  date_declaration: string;
}

export interface AlertOut {
  id: string;
  incident_id: string;
  destinataires_count: number;
}

export const whatsappApi = {
  async declareIncident(payload: DeclareIncidentPayload) {
    return ApiClient.request<IncidentOut>('/whatsapp-alerts/incident', {
      method: 'POST',
      body: payload,
    });
  },

  async broadcastAlert(payload: BroadcastPayload) {
    return ApiClient.request<AlertOut>('/whatsapp-alerts/broadcast', {
      method: 'POST',
      body: payload,
    });
  },
};

