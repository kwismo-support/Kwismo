import { ApiClient, ApiResponse } from '../../../shared/services/apiClient';
import { offlineQueue } from '../../../shared/services/offlineQueue';

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
  async declareIncident(payload: DeclareIncidentPayload): Promise<ApiResponse<IncidentOut>> {
    try {
      const res = await ApiClient.request<IncidentOut>('/whatsapp-alerts/incident', {
        method: 'POST',
        body: payload,
      });
      if (!res.success) {
        await offlineQueue.enqueue('whatsapp_alert', '/whatsapp-alerts/incident', 'POST', payload);
      }
      return res;
    } catch {
      await offlineQueue.enqueue('whatsapp_alert', '/whatsapp-alerts/incident', 'POST', payload);
      return {
        success: true,
        message: 'Alerte enregistrée hors-ligne',
        data: {
          id: `offline-inc-${Date.now()}`,
          compromise_incident_id: `offline-inc-${Date.now()}`,
          user_phone_id: payload.user_phone_id,
          numero: 'offline',
          statut: 'open',
        },
      };
    }
  },

  async broadcastAlert(payload: BroadcastPayload): Promise<ApiResponse<AlertOut>> {
    try {
      const res = await ApiClient.request<AlertOut>('/whatsapp-alerts/broadcast', {
        method: 'POST',
        body: payload,
      });
      if (!res.success) {
        await offlineQueue.enqueue('whatsapp_alert', '/whatsapp-alerts/broadcast', 'POST', payload);
      }
      return res;
    } catch {
      await offlineQueue.enqueue('whatsapp_alert', '/whatsapp-alerts/broadcast', 'POST', payload);
      return {
        success: true,
        message: 'Diffusion enregistrée hors-ligne',
        data: {
          id: `offline-alert-${Date.now()}`,
          contenu: payload.contenu || '',
          date_envoi: new Date().toISOString(),
          statut: 'queued',
          recipients: [],
        },
      };
    }
  },
};
