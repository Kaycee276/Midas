import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, Users, Store, TrendingUp } from 'lucide-react';
import { getPendingKYC, getDashboardStats } from '../../api/admin';
import type { KYC, Pagination, DashboardStats } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-[var(--accent-primary)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Admin Dashboard</h1>
          <p className="text-[var(--text-secondary)]">Platform overview and pending actions</p>
        </div>
      </div>

      {/* Section 1: Overview Stats Cards */}
      {statsLoading ? (
        <Spinner size="lg" className="py-12" />
      ) : stats ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Total Students</p>
                  <p className="text-2xl font-bold text-[var(--text)]">{stats.students.total}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{stats.students.active} active</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <Store className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Total Merchants</p>
                  <p className="text-2xl font-bold text-[var(--text)]">{stats.merchants.total}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{stats.merchants.active} active</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Total Investments</p>
                  <p className="text-2xl font-bold text-[var(--text)]">{stats.investments.total}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{formatCurrency(stats.investments.total_invested)} invested</p>
                </div>
              </div>
            </Card>

            <a href="#pending-kyc">
              <Card className="cursor-pointer transition-colors hover:border-[var(--accent-primary)]">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Pending KYC</p>
                    <p className="text-2xl font-bold text-[var(--text)]">{stats.kyc.pending}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">awaiting review</p>
                  </div>
                </div>
              </Card>
            </a>
          </div>

          {/* Section 2: Platform Breakdown */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">Merchant Status Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: 'Active', count: stats.merchants.active, variant: 'success' as const },
                  { label: 'Pending KYC', count: stats.merchants.pending_kyc, variant: 'warning' as const },
                  { label: 'KYC Submitted', count: stats.merchants.kyc_submitted, variant: 'info' as const },
                  { label: 'KYC Rejected', count: stats.merchants.kyc_rejected, variant: 'error' as const },
                  { label: 'Suspended', count: stats.merchants.suspended, variant: 'error' as const },
                  { label: 'Inactive', count: stats.merchants.inactive, variant: 'default' as const },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <Badge variant={item.variant}>{item.label}</Badge>
                    <span className="text-sm font-medium text-[var(--text)]">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">Investment Overview</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Total Invested</span>
                  <span className="text-sm font-medium text-[var(--text)]">{formatCurrency(stats.investments.total_invested)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Current Value</span>
                  <span className="text-sm font-medium text-[var(--text)]">{formatCurrency(stats.investments.total_current_value)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Active Investments</span>
                  <span className="text-sm font-medium text-[var(--text)]">{stats.investments.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Withdrawn</span>
                  <span className="text-sm font-medium text-[var(--text)]">{stats.investments.withdrawn}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : null}

      {/* Section 3: Pending KYC Submissions */}
      <div id="pending-kyc" className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">Pending KYC Submissions</h2>

        {loading ? (
          <Spinner size="lg" className="py-12" />
        ) : submissions.length === 0 ? (
          <Card className="text-center">
            <FileText className="mx-auto h-12 w-12 text-[var(--text-tertiary)]" />
            <p className="mt-4 text-[var(--text-secondary)]">No pending KYC submissions</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {submissions.map((kyc) => (
                <Link key={kyc.id} to={`/admin/kyc/${kyc.id}`}>
                  <Card className="flex items-center justify-between transition-colors hover:border-[var(--accent-primary)]">
                    <div>
                      <p className="font-medium text-[var(--text)]">{kyc.merchant?.business_name || 'Merchant'}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Submitted {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge variant="warning">Pending Review</Badge>
                  </Card>
                </Link>
              ))}
            </div>

            {pagination && pagination.total_pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <span className="text-sm text-[var(--text-secondary)]">Page {page} of {pagination.total_pages}</span>
                <Button variant="outline" size="sm" disabled={page >= pagination.total_pages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
