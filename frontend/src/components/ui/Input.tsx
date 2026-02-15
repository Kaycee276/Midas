import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-lg border bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text)] placeholder-[var(--text-tertiary)] transition-colors focus:border-[var(--accent-primary)] focus:outline-none ${
          error ? 'border-[var(--error)]' : 'border-[var(--border)]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-[var(--error)]">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
