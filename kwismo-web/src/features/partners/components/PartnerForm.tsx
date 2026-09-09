import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/store/toastStore';
import type { PartnerDTO, PartnerType } from '@/shared/mock';

interface PartnerFormProps {
  partner: PartnerDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (partner: Partial<PartnerDTO>) => void;
}

export default function PartnerForm({ partner, isOpen, onClose, onSave }: PartnerFormProps) {
  const { t } = useTranslation(['partner', 'common']);
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [typePartenariat, setTypePartenariat] = useState<PartnerType>('Opérateur');
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    if (partner) {
      setNomEntreprise(partner.nomEntreprise);
      setTypePartenariat(partner.typePartenariat);
      setWebhookUrl(partner.webhookUrl ?? '');
    } else {
      setNomEntreprise('');
      setTypePartenariat('Opérateur');
      setWebhookUrl('');
    }
  }, [partner]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({ nomEntreprise, typePartenariat, webhookUrl });
    }
    toast.success(partner ? t('partner:partners.updated') : t('partner:partners.created'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-body animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#161E33] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
            {partner ? t('partner:partners.edit') : t('partner:partners.create')}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <Icon icon="solar:close-circle-linear" className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label={t('partner:partners.name')}
            required
            value={nomEntreprise}
            onChange={(e) => setNomEntreprise(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('partner:partners.type')}
            </label>
            <select
              value={typePartenariat}
              onChange={(e) => setTypePartenariat(e.target.value as PartnerType)}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm font-body focus:outline-none focus:border-brand-green"
            >
              <option value="Opérateur">{t('partner:partners.typeTelco')}</option>
              <option value="Banque">{t('partner:partners.typeBank')}</option>
              <option value="Fintech">{t('partner:partners.typeFintech')}</option>
              <option value="Régulateur">Régulateur</option>
            </select>
          </div>

          <Input
            label="Webhook URL"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://company.com/webhook"
          />

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              {t('common:cancel')}
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              {t('common:save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
