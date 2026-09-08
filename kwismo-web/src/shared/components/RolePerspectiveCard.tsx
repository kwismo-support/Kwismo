import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';
import { StatusBadge } from './StatusBadge';

export type UserRoleType = 'ADMIN' | 'PARTNER' | 'USER' | string;

export interface RolePerspectiveCardProps {
  currentRole: UserRoleType;
  onRoleChange?: (role: UserRoleType) => void;
  availableRoles?: UserRoleType[];
  title?: string;
  description?: string;
  className?: string;
}

const roleDetails: Record<
  string,
  { title: string; desc: string; icon: string; bgGradient: string; badgeVariant: string }
> = {
  ADMIN: {
    title: "Vue Administrateur System",
    desc: "Gestion globale du système, attribution des rôles, gestion des partenaires et supervision du trafic Kwismo.",
    icon: 'solar:shield-user-bold-duotone',
    bgGradient: 'from-brand-navy via-slate-900 to-brand-darkBg text-white border-brand-navy/50',
    badgeVariant: 'navy',
  },
  PARTNER: {
    title: "Vue Partenaire Entreprise",
    desc: "Gestion des clés API, allocation des numéros virtuelles, facturation et intégration USSD/WhatsApp.",
    icon: 'solar:buildings-2-bold-duotone',
    bgGradient: 'from-amber-950/40 via-brand-navy to-slate-900 text-white border-brand-orange/30',
    badgeVariant: 'orange',
  },
  USER: {
    title: "Vue Utilisateur Final",
    desc: "Achat de numéros éphémères, réception des OTPs, gestion du solde et suivi des transactions personnelles.",
    icon: 'solar:user-bold-duotone',
    bgGradient: 'from-emerald-950/40 via-brand-navy to-slate-900 text-white border-brand-green/30',
    badgeVariant: 'green',
  },
};

export function RolePerspectiveCard({
  currentRole,
  onRoleChange,
  availableRoles = ['ADMIN', 'PARTNER', 'USER'],
  title,
  description,
  className,
}: RolePerspectiveCardProps) {
  const upperRole = (currentRole || 'ADMIN').toUpperCase();
  const config = roleDetails[upperRole] || roleDetails.ADMIN;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-md font-body',
        'bg-gradient-to-r',
        config.bgGradient,
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-brand-orange text-2xl">
            <Icon icon={config.icon} />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-title text-lg sm:text-xl font-bold tracking-tight">
                {title || config.title}
              </h2>
              <StatusBadge status={upperRole} size="xs" showDot={true} pulse={true} />
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
              {description || config.desc}
            </p>
          </div>
        </div>

        {onRoleChange && availableRoles.length > 1 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0 bg-white/5 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
            <span className="text-[11px] font-semibold text-slate-300 px-2 uppercase tracking-wider">
              Changer la vue:
            </span>
            <div className="flex items-center gap-1">
              {availableRoles.map((r) => {
                const isActive = r.toUpperCase() === upperRole;
                return (
                  <button
                    key={r}
                    onClick={() => onRoleChange(r)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                      isActive
                        ? 'bg-brand-orange text-brand-navy shadow-sm'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-9xl">
        <Icon icon={config.icon} />
      </div>
    </div>
  );
}
