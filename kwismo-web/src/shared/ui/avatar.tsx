import { useState } from 'react';
import { cn } from '@/shared/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type RoleRing = 'admin' | 'partner' | 'user' | 'none';

export interface UserAvatarProps {
  src?: string | null;
  name: string;
  roleRing?: RoleRing;
  size?: AvatarSize;
  statusDot?: 'active' | 'inactive' | 'pending' | 'none';
  className?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; dot: string }> = {
  xs: { container: 'h-6 w-6', text: 'text-[10px]', dot: 'h-1.5 w-1.5' },
  sm: { container: 'h-8 w-8', text: 'text-xs', dot: 'h-2 w-2' },
  md: { container: 'h-10 w-10', text: 'text-sm', dot: 'h-2.5 w-2.5' },
  lg: { container: 'h-12 w-12', text: 'text-base', dot: 'h-3 w-3' },
  xl: { container: 'h-16 w-16', text: 'text-lg', dot: 'h-3.5 w-3.5' },
};

const roleRingMap: Record<RoleRing, string> = {
  admin: 'ring-2 ring-brand-navy dark:ring-slate-300',
  partner: 'ring-2 ring-brand-orange',
  user: 'ring-2 ring-brand-green',
  none: '',
};

function getInitials(name: string): string {
  if (!name) return 'KW';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserAvatar({
  src,
  name,
  roleRing = 'none',
  size = 'md',
  statusDot = 'none',
  className,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = sizeMap[size];
  const initials = getInitials(name);

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden font-body font-bold',
          'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-brand-navy dark:to-slate-800',
          'text-brand-navy dark:text-white border border-slate-200 dark:border-white/10 shadow-xs',
          sizeConfig.container,
          roleRingMap[roleRing],
          className
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {statusDot !== 'none' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-brand-navy',
            sizeConfig.dot,
            statusDot === 'active' && 'bg-brand-green',
            statusDot === 'inactive' && 'bg-slate-400',
            statusDot === 'pending' && 'bg-amber-500'
          )}
        />
      )}
    </div>
  );
}

export interface AvatarGroupProps {
  users: Array<{ name: string; src?: string; roleRing?: RoleRing }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({ users = [], max = 4, size = 'sm', className }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const extra = users.length - max;
  const sizeConfig = sizeMap[size];

  return (
    <div className={cn('flex items-center -space-x-2 overflow-hidden', className)}>
      {visible.map((user, i) => (
        <UserAvatar
          key={user.name + i}
          name={user.name}
          src={user.src}
          roleRing={user.roleRing}
          size={size}
          className="ring-2 ring-white dark:ring-brand-navy"
        />
      ))}
      {extra > 0 && (
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full font-body font-bold',
            'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
            'ring-2 ring-white dark:ring-brand-navy',
            sizeConfig.container,
            sizeConfig.text
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
