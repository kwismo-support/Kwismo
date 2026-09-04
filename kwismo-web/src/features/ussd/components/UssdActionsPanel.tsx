import { Icon } from '@iconify/react';

const mockActions = [
  { action: 'Transfert d\'argent MTN', syntax: '*126*1*{amount}*{recipient_number}#{pin}' },
  { action: 'Vérification Solde Orange', syntax: '*150*1*1#{pin}' },
  { action: 'Transfert d\'argent Orange', syntax: '*150*1*1*{recipient_number}*{amount}#{pin}' },
];

export default function UssdActionsPanel() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <div>
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
          Syntaxes des Actions USSD
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Modèles de chaînes USSD générées pour la vérification automatique.
        </p>
      </div>

      <div className="mt-2 flex flex-col gap-3">
        {mockActions.map((act, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-title text-xs font-bold text-slate-900 dark:text-white">{act.action}</h4>
              <p className="font-mono text-xs text-brand-green mt-1">{act.syntax}</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold text-brand-orange hover:underline self-start sm:self-auto">
              <Icon icon="solar:pen-bold" className="text-sm" />
              <span>Modifier</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
