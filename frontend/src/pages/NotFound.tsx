import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Store, GraduationCap, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/merchants', label: 'Browse Merchants', icon: Store },
  { to: '/student/login', label: 'Student Login', icon: GraduationCap },
  { to: '/merchant/login', label: 'Merchant Login', icon: LogIn },
];

const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
    <h1 className="text-6xl font-bold text-[var(--accent-primary)]">404</h1>
    <p className="mt-4 text-lg text-[var(--text-secondary)]">
      Page not found. The page you're looking for doesn't exist or has been moved.
    </p>

    <div className="mt-8 w-full max-w-sm">
      <p className="mb-3 text-center text-sm font-medium text-[var(--text-tertiary)]">
        Quick Links
      </p>
      <div className="grid grid-cols-2 gap-3">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>
    </div>

    <Link to="/" className="mt-8">
      <Button variant="outline">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
    </Link>
  </div>
);

export default NotFound;
