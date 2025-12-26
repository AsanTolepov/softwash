import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  NEW: {
    label: 'New',
    className: 'bg-info/10 text-info border-info/20',
  },
  WASHING: {
    label: 'Washing',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  READY: {
    label: 'Ready',
    className: 'bg-success/10 text-success border-success/20',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-muted text-muted-foreground border-muted',
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
