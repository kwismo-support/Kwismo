import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { StatusBadge } from '@/shared/components/StatusBadge';
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
    <div className="fixed inset-0 z-50 overflow-y-auto font-body">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-brand-navy p-6 shadow-2xl border border-slate-200 dark:border-white/10 text-left animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green text-xl">
                <Icon icon="solar:user-check-bold-duotone" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                    Validation du Partenaire
                  </h3>
                  <StatusBadge status={request.typePartenariat} size="xs" />
                </div>
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
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-200/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono">
              <div><strong className="text-slate-800 dark:text-white">Contact :</strong> {request.prenomContact} {request.nomContact}</div>
              <div><strong className="text-slate-800 dark:text-white">Téléphone :</strong> {request.telephone}</div>
              {request.message && (
                <div className="mt-1 pt-1.5 border-t border-slate-200 dark:border-white/10 italic text-[11px]">
                  "{request.message}"
                </div>
              )}
            </div>

            <Input
              label="Email de connexion du compte"
              value={emailConnexion}
              onChange={(e) => setEmailConnexion(e.target.value)}
              leftIcon="solar:letter-bold"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Rôle &amp; Type de Compte
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg/60 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-brand-green"
              >
                <option value="Partenaire Telco / Banque">Partenaire Telco / Banque</option>
                <option value="Partenaire Fintech / API">Partenaire Fintech / API</option>
                <option value="Partenaire Microfinance">Partenaire Microfinance</option>
                <option value="Super Partenaire (Accès Global)">Super Partenaire (Accès Global)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mot de passe généré
                </label>
                <button
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  className="text-[11px] font-bold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Icon icon="solar:restart-bold" className="text-xs" />
                  Régénérer
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
                className="rounded border-slate-300 text-brand-orange focus:ring-brand-orange"
              />
              <span>Envoyer automatiquement les accès par email</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" size="sm" leftIcon="solar:check-circle-bold">
                Activer le Partenaire
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
