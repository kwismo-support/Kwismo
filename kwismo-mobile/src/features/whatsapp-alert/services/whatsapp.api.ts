// Service API backend pour l'alerte WhatsApp via FastAPI (/whatsapp-alerts/incident et /whatsapp-alerts/broadcast)
import { ApiClient } from '../../../shared/services/apiClient';

export interface DeclareIncidentPayload {
  user_phone_id: string;
}

export interface BroadcastPayload {
  compromise_incident_id: string;
  contact_ids: string[];
  contenu?: string;
}

export interface IncidentOut {
  id: string;
  compromise_incident_id: string;
  user_phone_id: string;
  numero: string;
  statut: string;
}

export interface AlertOut {
  id: string;
  contenu: string;
  date_envoi: string;
  statut: string;
  recipients: Array<{ contact_id: string; statut_accuse: string }>;
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


