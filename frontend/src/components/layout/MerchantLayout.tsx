import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import MerchantSidebar from "./MerchantSidebar";
import { useAuth } from "../../stores/useAuthStore";
import type { Merchant } from "../../types";

const MerchantLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { user } = useAuth();
	const merchant = user?.data as Merchant;

	return (
		<div className="h-screen overflow-hidden">
			<MerchantSidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
			/>

			<div className="flex h-full flex-col lg:pl-60">
				{/* Topbar */}
				<header className="flex h-14 shrink-0 items-center justify-between border-b border-(--border) bg-(--bg) px-4">
					<button
						onClick={() => setSidebarOpen(true)}
						className="rounded-lg p-2 text-(--text-secondary) hover:bg-(--bg-tertiary) lg:hidden"
					>
						<Menu className="h-5 w-5" />
					</button>
					<span className="text-sm font-medium text-(--text-secondary)">
						{merchant?.business_name || "Merchant"} Dashboard
					</span>
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
