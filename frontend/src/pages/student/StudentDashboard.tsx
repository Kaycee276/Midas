import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	DollarSign,
	TrendingUp,
	PieChart,
	Activity,
	Wallet,
} from "lucide-react";
import { useAuth } from "../../stores/useAuthStore";
import { getPortfolio } from "../../api/investments";
import { getWalletInfo } from "../../api/wallet";
import type { Student, PortfolioSummary, Investment } from "../../types";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";

const StudentDashboard = () => {
	const { user } = useAuth();
	const student = user?.data as Student;
	const [summary, setSummary] = useState<PortfolioSummary | null>(null);
	const [investments, setInvestments] = useState<Investment[]>([]);
	const [walletBalance, setWalletBalance] = useState<number>(
		student?.wallet_balance || 0,
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [portfolioRes, walletRes] = await Promise.allSettled([
					getPortfolio(),
					getWalletInfo(),
				]);
				if (portfolioRes.status === "fulfilled") {
					setSummary(portfolioRes.value.data.data.summary);
					setInvestments(portfolioRes.value.data.data.investments);
				}
				if (walletRes.status === "fulfilled") {
					setWalletBalance(walletRes.value.data.data.balance);
				}
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) return <Spinner size="lg" className="py-20" />;

	const stats = [
		{
			icon: Wallet,
			label: "Wallet Balance",
			value: `\u20A6${walletBalance.toLocaleString()}`,
			color: "text-[var(--accent-primary)]",
			link: "/student/wallet",
		},
		{
			icon: DollarSign,
			label: "Total Invested",
			value: `\u20A6${(summary?.total_invested || 0).toLocaleString()}`,
			color: "text-[var(--accent-primary)]",
		},
		{
			icon: PieChart,
			label: "Portfolio Value",
			value: `\u20A6${(summary?.current_portfolio_value || 0).toLocaleString()}`,
			color: "text-[var(--success)]",
		},
		{
			icon: TrendingUp,
			label: "Total Returns",
			value: `\u20A6${(summary?.total_returns || 0).toLocaleString()}`,
			color: "text-[var(--info)]",
		},
		{
			icon: Activity,
			label: "Active Investments",
			value: String(summary?.active_investments || 0),
			color: "text-[var(--warning)]",
		},
	];

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[var(--text)]">
						Welcome, {student.full_name}
					</h1>
					<p className="mt-1 text-[var(--text-secondary)]">
						Your investment overview
					</p>
				</div>
				<Link to="/merchants">
					<Button>
						<TrendingUp className="h-4 w-4" /> New Investment
					</Button>
				</Link>
			</div>

			<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
				{stats.map((s) => {
					const content = (
						<Card key={s.label}>
							<div className="flex items-center gap-3">
								<s.icon className={`h-8 w-8 ${s.color}`} />
								<div>
									<p className="text-2xl font-bold text-[var(--text)]">
										{s.value}
									</p>
									<p className="text-xs text-[var(--text-secondary)]">
										{s.label}
									</p>
								</div>
							</div>
						</Card>
					);
					return s.link ? (
						<Link key={s.label} to={s.link}>
							{content}
						</Link>
					) : (
						<div key={s.label}>{content}</div>
					);
				})}
			</div>

			<div className="mt-8">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-[var(--text)]">
						Recent Investments
					</h2>
					<Link
						to="/student/portfolio"
						className="text-sm text-[var(--accent-primary)] hover:underline"
					>
						View All
					</Link>
				</div>
				{investments.length === 0 ? (
					<Card className="mt-4 text-center">
						<p className="text-[var(--text-secondary)]">No investments yet.</p>
						<Link to="/merchants" className="mt-2 inline-block">
							<Button variant="outline" size="sm">
								Browse Merchants
							</Button>
						</Link>
					</Card>
				) : (
					<div className="mt-4 space-y-3">
						{investments.slice(0, 5).map((inv) => (
							<Link key={inv.id} to={`/student/investments/${inv.id}`}>
								<Card className="flex items-center justify-between transition-colors hover:border-[var(--accent-primary)]">
									<div>
										<p className="font-medium text-[var(--text)]">
											{inv.merchant?.business_name || "Merchant"}
										</p>
										<p className="text-sm text-[var(--text-secondary)]">
											{inv.shares} shares at {'\u20A6'}{inv.price_per_share}/share
										</p>
									</div>
									<div className="text-right">
										<p className="font-semibold text-[var(--text)]">
											{'\u20A6'}{inv.current_value.toLocaleString()}
										</p>
										<Badge
											variant={
												inv.status === "active"
													? "success"
													: inv.status === "withdrawn"
														? "default"
														: "warning"
											}
										>
											{inv.status}
										</Badge>
									</div>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default StudentDashboard;
