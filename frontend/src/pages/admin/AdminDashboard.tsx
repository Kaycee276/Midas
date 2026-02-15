import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingKYC, getDashboardStats } from '../../api/admin';
import type { KYC, Pagination, DashboardStats } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<KYC[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.data);
      } catch {
        // empty
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

  const pnl = stats ? stats.investments.total_current_value - stats.investments.total_invested : 0;

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
          {/* Stat Tiles — Row 1 & 2 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Students" value={stats.students.total} sub={`${stats.students.active} active`} />
            <StatTile label="Merchants" value={stats.merchants.total} sub={`${stats.merchants.active} active`} />
            <StatTile label="Investments" value={stats.investments.total} sub={`${stats.investments.active} active`} />
            <StatTile label="Pending KYC" value={stats.kyc.pending} sub={`${stats.kyc.resubmission_required} resubmissions`} />

            <StatTile label="Total Invested" value={fmt(stats.investments.total_invested)} />
            <StatTile label="Portfolio Value" value={fmt(stats.investments.total_current_value)} />
            <StatTile label="KYC Approved" value={stats.kyc.approved} sub={`of ${stats.kyc.total}`} />
            <StatTile label="KYC Rejected" value={stats.kyc.rejected} />
          </div>

          {/* Middle Section */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Merchant Status */}
            <Card padding={false} className="p-4">
              <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Merchant Status</h2>
              <div className="space-y-2">
                {([
                  { label: 'Active', count: stats.merchants.active, color: 'bg-green-500' },
                  { label: 'Pending KYC', count: stats.merchants.pending_kyc, color: 'bg-yellow-500' },
                  { label: 'KYC Submitted', count: stats.merchants.kyc_submitted, color: 'bg-blue-500' },
                  { label: 'KYC Rejected', count: stats.merchants.kyc_rejected, color: 'bg-red-500' },
                  { label: 'Suspended', count: stats.merchants.suspended, color: 'bg-orange-500' },
                  { label: 'Inactive', count: stats.merchants.inactive, color: 'bg-gray-500' },
                ] as const).map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <span className="w-24 shrink-0 text-[var(--text-secondary)]">{label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: stats.merchants.total ? `${(count / stats.merchants.total) * 100}%` : '0%' }}
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
                  { label: 'Active', count: stats.students.active },
                  { label: 'Suspended', count: stats.students.suspended },
                  { label: 'Inactive', count: stats.students.inactive },
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
                  { label: 'Total Invested', value: fmt(stats.investments.total_invested) },
                  { label: 'Current Value', value: fmt(stats.investments.total_current_value) },
                  { label: 'P&L', value: `${pnl >= 0 ? '+' : ''}${fmt(pnl)}`, color: pnl >= 0 ? 'text-green-500' : 'text-red-500' },
                  { label: 'Active', value: String(stats.investments.active) },
                  { label: 'Withdrawn', value: String(stats.investments.withdrawn) },
                  { label: 'Total', value: String(stats.investments.total) },
                ] as const).map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">{label}</span>
                    <span className={`font-medium ${color || 'text-[var(--text)]'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : null}

      {/* KYC Table */}
      <div id="pending-kyc" className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Pending KYC Submissions</h2>

        {loading ? (
          <Spinner size="lg" className="py-12" />
        ) : submissions.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No pending KYC submissions</p>
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
                        {kyc.merchant?.business_name || 'Merchant'}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : 'N/A'}
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

const StatTile = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <Card padding={false} className="p-4">
    <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
    <p className="mt-1 text-lg font-bold text-[var(--text)]">{value}</p>
    {sub && <p className="text-[10px] text-[var(--text-tertiary)]">{sub}</p>}
  </Card>
);

export default AdminDashboard;
