import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { NotificationBell } from './NotificationBell';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-(--bg)">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
              Admin Compliance Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--bg-secondary) px-2.5 py-1.5 text-xs font-medium text-(--text-secondary)">
              <ShieldCheck className="h-3.5 w-3.5 text-(--success)" />
              <span className="hidden sm:inline">Compliance Admin</span>
            </div>
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

export default AdminLayout;
