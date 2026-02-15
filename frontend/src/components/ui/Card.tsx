import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: boolean;
}

const Card = ({ children, padding = true, className = '', ...props }: CardProps) => (
  <div
    className={`rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] ${padding ? 'p-6' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
