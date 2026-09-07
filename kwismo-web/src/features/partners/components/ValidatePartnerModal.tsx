import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import type { PartnerRequestItem } from '../services/partnerRequestsStore';

interface ValidatePartnerModalProps {
  request: PartnerRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmValidate: (requestId: string, emailConnexion: string, role: string, initialPassword: string) => void;
}

export default function ValidatePartnerModal({
  request,
  isOpen,
  onClose,
  onConfirmValidate,
}: ValidatePartnerModalProps) {
  const [emailConnexion, setEmailConnexion] = useState('');
  const [role, setRole] = useState('Partenaire Telco / Banque');
  const [password, setPassword] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);

  useEffect(() => {
    if (request) {
      setEmailConnexion(request.email);
      setPassword(generatePassword());
    }
  }, [request]);

  if (!isOpen || !request) return null;

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmValidate(request.id, emailConnexion, role, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-body animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-brand-navy p-6 shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
              <Icon icon="solar:user-check-bold" className="text-xl" />
            </div>
            <div>
              <h2 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                Validation & Accès Partenaire
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {request.nomEntreprise} ({request.typePartenariat.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl transition"
          >
            <Icon icon="solar:close-circle-bold" className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 flex flex-col gap-1 font-mono">
            <div><strong className="text-slate-800 dark:text-white">Contact :</strong> {request.prenomContact} {request.nomContact}</div>
            <div><strong className="text-slate-800 dark:text-white">Téléphone :</strong> {request.telephone}</div>
            {request.message && (
              <div className="mt-1 pt-1 border-t border-slate-200 dark:border-white/10 italic text-[11px]">
                "{request.message}"
              </div>
            )}
          </div>

          <Input
            label="Identifiant / Email de connexion partenaire"
            value={emailConnexion}
            onChange={(e) => setEmailConnexion(e.target.value)}
            leftIcon="solar:letter-bold"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Rôle / Type de compte partenaire
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-brand-green"
            >
              <option value="Partenaire Telco / Banque">Partenaire Telco / Banque</option>
              <option value="Partenaire Fintech / API">Partenaire Fintech / API</option>
              <option value="Partenaire Microfinance">Partenaire Microfinance</option>
              <option value="Super Partenaire (Accès Global)">Super Partenaire (Accès Global)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mot de passe initial
              </label>
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="text-[11px] font-semibold text-brand-green hover:underline flex items-center gap-1"
              >
                <Icon icon="solar:restart-bold" className="text-xs" />
                Générer un mot de passe
              </button>
            </div>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon="solar:key-minimalistic-bold"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={sendEmailNotification}
              onChange={(e) => setSendEmailNotification(e.target.checked)}
              className="rounded border-slate-300 text-brand-green focus:ring-brand-green"
            />
            <span>Envoyer automatiquement les identifiants par email au partenaire</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10 mt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon="solar:check-circle-bold">
              Confirmer & Activer le Partenaire
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
