import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, RefreshCw, Calendar } from 'lucide-react';
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
  const [page, setPage] = useState(1);
  const [reports, setReports] = useState<RevenueReport[]>([]);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
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
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--text)">
            Annual Revenue & Dividends
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Audited financial reports for annual 30% dividend distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync'}
          </Button>
          <Link to="/merchant/revenue/report">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Submit Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <span className="text-xs font-medium uppercase tracking-wider text-(--text-secondary)">
            Total Recorded Revenue
          </span>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-(--text)">
            ₦{(summary?.total_revenue || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-(--text-tertiary)">Across audited fiscal periods</p>
        </Card>

        <Card>
          <span className="text-xs font-medium uppercase tracking-wider text-(--text-secondary)">
            Pending Reviews
          </span>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-(--warning)">
            {summary?.pending_count || 0}
          </p>
          <p className="mt-1 text-xs text-(--text-tertiary)">Awaiting compliance audit</p>
        </Card>

        <Card>
          <span className="text-xs font-medium uppercase tracking-wider text-(--text-secondary)">
            Distribution Schedule
          </span>
          <p className="mt-2 font-mono text-xl font-bold tracking-tight text-(--text)">
            January 1st
          </p>
          <p className="mt-1 text-xs text-(--text-tertiary)">Annual profit-share cycle</p>
        </Card>
      </div>

      {/* Reports List */}
      <div className="mt-10">
        <h2 className="text-base font-semibold text-(--text)">Fiscal Reports History</h2>

        {reports.length === 0 ? (
          <Card className="mt-4 py-12 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-(--text-tertiary)" />
            <h3 className="mt-3 text-sm font-semibold text-(--text)">No revenue reports filed</h3>
            <p className="mt-1 text-xs text-(--text-secondary)">
              Submit your annual financial figures to authorize student dividend distributions.
            </p>
            <div className="mt-4">
              <Link to="/merchant/revenue/report">
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Submit First Report
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {reports.map((report) => {
              const gross = Number(report.gross_revenue);
              const exp = Number(report.expenses);
              const profit = Number(report.net_profit);

              return (
                <Card
                  key={report.id}
                  className="p-4 transition-colors hover:border-(--accent-primary)"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-(--text-tertiary)" />
                        <span className="font-medium text-(--text)">
                          {new Date(report.period_start).toLocaleDateString()} &mdash;{' '}
                          {new Date(report.period_end).toLocaleDateString()}
                        </span>
                        <Badge
                          variant={statusVariant[report.status]}
                          className="text-[10px] capitalize"
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-(--text-tertiary)">
                        Submitted {new Date(report.created_at).toLocaleDateString()}
                        {report.notes && ` &middot; ${report.notes}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-right sm:text-right">
                      <div>
                        <p className="text-[11px] text-(--text-tertiary)">Gross / Expenses</p>
                        <p className="font-mono text-xs text-(--text-secondary)">
                          ₦{gross.toLocaleString()} / ₦{exp.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-(--text-tertiary)">Net Profit</p>
                        <p className="font-mono font-semibold text-(--success)">
                          ₦{profit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-(--text-secondary)">
              Page {page} of {pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueHistory;
