import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getRevenueHistory, getRevenueSummary } from '../../api/revenue';
import type { RevenueReport, RevenueSummary, Pagination } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const statusVariant: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
	pending: 'warning',
	approved: 'info',
	rejected: 'error',
	distributed: 'success',
};

const RevenueHistory = () => {
	const [reports, setReports] = useState<RevenueReport[]>([]);
	const [summary, setSummary] = useState<RevenueSummary | null>(null);
	const [pagination, setPagination] = useState<Pagination | null>(null);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [historyRes, summaryRes] = await Promise.allSettled([
					getRevenueHistory({ page, limit: 10 }),
					getRevenueSummary(),
				]);
				if (historyRes.status === 'fulfilled') {
					setReports(historyRes.value.data.data.reports);
					setPagination(historyRes.value.data.data.pagination);
				}
				if (summaryRes.status === 'fulfilled') {
					setSummary(summaryRes.value.data.data);
				}
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [page]);

	if (loading) return <Spinner size="lg" className="py-20" />;

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-(--text)">Revenue Reports</h1>
					<p className="mt-1 text-sm text-(--text-secondary)">Track your business revenue and distributions</p>
				</div>
				<Link to="/merchant/revenue/submit">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						New Report
					</Button>
				</Link>
			</div>

			{/* Summary Cards */}
			{summary && (
				<div className="mt-6 grid gap-4 sm:grid-cols-3">
					<Card>
						<p className="text-xs text-(--text-tertiary)">Total Revenue</p>
						<p className="mt-1 text-lg font-bold text-(--text)">
							{'\u20A6'}{summary.total_revenue.toLocaleString()}
						</p>
					</Card>
					<Card>
						<p className="text-xs text-(--text-tertiary)">Total Distributed</p>
						<p className="mt-1 text-lg font-bold text-(--success)">
							{'\u20A6'}{summary.total_distributed.toLocaleString()}
						</p>
					</Card>
					<Card>
						<p className="text-xs text-(--text-tertiary)">Pending Reports</p>
						<p className="mt-1 text-lg font-bold text-(--warning)">
							{summary.pending_count}
						</p>
					</Card>
				</div>
			)}

			{/* Reports Table */}
			<div className="mt-6">
				{reports.length === 0 ? (
					<Card className="py-12 text-center">
						<p className="text-sm text-(--text-secondary)">
							No revenue reports yet. Submit your first report to get started.
						</p>
						<Link to="/merchant/revenue/submit" className="mt-3 inline-block">
							<Button size="sm">Submit Report</Button>
						</Link>
					</Card>
				) : (
					<Card padding={false}>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-(--border) text-left text-xs text-(--text-tertiary)">
										<th className="px-4 py-3 font-medium">Period</th>
										<th className="px-4 py-3 font-medium">Gross Revenue</th>
										<th className="px-4 py-3 font-medium">Net Profit</th>
										<th className="px-4 py-3 font-medium">Status</th>
										<th className="px-4 py-3 font-medium">Submitted</th>
									</tr>
								</thead>
								<tbody>
									{reports.map((report) => (
										<tr
											key={report.id}
											className="border-b border-(--border) last:border-0 hover:bg-(--bg-tertiary) transition-colors"
										>
											<td className="px-4 py-3 text-(--text)">
												{new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
											</td>
											<td className="px-4 py-3 text-(--text)">
												{'\u20A6'}{Number(report.gross_revenue).toLocaleString()}
											</td>
											<td className="px-4 py-3 font-medium text-(--success)">
												{'\u20A6'}{Number(report.net_profit).toLocaleString()}
											</td>
											<td className="px-4 py-3">
												<Badge variant={statusVariant[report.status] || 'default'}>
													{report.status}
												</Badge>
											</td>
											<td className="px-4 py-3 text-(--text-secondary)">
												{new Date(report.submitted_at).toLocaleDateString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{pagination && pagination.total_pages > 1 && (
							<div className="flex items-center justify-between border-t border-(--border) px-4 py-3">
								<span className="text-xs text-(--text-secondary)">
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

export default RevenueHistory;
