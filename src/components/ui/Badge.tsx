import { cn } from '@/lib/utils';
import type { AdmissionProbability } from '@/types';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
};

export default function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Convenience component for rendering admission probability as a badge.
 */
export function ProbabilityBadge({
  probability,
}: {
  probability: AdmissionProbability;
}) {
  const map: Record<AdmissionProbability, BadgeProps['variant']> = {
    High: 'success',
    Medium: 'warning',
    Low: 'danger',
  };

  return <Badge variant={map[probability]}>{probability}</Badge>;
}
