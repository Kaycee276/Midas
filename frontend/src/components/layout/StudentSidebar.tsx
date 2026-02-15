import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PieChart, Wallet, Store, User, Sun, Moon, LogOut, X } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuth } from '../../stores/useAuthStore';

interface StudentSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/portfolio', label: 'Portfolio', icon: PieChart },
  { to: '/student/wallet', label: 'Wallet', icon: Wallet },
  { to: '/merchants', label: 'Merchants', icon: Store },
  { to: '/student/profile', label: 'Profile', icon: User },
];

const StudentSidebar = ({ open, onClose }: StudentSidebarProps) => {
  const { theme, toggleTheme } = useThemeStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[var(--border)] bg-[var(--bg)] transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-5">
          <span className="text-lg font-bold text-[var(--accent-primary)]">Midas</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text)]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[var(--border)] p-3 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
