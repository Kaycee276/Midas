import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <Link to="/" className="text-lg font-bold text-[var(--accent-primary)]">Midas</Link>
          <p className="mt-1 text-sm text-[var(--text-tertiary)]">Student-powered merchant investments</p>
        </div>
        <div className="flex gap-6 text-sm text-[var(--text-tertiary)]">
          <Link to="/merchants" className="hover:text-[var(--text)]">Merchants</Link>
          <Link to="/student/login" className="hover:text-[var(--text)]">Invest</Link>
          <Link to="/merchant/register" className="hover:text-[var(--text)]">List Your Business</Link>
        </div>
      </div>
      <div className="mt-6 border-t border-[var(--border)] pt-4 text-center text-xs text-[var(--text-tertiary)]">
        &copy; {new Date().getFullYear()} Midas. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
