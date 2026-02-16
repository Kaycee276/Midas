import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  children: ReactNode;
  className?: string;
}

const variants = {
  success: 'bg-green-500/15 text-green-500',
  error: 'bg-red-500/15 text-red-500',
  warning: 'bg-yellow-500/15 text-yellow-500',
  info: 'bg-blue-500/15 text-blue-500',
  default: 'bg-(--bg-tertiary) text-(--text-secondary)',
};

const Badge = ({ variant = 'default', children, className = '' }: BadgeProps) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
    {children}
  </span>
);

export default Badge;
