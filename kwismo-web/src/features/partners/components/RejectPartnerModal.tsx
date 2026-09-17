import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import type { PartnerRequestItem } from '../services/partnerRequestsStore';

interface RejectPartnerModalProps {
  request: PartnerRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (requestId: string, recipientEmail: string, reason: string) => void;
}

export default function RejectPartnerModal({
  request,
  isOpen,
  onClose,
  onConfirmReject,
}: RejectPartnerModalProps) {
  const { t } = useTranslation(['admin', 'common']);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (request) {
      setRecipientEmail(request.email);
      setReason(
        t('admin:partners.defaultRejectionReason', {
          prenom: request.prenomContact,
          entreprise: request.nomEntreprise,
        })
      );
    }
  }, [request, t]);


  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReject(request.id, recipientEmail, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-body">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-brand-navy p-6 shadow-2xl border border-slate-200 dark:border-white/10 text-left animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 text-xl">
                <Icon icon="solar:user-block-bold-duotone" />
              </div>
              <div>
                <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                  {t('admin:partners.rejectModalTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {request.nomEntreprise}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <Icon icon="solar:close-circle-bold" className="text-lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Input
              label={t('admin:partners.recipientEmailRegret')}
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              leftIcon="solar:letter-bold"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('admin:partners.rejectionReasonLabel')}
              </label>
              <textarea
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-green transition resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                {t('common:actions.cancel')}
              </Button>
              <Button type="submit" variant="danger" size="sm" leftIcon="solar:plain-bold">
                {t('admin:partners.confirmRejectAction')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
