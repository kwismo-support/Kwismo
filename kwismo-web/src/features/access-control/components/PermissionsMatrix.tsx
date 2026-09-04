import { Icon } from '@iconify/react';

const matrixData = [
  { permission: 'Consulter le Tableau de Bord KPI', admin: true, partner: true, user: false },
  { permission: 'Gérer les Utilisateurs & Comptes', admin: true, partner: false, user: false },
  { permission: 'Gérer les Partenaires & Quotas API', admin: true, partner: false, user: false },
  { permission: 'Consulter la Base des Numéros', admin: true, partner: true, user: true },
  { permission: 'Modifier les Syntaxes USSD & Pays', admin: true, partner: false, user: false },
  { permission: 'Exporter les Rapports Stratégiques', admin: true, partner: true, user: false },
];

export default function PermissionsMatrix() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <div>
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
          Matrice des Permissions & Privilèges
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Droits d'accès par rôle sur chaque fonctionnalité du système.
        </p>
      </div>

      <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="p-3.5">Permission / Action</th>
              <th className="p-3.5 text-center">Admin</th>
              <th className="p-3.5 text-center">Partenaire</th>
              <th className="p-3.5 text-center">Utilisateur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-xs">
            {matrixData.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                <td className="p-3.5 font-medium text-slate-900 dark:text-white">{item.permission}</td>
                <td className="p-3.5 text-center">
                  <Icon icon={item.admin ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} className={`mx-auto text-lg ${item.admin ? 'text-brand-green' : 'text-slate-400'}`} />
                </td>
                <td className="p-3.5 text-center">
                  <Icon icon={item.partner ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} className={`mx-auto text-lg ${item.partner ? 'text-brand-green' : 'text-slate-400'}`} />
                </td>
                <td className="p-3.5 text-center">
                  <Icon icon={item.user ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} className={`mx-auto text-lg ${item.user ? 'text-brand-green' : 'text-slate-400'}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
