import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: 'bg-[var(--accent-primary)] hover:bg-[var(--accent-dark)] text-white',
  secondary: 'bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text)]',
  outline: 'border border-[var(--border)] hover:bg-[var(--bg-tertiary)] text-[var(--text)]',
  ghost: 'hover:bg-[var(--bg-tertiary)] text-[var(--text)]',
  danger: 'bg-[var(--error)] hover:bg-red-600 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({ variant = 'primary', size = 'md', loading, children, disabled, className = '', ...props }: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

export default Button;
