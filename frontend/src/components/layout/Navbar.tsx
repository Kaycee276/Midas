import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, LogOut, User, ArrowUpRight } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuth } from '../../stores/useAuthStore';
import { NotificationBell } from './NotificationBell';
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
    <nav className="sticky top-0 z-40 border-b border-(--border) bg-(--bg)/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-2.5 w-2.5 rounded-full bg-(--accent-primary) transition-transform group-hover:scale-125" />
          <span className="text-lg font-semibold tracking-tight text-(--text)">Midas</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/merchants"
            className="text-sm font-medium text-(--text-secondary) hover:text-(--text) transition-colors"
          >
            Browse Marketplace
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                className="text-sm font-medium text-(--text-secondary) hover:text-(--text) transition-colors"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-3 border-l border-(--border) pl-4">
                <Link
                  to={`/${user?.role}/profile`}
                  className="flex items-center gap-2 text-sm font-medium text-(--text-secondary) hover:text-(--text)"
                >
                  <User className="h-4 w-4" />
                  {getUserName()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text)"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/merchant/login"
                className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-(--text-secondary) hover:border-(--border) hover:bg-(--bg-secondary) hover:text-(--text) transition-all"
              >
                Merchant Sign In
              </Link>
              <Link
                to="/student/login"
                className="inline-flex items-center gap-1 rounded-lg bg-(--accent-primary) px-3.5 py-1.5 text-xs font-medium text-white hover:bg-(--accent-dark) transition-all"
              >
                Student Sign In
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          )}
          {isAuthenticated && <NotificationBell />}
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-(--border) p-2 text-(--text-secondary) hover:bg-(--bg-secondary) hover:text-(--text) transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && <NotificationBell />}
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-(--border) p-2 text-(--text-secondary) hover:bg-(--bg-secondary)"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg border border-(--border) p-2 text-(--text-secondary) hover:bg-(--bg-secondary)"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-(--border) bg-(--bg) px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              to="/merchants"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-(--text-secondary) hover:text-(--text)"
            >
              Browse Marketplace
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-(--text-secondary)"
                >
                  Dashboard
                </Link>
                <Link
                  to={`/${user?.role}/profile`}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-(--text-secondary)"
                >
                  {getUserName()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left text-sm font-medium text-(--error)"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/merchant/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-(--text-secondary)"
                >
                  Merchant Sign In
                </Link>
                <Link
                  to="/student/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-(--accent-primary)"
                >
                  Student Sign In →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
