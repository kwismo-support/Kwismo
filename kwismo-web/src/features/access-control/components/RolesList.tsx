import { Icon } from '@iconify/react';

const mockRoles = [
  { name: 'Super Administrateur', key: 'admin', usersCount: 3, description: 'Accès total à la plateforme, gestion des partenaires et de la sécurité.' },
  { name: 'Partenaire API', key: 'partner', usersCount: 18, description: 'Accès restreint au périmètre de l\'entreprise et suivi de consommation API.' },
  { name: 'Utilisateur Standard', key: 'user', usersCount: 24500, description: 'Utilisation de la vérification de numéros et signalement communautaire.' },
];

export default function RolesList() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body">
      <div>
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
          Rôles Applicatifs
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Niveaux d'habilitation et attribution des privilèges.
        </p>
      </div>

      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockRoles.map((role, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-title text-sm font-bold text-slate-900 dark:text-white">{role.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-green/10 text-brand-green font-mono">
                  {role.key}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{role.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Icon icon="solar:user-bold" className="text-brand-orange" />
                {role.usersCount} utilisateurs
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
