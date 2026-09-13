import { createContext, useContext, useState, ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (val: string) => void;
  variant: 'pills' | 'underline' | 'segmented';
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'pills' | 'underline' | 'segmented';
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = 'segmented',
  children,
  className,
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue);

  const activeTab = value !== undefined ? value : internalTab;
  const setActiveTab = (val: string) => {
    if (value === undefined) setInternalTab(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={cn('w-full font-body', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  const ctx = useContext(TabsContext);
  const variant = ctx?.variant || 'segmented';

  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'segmented' &&
          'p-1.5 rounded-2xl bg-slate-100 dark:bg-brand-darkBg border border-slate-200 dark:border-white/10',
        variant === 'pills' && 'gap-2',
        variant === 'underline' && 'border-b border-slate-200 dark:border-white/10 gap-6',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  icon?: string;
  badge?: string | number;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({
  value,
  icon,
  badge,
  children,
  className,
}: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;

  const isActive = ctx.activeTab === value;
  const variant = ctx.variant;

  return (
    <button
      type="button"
      onClick={() => ctx.setActiveTab(value)}
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer',
        variant === 'segmented' && [
          'rounded-xl',
          isActive
            ? 'bg-white dark:bg-brand-navy text-brand-navy dark:text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
        ],
        variant === 'pills' && [
          'rounded-full border',
          isActive
            ? 'bg-brand-navy text-white border-brand-navy dark:bg-brand-orange dark:text-brand-navy dark:border-brand-orange'
            : 'bg-white dark:bg-brand-navy border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5',
        ],
        variant === 'underline' && [
          'py-3 border-b-2 -mb-[2px] rounded-none',
          isActive
            ? 'border-brand-orange text-brand-navy dark:text-brand-orange font-bold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200',
        ],
        className
      )}
    >
      {icon && <Icon icon={icon} className="text-base" />}
      <span>{children}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-bold',
            isActive
              ? 'bg-brand-orange/20 text-brand-orange dark:bg-white/20 dark:text-white'
              : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (!ctx || ctx.activeTab !== value) return null;

  return <div className={cn('mt-4 animate-in fade-in-50 duration-200', className)}>{children}</div>;
}
