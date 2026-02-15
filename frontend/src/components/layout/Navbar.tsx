import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, LogOut, User } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuth } from '../../stores/useAuthStore';
import type { Merchant, Student, Admin } from '../../types';

const Navbar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const getUserName = () => {
    if (!user) return '';
    if (user.role === 'merchant') return (user.data as Merchant).business_name;
    if (user.role === 'student') return (user.data as Student).full_name;
    return (user.data as Admin).full_name;
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'merchant') return '/merchant/dashboard';
    if (user.role === 'student') return '/student/dashboard';
    return '/admin/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold text-[var(--accent-primary)]">Midas</Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/merchants" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
            Browse Merchants
          </Link>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <Link to={`/${user?.role}/profile`} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">
                  <User className="h-4 w-4" />
                  {getUserName()}
                </Link>
                <button onClick={handleLogout} className="rounded-lg p-2 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/merchant/login" className="rounded-lg px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
                Merchant Login
              </Link>
              <Link to="/student/login" className="rounded-lg bg-[var(--accent-primary)] px-3 py-1.5 text-sm text-white hover:bg-[var(--accent-dark)]">
                Student Login
              </Link>
            </div>
          )}
          <button onClick={toggleTheme} className="rounded-lg p-2 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={toggleTheme} className="rounded-lg p-2 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/merchants" onClick={() => setMobileOpen(false)} className="text-sm text-[var(--text-secondary)]">Browse Merchants</Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="text-sm text-[var(--text-secondary)]">Dashboard</Link>
                <Link to={`/${user?.role}/profile`} onClick={() => setMobileOpen(false)} className="text-sm text-[var(--text-secondary)]">{getUserName()}</Link>
                <button onClick={handleLogout} className="text-left text-sm text-[var(--error)]">Log Out</button>
              </>
            ) : (
              <>
                <Link to="/merchant/login" onClick={() => setMobileOpen(false)} className="text-sm text-[var(--text-secondary)]">Merchant Login</Link>
                <Link to="/student/login" onClick={() => setMobileOpen(false)} className="text-sm text-[var(--text-secondary)]">Student Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
