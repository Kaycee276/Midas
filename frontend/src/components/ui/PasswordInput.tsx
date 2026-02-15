import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  showCriteria?: boolean;
}

const criteria = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number', test: (v: string) => /\d/.test(v) },
  { label: 'One special character (@$!%*?&#)', test: (v: string) => /[@$!%*?&#]/.test(v) },
];

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, showCriteria = false, className = '', id, value, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const [focused, setFocused] = useState(false);

    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const pwd = typeof value === 'string' ? value : '';
    const allMet = criteria.every((c) => c.test(pwd));
    const showList = showCriteria && focused && !allMet;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            value={value}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={`w-full rounded-lg border bg-[var(--bg-secondary)] px-3 py-2 pr-10 text-[var(--text)] placeholder-[var(--text-tertiary)] transition-colors focus:border-[var(--accent-primary)] focus:outline-none ${
              error ? 'border-[var(--error)]' : 'border-[var(--border)]'
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {showList && (
          <ul className="mt-1.5 space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
            {criteria.map((c) => {
              const met = c.test(pwd);
              return (
                <li key={c.label} className={`flex items-center gap-2 text-xs ${met ? 'text-[var(--success)]' : 'text-[var(--text-tertiary)]'}`}>
                  {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {c.label}
                </li>
              );
            })}
          </ul>
        )}
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
