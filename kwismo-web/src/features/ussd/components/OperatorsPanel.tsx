import { Icon } from '@iconify/react';

const mockOperators = [
  { name: 'Orange Money CM', country: 'Cameroun', ussdCode: '*150#', status: 'Opérationnel' },
  { name: 'MTN MoMo CM', country: 'Cameroun', ussdCode: '*126#', status: 'Opérationnel' },
  { name: 'Moov Money CI', country: 'Côte d\'Ivoire', ussdCode: '*155#', status: 'Opérationnel' },
  { name: 'Wave CI', country: 'Côte d\'Ivoire', ussdCode: 'API Direct', status: 'Opérationnel' },
];

export default function OperatorsPanel() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            Opérateurs Réseau Supportés
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intégrations réseau et passerelles USSD.
          </p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mockOperators.map((op, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon="solar:cellphone-linear" className="text-2xl text-brand-orange" />
              <div>
                <h4 className="font-title text-xs font-bold text-slate-900 dark:text-white">{op.name}</h4>
                <p className="font-mono text-[11px] text-slate-500">{op.country} • {op.ussdCode}</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-green/10 text-brand-green">
              {op.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
