import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitRevenueReport } from '../../api/revenue';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

const RevenueReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    period_start: `${new Date().getFullYear() - 1}-01-01`,
    period_end: `${new Date().getFullYear() - 1}-12-31`,
    gross_revenue: '',
    expenses: '',
    notes: '',
  });

  const grossRevenue = Number(form.gross_revenue) || 0;
  const expenses = Number(form.expenses) || 0;
  const netProfit = Math.max(0, grossRevenue - expenses);
  const investorPool = Math.round(netProfit * 0.3);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expenses > grossRevenue) {
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
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link
        to="/merchant/revenue"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text) transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Revenue History
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-(--text)">
        Submit Fiscal Year Report
      </h1>
      <p className="mt-1 text-sm text-(--text-secondary)">
        Enter your audited annual financials to calculate the 30% student dividend pool.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fiscal Period Presets */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-(--text-secondary)">Fiscal Period</span>
              <div className="flex gap-1.5">
                {[new Date().getFullYear() - 1, new Date().getFullYear()].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setYearPreset(yr)}
                    className="rounded-lg border border-(--border) bg-(--bg-tertiary) px-2.5 py-1 text-xs text-(--text-secondary) hover:border-(--accent-primary) hover:text-(--text) transition-colors"
                  >
                    FY {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Period Start"
                type="date"
                name="period_start"
                value={form.period_start}
                onChange={handleChange}
                required
              />
              <Input
                label="Period End"
                type="date"
                name="period_end"
                value={form.period_end}
                onChange={handleChange}
                required
                min={form.period_start}
              />
            </div>
          </div>

          <Input
            label="Gross Revenue (₦)"
            type="number"
            name="gross_revenue"
            value={form.gross_revenue}
            onChange={handleChange}
            required
            min="0"
            step="any"
            placeholder="e.g. 12500000"
            className="font-mono"
          />

          <Input
            label="Operational Expenses (₦)"
            type="number"
            name="expenses"
            value={form.expenses}
            onChange={handleChange}
            required
            min="0"
            step="any"
            placeholder="e.g. 8200000"
            className="font-mono"
          />

          {/* Real-time Net Profit & Dividend calculation */}
          {grossRevenue > 0 && (
            <div className="rounded-xl border border-(--border) bg-(--bg-tertiary) p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-(--accent-primary) mb-1">
                <Calculator className="h-3.5 w-3.5" />
                <span>Protocol Profit Distribution</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-secondary)">Net Profit:</span>
                <span className="font-mono font-semibold text-(--text)">
                  ₦{netProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-(--border) pt-2">
                <span className="text-(--text-secondary)">Investor Dividend Pool (30%):</span>
                <span className="font-mono font-bold text-(--success)">
                  ₦{investorPool.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-(--text-tertiary)">
                <span>
                  Merchant Retained (65%): ₦{Math.round(netProfit * 0.65).toLocaleString()}
                </span>
                <span>Platform (5%): ₦{Math.round(netProfit * 0.05).toLocaleString()}</span>
              </div>
            </div>
          )}

          <Textarea
            label="Auditor or Operational Notes (optional)"
            name="notes"
            rows={2}
            value={form.notes}
            onChange={handleChange}
            placeholder="Audited fiscal figures, major capital equipment purchases, etc."
          />

          <Button
            type="submit"
            loading={loading}
            disabled={!form.gross_revenue || grossRevenue < expenses}
            className="w-full gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Submit Report for Audit
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RevenueReport;
