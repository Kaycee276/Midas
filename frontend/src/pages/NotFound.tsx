import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
    <h1 className="text-6xl font-bold text-[var(--accent-primary)]">404</h1>
    <p className="mt-4 text-lg text-[var(--text-secondary)]">Page not found</p>
    <Link to="/" className="mt-8">
      <Button variant="outline">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
    </Link>
  </div>
);

export default NotFound;
