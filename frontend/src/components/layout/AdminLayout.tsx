import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex h-full flex-col lg:pl-60">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-(--border) bg-(--bg) px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-(--text-secondary) hover:bg-(--bg-tertiary) lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-(--text-secondary)">Admin Panel</span>
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
