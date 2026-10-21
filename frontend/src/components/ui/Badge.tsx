import type { ReactNode } from 'react';

interface BadgeProps {
  variant?:
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'default'
    | 'thinking'
    | 'grep'
    | 'read'
    | 'edit'
    | 'done';
  children: ReactNode;
  className?: string;
}

const variants = {
  success: 'bg-green-500/10 text-green-500 border border-green-500/20',
  error: 'bg-red-500/10 text-red-500 border border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  info: 'bg-[#9fbbe0]/20 text-[#26251e] dark:text-[#f7f7f4] border border-[#9fbbe0]/40',
  default: 'bg-(--bg-tertiary) text-(--text-secondary) border border-(--border)',
  // Cursor in-product agent timeline pastels
  thinking: 'bg-[#dfa88f]/30 text-[#26251e] border border-[#dfa88f]/50',
  grep: 'bg-[#9fc9a2]/30 text-[#26251e] border border-[#9fc9a2]/50',
  read: 'bg-[#9fbbe0]/30 text-[#26251e] border border-[#9fbbe0]/50',
  edit: 'bg-[#c0a8dd]/30 text-[#26251e] border border-[#c0a8dd]/50',
  done: 'bg-[#c08532] text-white border border-[#c08532]',
};

const Badge = ({ variant = 'default', children, className = '' }: BadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${variants[variant]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
