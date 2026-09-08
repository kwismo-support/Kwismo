import { Badge, BadgeSize, BadgeVariant } from '@/shared/ui/badge';

export type StatusType =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'SUSPENDED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'APPROVED'
  | 'ADMIN'
  | 'PARTNER'
  | 'USER'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: BadgeSize;
  showDot?: boolean;
  pulse?: boolean;
  className?: string;
}

const statusMap: Record<string, { label: string; variant: BadgeVariant; icon?: string }> = {
  ACTIVE: { label: 'Actif', variant: 'success' },
  ENABLED: { label: 'Actif', variant: 'success' },
  INACTIVE: { label: 'Inactif', variant: 'default' },
  DISABLED: { label: 'Désactivé', variant: 'default' },
  PENDING: { label: 'En attente', variant: 'warning' },
  SUSPENDED: { label: 'Suspendu', variant: 'danger' },
  VERIFIED: { label: 'Vérifié', variant: 'mint' },
  REJECTED: { label: 'Rejeté', variant: 'danger' },
  APPROVED: { label: 'Approuvé', variant: 'success' },
  
  ADMIN: { label: 'Admin', variant: 'navy' },
  PARTNER: { label: 'Partenaire', variant: 'secondary' },
  USER: { label: 'Utilisateur', variant: 'info' },
  SUPER_ADMIN: { label: 'Super Admin', variant: 'orange' },
};

export function StatusBadge({
  status,
  size = 'sm',
  showDot = false,
  pulse = false,
  className,
}: StatusBadgeProps) {
  const upperStatus = (status || '').toUpperCase();
  const config = statusMap[upperStatus] || {
    label: status,
    variant: 'default' as BadgeVariant,
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      showDot={showDot}
      dotPulse={pulse || upperStatus === 'PENDING'}
      icon={config.icon}
      className={className}
    >
      {config.label}
    </Badge>
  );
}
