import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import type { PartnerItem } from './PartnersTable';

interface PartnerFormProps {
  partner: PartnerItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnerForm({ partner, isOpen, onClose }: PartnerFormProps) {
  const [name, setName] = useState('');
  const [quota, setQuota] = useState('5 000 000');

  useEffect(() => {
    if (partner) {
      setName(partner.name);
      setQuota(partner.monthlyQuota);
    } else {
      setName('');
      setQuota('5 000 000');
    }
  }, [partner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-brand-navy rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl font-body">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
            {partner ? 'Éditer Partenaire API' : 'Ajouter un Partenaire'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <Icon icon="solar:close-circle-linear" className="text-2xl" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom de l'entreprise</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Orange Money"
              className="h-10 px-3.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg text-xs font-body"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quota Mensuel d'appels API</label>
            <input
              type="text"
              required
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg text-xs font-body"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-brand-green text-white text-xs font-semibold hover:bg-[#2aa072]"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
