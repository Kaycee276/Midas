import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
	XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getPendingKYC, getDashboardStats, getAnalytics, getPendingRevenue, approveRevenue, rejectRevenue, distributeRevenue } from "../../api/admin";
import type { KYC, Pagination, DashboardStats, AdminAnalytics, RevenueReport } from "../../types";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const today = new Date().toLocaleDateString("en-US", {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
});

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

const formatMonth = (month: string) => {
	const [year, m] = month.split("-");
	const date = new Date(Number(year), Number(m) - 1);
	return date.toLocaleDateString("en-US", { month: "short" });
};

const AdminDashboard = () => {
	const [submissions, setSubmissions] = useState<KYC[]>([]);
	const [pagination, setPagination] = useState<Pagination | null>(null);
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
	const [pendingReports, setPendingReports] = useState<RevenueReport[]>([]);
	const [loading, setLoading] = useState(true);
	const [statsLoading, setStatsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const [statsRes, analyticsRes, revenueRes] = await Promise.allSettled([
					getDashboardStats(),
					getAnalytics(),
					getPendingRevenue({ limit: 5 }),
				]);
				if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
				if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data.data);
				if (revenueRes.status === "fulfilled") setPendingReports(revenueRes.value.data.data.reports);
			} finally {
				setStatsLoading(false);
			}
		};
		fetchStats();
	}, []);

	useEffect(() => {
		const fetchKyc = async () => {
			setLoading(true);
			try {
				const { data } = await getPendingKYC({ page, limit: 20 });
				setSubmissions(data.data.kyc_submissions);
				setPagination(data.data.pagination);
			} catch {
				// empty
			} finally {
				setLoading(false);
			}
		};
		fetchKyc();
	}, [page]);

	const handleApproveRevenue = async (id: string) => {
		setActionLoading(id);
		try {
			await approveRevenue(id);
			setPendingReports(prev => prev.filter(r => r.id !== id));
			toast.success("Revenue report approved");
		} catch {
			toast.error("Failed to approve report");
		} finally {
			setActionLoading(null);
		}
	};

	const handleRejectRevenue = async (id: string) => {
		const reason = prompt("Rejection reason:");
		if (!reason) return;
		setActionLoading(id);
		try {
			await rejectRevenue(id, { rejection_reason: reason });
			setPendingReports(prev => prev.filter(r => r.id !== id));
			toast.success("Revenue report rejected");
		} catch {
			toast.error("Failed to reject report");
		} finally {
			setActionLoading(null);
		}
	};

	const handleDistribute = async (id: string) => {
		setActionLoading(id);
		try {
			await distributeRevenue(id);
			setPendingReports(prev => prev.filter(r => r.id !== id));
			toast.success("Profit distributed successfully");
		} catch {
			toast.error("Failed to distribute profit");
		} finally {
			setActionLoading(null);
		}
	};

	const pnl = stats
		? stats.investments.total_current_value - stats.investments.total_invested
		: 0;

	const investmentChartData = (analytics?.investment_trend || []).map(d => ({
		...d,
		month: formatMonth(d.month),
	}));

	const revenueChartData = (analytics?.revenue_trend || []).map(d => ({
		...d,
		month: formatMonth(d.month),
	}));

	const pieData = (analytics?.investments_by_type || []).map(d => ({
		name: d.business_type.replace(/_/g, " "),
		value: d.total_amount,
	}));

	const topMerchantsData = (analytics?.top_merchants || []).map(d => ({
		name: d.business_name.length > 15 ? d.business_name.slice(0, 15) + "..." : d.business_name,
		total_raised: d.total_raised,
	}));

	return (
		<div className="p-4 sm:p-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-xl font-bold text-[var(--text)]">Dashboard</h1>
				<p className="text-sm text-[var(--text-tertiary)]">{today}</p>
			</div>

			{statsLoading ? (
				<Spinner size="lg" className="py-12" />
			) : stats ? (
				<>
					{/* Row 1: Stat Tiles */}
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
						<StatTile label="Students" value={stats.students.total} sub={`${stats.students.active} active`} />
						<StatTile label="Merchants" value={stats.merchants.total} sub={`${stats.merchants.active} active`} />
						<StatTile label="Investments" value={stats.investments.total} sub={`${stats.investments.active} active`} />
						<StatTile label="Pending KYC" value={stats.kyc.pending} sub={`${stats.kyc.resubmission_required} resubmissions`} />
						<StatTile label="Total Invested" value={`\u20A6${stats.investments.total_invested.toLocaleString()}`} />
						<StatTile label="Portfolio Value" value={`\u20A6${stats.investments.total_current_value.toLocaleString()}`} />
						<StatTile label="KYC Approved" value={stats.kyc.approved} sub={`of ${stats.kyc.total}`} />
						<StatTile label="KYC Rejected" value={stats.kyc.rejected} />
						<StatTile label="Platform Balance" value={`\u20A6${(analytics?.platform_balance || 0).toLocaleString()}`} />
						<StatTile label="Total Revenue" value={`\u20A6${(analytics?.total_revenue || 0).toLocaleString()}`} sub={`\u20A6${(analytics?.total_distributed || 0).toLocaleString()} distributed`} />
					</div>

					{/* Row 2: Charts — Investment Volume + Revenue Trend */}
					{analytics && (
						<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
							<Card padding={false} className="p-4">
								<h2 className="mb-4 text-sm font-semibold text-[var(--text)]">
									Monthly Investment Volume
								</h2>
								<ResponsiveContainer width="100%" height={250}>
									<BarChart data={investmentChartData}>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
										<XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
										<YAxis tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
										<Tooltip
											contentStyle={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
											formatter={(value: number) => [`\u20A6${value.toLocaleString()}`, "Amount"]}
										/>
										<Bar dataKey="total_amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</Card>

							<Card padding={false} className="p-4">
								<h2 className="mb-4 text-sm font-semibold text-[var(--text)]">
									Revenue & Distribution Trend
								</h2>
								<ResponsiveContainer width="100%" height={250}>
									<AreaChart data={revenueChartData}>
										<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
										<XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
										<YAxis tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
										<Tooltip
											contentStyle={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
											formatter={(value: number) => [`\u20A6${value.toLocaleString()}`]}
										/>
										<Area type="monotone" dataKey="total_revenue" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Revenue" />
										<Area type="monotone" dataKey="total_distributed" stackId="2" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} name="Distributed" />
										<Legend />
									</AreaChart>
								</ResponsiveContainer>
							</Card>
						</div>
					)}

					{/* Row 3: Pie Chart + Top Merchants */}
					{analytics && (
						<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
							<Card padding={false} className="p-4">
								<h2 className="mb-4 text-sm font-semibold text-[var(--text)]">
									Investments by Business Type
								</h2>
								{pieData.length > 0 ? (
									<ResponsiveContainer width="100%" height={250}>
										<PieChart>
											<Pie
												data={pieData}
												dataKey="value"
												nameKey="name"
												cx="50%"
												cy="50%"
												outerRadius={90}
												label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
											>
												{pieData.map((_, idx) => (
													<Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
												))}
											</Pie>
											<Tooltip
												contentStyle={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
												formatter={(value: number) => [`\u20A6${value.toLocaleString()}`]}
											/>
										</PieChart>
									</ResponsiveContainer>
								) : (
									<p className="py-12 text-center text-sm text-[var(--text-secondary)]">No investment data yet</p>
								)}
							</Card>

							<Card padding={false} className="p-4">
								<h2 className="mb-4 text-sm font-semibold text-[var(--text)]">
									Top 5 Merchants by Capital Raised
								</h2>
								{topMerchantsData.length > 0 ? (
									<ResponsiveContainer width="100%" height={250}>
										<BarChart data={topMerchantsData} layout="vertical">
											<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
											<XAxis type="number" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
											<YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} width={100} />
											<Tooltip
												contentStyle={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
												formatter={(value: number) => [`\u20A6${value.toLocaleString()}`, "Raised"]}
											/>
											<Bar dataKey="total_raised" fill="#22c55e" radius={[0, 4, 4, 0]} />
										</BarChart>
									</ResponsiveContainer>
								) : (
									<p className="py-12 text-center text-sm text-[var(--text-secondary)]">No merchant data yet</p>
								)}
							</Card>
						</div>
					)}

					{/* Row 4: Existing detail cards */}
					<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
						{/* Merchant Status */}
						<Card padding={false} className="p-4">
							<h2 className="mb-3 text-sm font-semibold text-[var(--text)]">
								Merchant Status
							</h2>
							<div className="space-y-2">
								{(
									[
										{ label: "Active", count: stats.merchants.active, color: "bg-green-500" },
										{ label: "Pending KYC", count: stats.merchants.pending_kyc, color: "bg-yellow-500" },
										{ label: "KYC Submitted", count: stats.merchants.kyc_submitted, color: "bg-blue-500" },
										{ label: "KYC Rejected", count: stats.merchants.kyc_rejected, color: "bg-red-500" },
										{ label: "Suspended", count: stats.merchants.suspended, color: "bg-orange-500" },
										{ label: "Inactive", count: stats.merchants.inactive, color: "bg-gray-500" },
									] as const
								).map(({ label, count, color }) => (
									<div key={label} className="flex items-center gap-2 text-xs">
										<span className="w-24 shrink-0 text-[var(--text-secondary)]">{label}</span>
										<div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
											<div
												className={`h-full rounded-full ${color}`}
												style={{ width: stats.merchants.total ? `${(count / stats.merchants.total) * 100}%` : "0%" }}
											/>
										</div>
										<span className="w-6 text-right font-medium text-[var(--text)]">{count}</span>
									</div>
								))}
							</div>
						</Card>

						{/* Students + KYC Pipeline */}
						<Card padding={false} className="p-4">
							<h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Students</h2>
							<div className="space-y-1.5 text-xs">
								{([
									{ label: "Active", count: stats.students.active },
									{ label: "Suspended", count: stats.students.suspended },
									{ label: "Inactive", count: stats.students.inactive },
								] as const).map(({ label, count }) => (
									<div key={label} className="flex justify-between">
										<span className="text-[var(--text-secondary)]">{label}</span>
										<span className="font-medium text-[var(--text)]">{count}</span>
									</div>
								))}
							</div>
							<h2 className="mb-2 mt-4 text-sm font-semibold text-[var(--text)]">KYC Pipeline</h2>
							{stats.kyc.total > 0 && (
								<div className="mb-2 flex h-3 overflow-hidden rounded-full">
									<div className="bg-green-500" style={{ width: `${(stats.kyc.approved / stats.kyc.total) * 100}%` }} />
									<div className="bg-yellow-500" style={{ width: `${(stats.kyc.pending / stats.kyc.total) * 100}%` }} />
									<div className="bg-red-500" style={{ width: `${(stats.kyc.rejected / stats.kyc.total) * 100}%` }} />
									<div className="bg-orange-500" style={{ width: `${(stats.kyc.resubmission_required / stats.kyc.total) * 100}%` }} />
								</div>
							)}
							<div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
								<span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Approved ({stats.kyc.approved})</span>
								<span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-yellow-500" /> Pending ({stats.kyc.pending})</span>
								<span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Rejected ({stats.kyc.rejected})</span>
								<span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-orange-500" /> Resubmit ({stats.kyc.resubmission_required})</span>
							</div>
						</Card>

						{/* Investments */}
						<Card padding={false} className="p-4">
							<h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Investments</h2>
							<div className="space-y-2 text-xs">
								{([
									{ label: "Total Invested", value: `\u20A6${stats.investments.total_invested.toLocaleString()}` },
									{ label: "Current Value", value: `\u20A6${stats.investments.total_current_value.toLocaleString()}` },
									{ label: "P&L", value: `${pnl >= 0 ? "+" : ""}\u20A6${Math.abs(pnl).toLocaleString()}`, color: pnl >= 0 ? "text-green-500" : "text-red-500" },
									{ label: "Active", value: String(stats.investments.active) },
									{ label: "Withdrawn", value: String(stats.investments.withdrawn) },
									{ label: "Total", value: String(stats.investments.total) },
								] as { label: string; value: string; color?: string }[]).map(({ label, value, color }) => (
									<div key={label} className="flex justify-between">
										<span className="text-[var(--text-secondary)]">{label}</span>
										<span className={`font-medium ${color || "text-[var(--text)]"}`}>{value}</span>
									</div>
								))}
							</div>
						</Card>
					</div>

					{/* Row 5: Recent Distributions + Pending Revenue (side by side) */}
					<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
						{/* Recent Distributions */}
						<div>
							<h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Recent Distributions</h2>
							{(analytics?.recent_distributions || []).length === 0 ? (
								<Card className="py-8 text-center">
									<p className="text-sm text-[var(--text-secondary)]">No distributions yet</p>
								</Card>
							) : (
								<Card padding={false}>
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-tertiary)]">
													<th className="px-4 py-3 font-medium">Merchant</th>
													<th className="px-4 py-3 font-medium">Profit</th>
													<th className="px-4 py-3 font-medium">Status</th>
													<th className="px-4 py-3 font-medium">Date</th>
												</tr>
											</thead>
											<tbody>
												{(analytics?.recent_distributions || []).map((dist) => (
													<tr key={dist.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors">
														<td className="px-4 py-3 text-[var(--text)]">{dist.merchant?.business_name || "N/A"}</td>
														<td className="px-4 py-3 text-[var(--text)]">{"\u20A6"}{Number(dist.total_profit).toLocaleString()}</td>
														<td className="px-4 py-3">
															<Badge variant={dist.status === "completed" ? "success" : dist.status === "failed" ? "error" : "warning"}>
																{dist.status}
															</Badge>
														</td>
														<td className="px-4 py-3 text-[var(--text-secondary)]">
															{dist.distributed_at ? new Date(dist.distributed_at).toLocaleDateString() : "Pending"}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</Card>
							)}
						</div>

						{/* Pending Revenue Reports */}
						<div>
							<h2 className="mb-3 text-sm font-semibold text-[var(--text)]">
								Pending Revenue Reports {pendingReports.length > 0 && <Badge variant="warning" className="ml-2">{pendingReports.length}</Badge>}
							</h2>
							{pendingReports.length === 0 ? (
								<Card className="py-8 text-center">
									<p className="text-sm text-[var(--text-secondary)]">No pending revenue reports</p>
								</Card>
							) : (
								<Card padding={false}>
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-tertiary)]">
													<th className="px-4 py-3 font-medium">Merchant</th>
													<th className="px-4 py-3 font-medium">Net Profit</th>
													<th className="px-4 py-3 font-medium text-right">Actions</th>
												</tr>
											</thead>
											<tbody>
												{pendingReports.map((report) => (
													<tr key={report.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors">
														<td className="px-4 py-3">
															<p className="font-medium text-[var(--text)]">{report.merchant?.business_name || "Merchant"}</p>
															<p className="text-xs text-[var(--text-secondary)]">
																{new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
															</p>
														</td>
														<td className="px-4 py-3 font-medium text-[var(--success)]">
															{"\u20A6"}{Number(report.net_profit).toLocaleString()}
														</td>
														<td className="px-4 py-3 text-right">
															<div className="flex justify-end gap-1">
																<Button
																	size="sm"
																	variant="outline"
																	disabled={actionLoading === report.id}
																	onClick={() => handleApproveRevenue(report.id)}
																>
																	Approve
																</Button>
																<Button
																	size="sm"
																	variant="outline"
																	disabled={actionLoading === report.id}
																	onClick={() => handleRejectRevenue(report.id)}
																>
																	Reject
																</Button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</Card>
							)}
						</div>
					</div>
				</>
			) : null}

			{/* Row 6: Pending KYC Table */}
			<div id="pending-kyc" className="mt-6">
				<h2 className="mb-3 text-sm font-semibold text-[var(--text)]">
					Pending KYC Submissions
				</h2>

				{loading ? (
					<Spinner size="lg" className="py-12" />
				) : submissions.length === 0 ? (
					<Card className="py-12 text-center">
						<p className="text-sm text-[var(--text-secondary)]">
							No pending KYC submissions
						</p>
					</Card>
				) : (
					<Card padding={false}>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-tertiary)]">
										<th className="px-4 py-3 font-medium">Business Name</th>
										<th className="px-4 py-3 font-medium">Submitted</th>
										<th className="px-4 py-3 font-medium">Status</th>
										<th className="px-4 py-3 font-medium text-right">Action</th>
									</tr>
								</thead>
								<tbody>
									{submissions.map((kyc) => (
										<tr
											key={kyc.id}
											className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-tertiary)] transition-colors"
										>
											<td className="px-4 py-3 font-medium text-[var(--text)]">
												{kyc.merchant?.business_name || "Merchant"}
											</td>
											<td className="px-4 py-3 text-[var(--text-secondary)]">
												{kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : "N/A"}
											</td>
											<td className="px-4 py-3">
												<Badge variant="warning">Pending</Badge>
											</td>
											<td className="px-4 py-3 text-right">
												<Link
													to={`/admin/kyc/${kyc.id}`}
													className="text-sm font-medium text-[var(--accent-primary)] hover:underline"
												>
													Review
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{pagination && pagination.total_pages > 1 && (
							<div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
								<span className="text-xs text-[var(--text-secondary)]">
									Page {page} of {pagination.total_pages}
								</span>
								<div className="flex gap-2">
									<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
										Previous
									</Button>
									<Button variant="outline" size="sm" disabled={page >= pagination.total_pages} onClick={() => setPage(page + 1)}>
										Next
									</Button>
								</div>
							</div>
						)}
					</Card>
				)}
			</div>
		</div>
	);
};

const StatTile = ({
	label,
	value,
	sub,
}: {
	label: string;
	value: string | number;
	sub?: string;
}) => (
	<Card padding={false} className="p-4">
		<p className="text-xs text-[var(--text-tertiary)]">{label}</p>
		<p className="mt-1 text-lg font-bold text-[var(--text)]">{value}</p>
		{sub && <p className="text-[10px] text-[var(--text-tertiary)]">{sub}</p>}
	</Card>
);

export default AdminDashboard;
