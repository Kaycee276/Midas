import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Store } from 'lucide-react';
import MerchantSidebar from './MerchantSidebar';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../../stores/useAuthStore';
import type { Merchant } from '../../types';

const MerchantLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const merchant = user?.data as Merchant;

  return (
    <div className="h-screen overflow-hidden bg-(--bg)">
      <MerchantSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-full flex-col lg:pl-60">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-(--border) bg-(--bg)/95 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-(--text-secondary) hover:bg-(--bg-tertiary) lg:hidden"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold tracking-tight text-(--text)">
              {merchant?.business_name || 'Merchant'} Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link
              to="/merchant/profile"
              className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--bg-secondary) px-2.5 py-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text) hover:border-(--accent-primary) transition-all"
            >
              <Store className="h-3.5 w-3.5 text-(--accent-primary)" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>
          </div>
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MerchantLayout;
