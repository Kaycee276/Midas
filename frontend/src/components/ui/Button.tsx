import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary:
    'bg-(--accent-primary) hover:bg-(--accent-dark) text-white font-medium active:scale-[0.99] border border-(--accent-primary)',
  secondary:
    'bg-(--bg-secondary) hover:bg-(--bg-tertiary) text-(--text) border border-(--border) active:scale-[0.99]',
  outline:
    'bg-transparent hover:bg-(--bg-tertiary) text-(--text) border border-(--border) active:scale-[0.99]',
  ghost: 'bg-transparent hover:bg-(--bg-tertiary) text-(--text-secondary) hover:text-(--text)',
  danger: 'bg-(--error) hover:bg-red-700 text-white font-medium border border-(--error)',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs h-8',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-5 py-2.5 text-sm h-11',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

export default Button;
