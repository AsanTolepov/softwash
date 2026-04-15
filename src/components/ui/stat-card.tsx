// src/components/ui/stat-card.tsx
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  className?: string;
  iconClassName?: string;
  accentColor?: string; // left-border color class
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconClassName,
  accentColor = 'bg-primary/10 text-primary',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative bg-card rounded-xl border border-border shadow-card',
        'flex items-start gap-4 p-5 overflow-hidden',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-md',
        'animate-fade-in',
        className,
      )}
    >
      {/* Decorative top-right glow */}
      <div
        className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-10 blur-2xl"
        aria-hidden
        style={{ background: 'hsl(var(--primary))' }}
      />

      {/* Icon */}
      <div className={cn('shrink-0 p-3 rounded-xl', iconClassName ?? accentColor)}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p
            className={cn(
              'text-xs font-semibold',
              trend.isPositive ? 'text-success' : 'text-destructive',
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </p>
        )}
      </div>
    </div>
  );
}
