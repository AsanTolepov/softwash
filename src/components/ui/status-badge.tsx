// src/components/ui/status-badge.tsx
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types';

interface StatusConfig {
  label: string;
  dot: string;
  pill: string;
  pulse: boolean;
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
  NEW: {
    label: 'Yangi',
    dot:   'bg-sky-500',
    pill:  'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    pulse: true,
  },
  WASHING: {
    label: 'Yuvishda',
    dot:   'bg-cyan-500',
    pill:  'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
    pulse: true,
  },
  READY: {
    label: 'Tayyor',
    dot:   'bg-emerald-500',
    pill:  'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    pulse: false,
  },
  DELIVERED: {
    label: 'Yetkazildi',
    dot:   'bg-slate-400',
    pill:  'bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700',
    pulse: false,
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        cfg.pill,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {cfg.pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-status-pulse',
              cfg.dot,
            )}
          />
        )}
        <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', cfg.dot)} />
      </span>
      {cfg.label}
    </span>
  );
}
