// Hook React pour gérer l'envoi des alerte WhatsApp anti-usurpation
import { useState } from 'react';
import { whatsappApi, WhatsappAlertPayload } from '../services/whatsapp.api';

export function useWhatsappAlert() {
  const [sending, setSending] = useState(false);

  const dispatchAlert = async (payload: WhatsappAlertPayload) => {
    setSending(true);
    try {
      return await whatsappApi.sendAlert(payload);
    } finally {
      setSending(false);
    }
  };

  return { dispatchAlert, sending };
}
