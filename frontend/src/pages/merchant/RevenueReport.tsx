import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRevenueReport } from '../../api/revenue';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const RevenueReport = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		period_start: '',
		period_end: '',
		gross_revenue: '',
		expenses: '',
		notes: '',
	});

	const grossRevenue = Number(form.gross_revenue) || 0;
	const expenses = Number(form.expenses) || 0;
	const netProfit = grossRevenue - expenses;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (netProfit < 0) {
			toast.error('Expenses cannot exceed gross revenue');
			return;
		}
		setLoading(true);
		try {
			await submitRevenueReport({
				period_start: form.period_start,
				period_end: form.period_end,
				gross_revenue: grossRevenue,
				expenses,
				notes: form.notes || undefined,
			});
			toast.success('Revenue report submitted successfully');
			navigate('/merchant/revenue');
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } };
			toast.error(error.response?.data?.message || 'Failed to submit report');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mx-auto max-w-2xl px-4 py-8">
			<h1 className="text-2xl font-bold text-[var(--text)]">Submit Revenue Report</h1>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">
				Report your business revenue for a specific period
			</p>

			<Card className="mt-6">
				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<label className="mb-1 block text-sm font-medium text-[var(--text)]">
								Period Start
							</label>
							<input
								type="date"
								name="period_start"
								value={form.period_start}
								onChange={handleChange}
								required
								className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent-primary)] focus:outline-none"
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm font-medium text-[var(--text)]">
								Period End
							</label>
							<input
								type="date"
								name="period_end"
								value={form.period_end}
								onChange={handleChange}
								required
								min={form.period_start}
								className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent-primary)] focus:outline-none"
							/>
						</div>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-[var(--text)]">
							Gross Revenue ({'\u20A6'})
						</label>
						<input
							type="number"
							name="gross_revenue"
							value={form.gross_revenue}
							onChange={handleChange}
							required
							min="0"
							step="0.01"
							placeholder="0.00"
							className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent-primary)] focus:outline-none"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-[var(--text)]">
							Expenses ({'\u20A6'})
						</label>
						<input
							type="number"
							name="expenses"
							value={form.expenses}
							onChange={handleChange}
							required
							min="0"
							step="0.01"
							placeholder="0.00"
							className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent-primary)] focus:outline-none"
						/>
					</div>

					{/* Net Profit Display */}
					<div className="rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
						<p className="text-sm text-[var(--text-secondary)]">Net Profit</p>
						<p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
							{'\u20A6'}{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</p>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-[var(--text)]">
							Notes (optional)
						</label>
						<textarea
							name="notes"
							value={form.notes}
							onChange={handleChange}
							rows={3}
							placeholder="Any additional notes about this reporting period..."
							className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent-primary)] focus:outline-none"
						/>
					</div>

					<div className="flex gap-3">
						<Button type="submit" disabled={loading || netProfit < 0}>
							{loading ? 'Submitting...' : 'Submit Report'}
						</Button>
						<Button type="button" variant="outline" onClick={() => navigate('/merchant/revenue')}>
							Cancel
						</Button>
					</div>
				</form>
			</Card>
		</div>
	);
};

export default RevenueReport;
