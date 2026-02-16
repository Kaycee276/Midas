import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className={`animate-spin text-(--accent-primary) ${sizes[size]}`} />
  </div>
);

export default Spinner;
