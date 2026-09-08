// Hook React pour gérer l'envoi d'un signalement
import { useState } from 'react';
import { reportApi, ReportPayload } from '../services/report.api';

export function useReport() {
  const [submitting, setSubmitting] = useState(false);

  const sendReport = async (payload: ReportPayload) => {
    setSubmitting(true);
    try {
      const res = await reportApi.submitReport(payload);
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  return { sendReport, submitting };
}
