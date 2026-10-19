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
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  const setYearPreset = (year: number) => {
    setForm((prev) => ({
      ...prev,
      period_start: `${year}-01-01`,
      period_end: `${year}-12-31`,
    }));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-(--text)">Submit Annual Revenue Report</h1>
      <p className="mt-1 text-sm text-(--text-secondary)">
        Report your business revenue and expenses for the annual financial period. Approved profits
        are distributed to investors as yearly dividends.
      </p>

      {/* Yearly Distribution Callout */}
      <div className="mt-4 rounded-xl border border-(--border) bg-(--bg-secondary) p-4 text-xs text-(--text-secondary)">
        <p className="font-semibold text-(--text)">Annual Payout Distribution Model</p>
        <p className="mt-1">
          Dividends to investors are calculated and disbursed once a year from approved annual net
          profit: <strong>65%</strong> retained by merchant, <strong>30%</strong> distributed to
          active investors based on shareholding, and <strong>5%</strong> platform commission.
        </p>
      </div>

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-(--text-secondary)">
                Quick Period Presets:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setYearPreset(new Date().getFullYear() - 1)}
                  className="rounded border border-(--border) px-2 py-0.5 text-xs text-(--text-secondary) hover:border-(--accent-primary) hover:text-(--text)"
                >
                  {new Date().getFullYear() - 1} Full Year
                </button>
                <button
                  type="button"
                  onClick={() => setYearPreset(new Date().getFullYear())}
                  className="rounded border border-(--border) px-2 py-0.5 text-xs text-(--text-secondary) hover:border-(--accent-primary) hover:text-(--text)"
                >
                  {new Date().getFullYear()} Full Year
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-(--text)">Period Start</label>
                <input
                  type="date"
                  name="period_start"
                  value={form.period_start}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-(--border) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text) focus:border-(--accent-primary) focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--text)">Period End</label>
                <input
                  type="date"
                  name="period_end"
                  value={form.period_end}
                  onChange={handleChange}
                  required
                  min={form.period_start}
                  className="w-full rounded-lg border border-(--border) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text) focus:border-(--accent-primary) focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-(--text)">
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
              className="w-full rounded-lg border border-(--border) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text) focus:border-(--accent-primary) focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-(--text)">
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
              className="w-full rounded-lg border border-(--border) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text) focus:border-(--accent-primary) focus:outline-none"
            />
          </div>

          {/* Net Profit Display */}
          <div className="rounded-lg border border-(--border) bg-(--bg-tertiary) p-4">
            <p className="text-sm text-(--text-secondary)">Net Profit</p>
            <p
              className={`text-2xl font-bold ${netProfit >= 0 ? 'text-(--success)' : 'text-(--error)'}`}
            >
              {'\u20A6'}
              {netProfit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-(--text)">Notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional notes about this reporting period..."
              className="w-full rounded-lg border border-(--border) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text) focus:border-(--accent-primary) focus:outline-none"
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
