import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Store,
  DollarSign,
  Calendar,
  Percent,
  RefreshCw,
  ArrowUpRight,
  Calculator,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { getStudentRoi } from '../../api/investments';
import type { StudentRoiData } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const StudentRoi = () => {
  const [data, setData] = useState<StudentRoiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulatedProfitMargin, setSimulatedProfitMargin] = useState<number>(20);

  const fetchRoi = useCallback(async (bypassCache = false) => {
    try {
      const res = await getStudentRoi({ bypassCache });
      setData(res.data.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRoi(true);
  }, [fetchRoi]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRoi(true);
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  const summary = data?.summary || {
    total_invested: 0,
    current_portfolio_value: 0,
    total_dividends_earned: 0,
    net_capital_growth: 0,
    total_net_profit: 0,
    overall_roi_percentage: 0,
    active_holdings_count: 0,
    next_distribution_date: '2027-01-01T00:00:00.000Z',
    days_to_distribution: 68,
    annual_profit_pool_share: '30%',
  };

  const holdings = data?.holdings || [];
  const payouts = data?.payouts || [];

  // Simulated annual dividend based on current portfolio value and 30% profit pool
  const simulatedAnnualDividend = Math.round(
    summary.total_invested * (simulatedProfitMargin / 100) * 0.3 * 1.5
  );
  const simulatedBankReturn = Math.round(summary.total_invested * 0.02);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--bg-secondary) px-2.5 py-0.5 text-xs text-(--text-secondary) mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-(--accent-primary)" />
            <span>UNN Campus Micro-Equity Protocol</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--text)">
            Returns on Investment (ROI)
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Comprehensive performance analytics, capital gains, and annual dividend distributions.
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
            {refreshing ? 'Syncing...' : 'Sync Data'}
          </Button>
          <Link to="/merchants">
            <Button size="sm" className="gap-1.5">
              <Store className="h-3.5 w-3.5" />
              Explore Merchants
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Overview Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: All-Time ROI */}
        <Card>
          <div className="flex items-center justify-between text-(--text-secondary)">
            <span className="text-xs font-medium uppercase tracking-wider">All-Time ROI</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--bg-tertiary) text-(--success) border border-(--border)">
              <Percent className="h-3.5 w-3.5" />
            </div>
          </div>
          <p
            className={`mt-3 font-mono text-3xl font-bold tracking-tight ${
              summary.overall_roi_percentage >= 0 ? 'text-(--success)' : 'text-(--error)'
            }`}
          >
            {summary.overall_roi_percentage >= 0 ? '+' : ''}
            {summary.overall_roi_percentage.toFixed(1)}%
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-(--text-secondary)">
            <span>Net Gain:</span>
            <span
              className={`font-mono font-medium ${
                summary.total_net_profit >= 0 ? 'text-(--success)' : 'text-(--error)'
              }`}
            >
              {summary.total_net_profit >= 0 ? '+' : ''}₦{summary.total_net_profit.toLocaleString()}
            </span>
          </div>
        </Card>

        {/* Card 2: Cumulative Dividends */}
        <Card>
          <div className="flex items-center justify-between text-(--text-secondary)">
            <span className="text-xs font-medium uppercase tracking-wider">Dividends Paid</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--bg-tertiary) text-(--accent-primary) border border-(--border)">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-(--text)">
            ₦{summary.total_dividends_earned.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-(--text-tertiary)">
            From 30% annual merchant profit pool
          </p>
        </Card>

        {/* Card 3: Invested vs Current Valuation */}
        <Card>
          <div className="flex items-center justify-between text-(--text-secondary)">
            <span className="text-xs font-medium uppercase tracking-wider">Portfolio Value</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--bg-tertiary) text-(--warning) border border-(--border)">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-(--text)">
            ₦{summary.current_portfolio_value.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-(--text-tertiary)">
            Invested Principal: ₦{summary.total_invested.toLocaleString()}
          </p>
        </Card>

        {/* Card 4: Next Distribution Countdown */}
        <Card>
          <div className="flex items-center justify-between text-(--text-secondary)">
            <span className="text-xs font-medium uppercase tracking-wider">Next Dividend</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--bg-tertiary) text-(--accent-primary) border border-(--border)">
              <Calendar className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-(--text)">
            {summary.days_to_distribution} Days
          </p>
          <p className="mt-2 text-xs text-(--text-tertiary)">Annual Payout Cycle (Jan 1)</p>
        </Card>
      </div>

      {/* Holdings ROI Breakdown */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-(--text)">
              Holdings ROI Performance
            </h2>
            <p className="text-xs text-(--text-secondary)">
              Real-time returns and share valuation for each campus business you back.
            </p>
          </div>
          <Badge variant="default" className="font-mono text-xs">
            {summary.active_holdings_count} Active Stakes
          </Badge>
        </div>

        {holdings.length === 0 ? (
          <Card className="mt-4 py-12 text-center">
            <Store className="mx-auto h-10 w-10 text-(--text-tertiary)" />
            <h3 className="mt-3 text-sm font-semibold text-(--text)">No active investments yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-(--text-secondary)">
              When you invest in campus merchants, your micro-shares will start earning capital
              growth and annual dividend returns here.
            </p>
            <div className="mt-4">
              <Link to="/merchants">
                <Button size="sm" className="gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" /> Browse Campus Merchants
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {holdings.map((h) => {
              const isPositive = h.roi_percentage >= 0;

              return (
                <Card
                  key={h.id}
                  className="p-5 transition-all duration-150 hover:border-(--accent-primary)"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Merchant & Shares */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--bg-tertiary) text-(--accent-primary) border border-(--border)">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/student/investments/${h.id}`}
                            className="font-medium text-(--text) hover:text-(--accent-primary) transition-colors flex items-center gap-1 group"
                          >
                            <span>{h.business_name}</span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-(--text-tertiary) group-hover:text-(--accent-primary)" />
                          </Link>
                          <Badge
                            variant={h.status === 'active' ? 'success' : 'default'}
                            className="text-[10px]"
                          >
                            {h.status}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-(--text-secondary)">
                          <span className="capitalize">{h.business_type}</span>
                          <span>&middot;</span>
                          <span>{h.shares} shares</span>
                          <span>&middot;</span>
                          <span>Principal: ₦{h.invested_amount.toLocaleString()}</span>
                          {h.portfolio_weight > 0 && (
                            <>
                              <span>&middot;</span>
                              <span className="text-(--accent-primary) font-mono">
                                {h.portfolio_weight}% of portfolio
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Valuation & ROI */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-(--border) pt-3 sm:border-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-(--text-tertiary)">Current Valuation</p>
                        <p className="font-mono text-base font-semibold text-(--text)">
                          ₦{h.current_value.toLocaleString()}
                        </p>
                        {h.dividends_earned > 0 && (
                          <p className="text-[11px] text-(--accent-primary) font-mono">
                            +₦{h.dividends_earned.toLocaleString()} dividends
                          </p>
                        )}
                      </div>

                      <div className="text-right min-w-[90px]">
                        <p className="text-xs text-(--text-tertiary)">Total ROI</p>
                        <p
                          className={`font-mono text-lg font-bold ${
                            isPositive ? 'text-(--success)' : 'text-(--error)'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {h.roi_percentage.toFixed(1)}%
                        </p>
                        <p
                          className={`font-mono text-[11px] ${
                            h.net_profit >= 0 ? 'text-(--success)' : 'text-(--error)'
                          }`}
                        >
                          {h.net_profit >= 0 ? '+' : ''}₦{h.net_profit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar visual for ROI */}
                  <div className="mt-3 pt-3 border-t border-(--border)/60 flex items-center justify-between text-[11px] text-(--text-secondary)">
                    <div className="flex items-center gap-2 w-full max-w-md">
                      <span className="shrink-0 text-(--text-tertiary)">Capital Gain:</span>
                      <div className="h-1.5 w-full rounded-full bg-(--bg-tertiary) overflow-hidden border border-(--border)">
                        <div
                          className="h-full bg-(--success) rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(5, h.roi_percentage))}%`,
                          }}
                        />
                      </div>
                    </div>
                    <Link
                      to={`/student/investments/${h.id}`}
                      className="text-xs font-medium text-(--accent-primary) hover:underline"
                    >
                      Stake details &rarr;
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Annual Dividend Estimator */}
      <div className="mt-10">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-(--text)">
            <Calculator className="h-5 w-5 text-(--accent-primary)" />
            <h2 className="text-lg font-semibold tracking-tight">
              Annual Dividend Payout Estimator
            </h2>
          </div>
          <p className="mt-1 text-xs text-(--text-secondary)">
            Simulate your expected annual dividend payout on January 1st based on your current
            campus holdings (₦{summary.total_invested.toLocaleString()}) and the merchant 30% profit
            pool.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-xs text-(--text-secondary)">
                <span>Average Merchant Annual Profit Margin</span>
                <span className="font-mono font-bold text-(--accent-primary) text-sm">
                  {simulatedProfitMargin}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={simulatedProfitMargin}
                onChange={(e) => setSimulatedProfitMargin(Number(e.target.value))}
                className="mt-3 w-full accent-(--accent-primary) cursor-pointer"
              />
              <div className="mt-2 flex justify-between text-[11px] font-mono text-(--text-tertiary)">
                <span>10% (Modest)</span>
                <span>20% (Typical)</span>
                <span>30% (High Growth)</span>
                <span>40% (Peak)</span>
              </div>

              <div className="mt-4 rounded-lg bg-(--bg-tertiary) p-3 text-xs text-(--text-secondary) border border-(--border)">
                <div className="flex items-center gap-1.5 font-medium text-(--text)">
                  <ShieldCheck className="h-4 w-4 text-(--success)" />
                  Midas 65% / 30% / 5% Formula
                </div>
                <p className="mt-1 text-[11px] text-(--text-secondary)">
                  30% of each verified merchant's net annual profit is distributed proportionally
                  into the student shareholder pool on January 1st.
                </p>
              </div>
            </div>

            {/* Projection Outcome */}
            <div className="flex flex-col justify-between rounded-xl border border-(--border) bg-(--bg-tertiary)/60 p-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-(--text-tertiary)">
                  Estimated Annual Payout
                </span>
                <p className="mt-1 font-mono text-3xl font-bold text-(--accent-primary)">
                  ₦{simulatedAnnualDividend.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-(--text-secondary)">
                  Yield on principal: ~
                  {summary.total_invested > 0
                    ? ((simulatedAnnualDividend / summary.total_invested) * 100).toFixed(1)
                    : (simulatedProfitMargin * 0.45).toFixed(1)}
                  % APY
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-(--border) flex items-center justify-between text-xs">
                <span className="text-(--text-secondary)">Traditional Savings (~2% APY):</span>
                <span className="font-mono text-(--text-tertiary)">
                  ₦{simulatedBankReturn.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Dividend Payout History */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-(--text)">
              Dividend Distribution History
            </h2>
            <p className="text-xs text-(--text-secondary)">
              Historical records of annual profit pool payouts deposited directly to your wallet.
            </p>
          </div>
        </div>

        {payouts.length === 0 ? (
          <Card className="mt-4 py-8 px-6 text-center">
            <Clock className="mx-auto h-8 w-8 text-(--text-tertiary)" />
            <h3 className="mt-2 text-sm font-semibold text-(--text)">
              Awaiting Annual Distribution Cycle
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-(--text-secondary)">
              Participating merchants submit annual audited reports for compliance review. The next
              automated dividend distribution is scheduled for midnight on{' '}
              <span className="font-semibold text-(--text)">January 1st, 2027</span>.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-(--text-tertiary)">
              <Sparkles className="h-3.5 w-3.5 text-(--accent-primary)" />
              <span>Earnings will automatically credit to your Midas Student Wallet.</span>
            </div>
          </Card>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-(--border) bg-(--bg-secondary)">
            <div className="divide-y divide-(--border)">
              {payouts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-(--bg-tertiary)/40"
                >
                  <div>
                    <p className="font-medium text-(--text)">{p.merchant_name}</p>
                    <p className="text-xs text-(--text-tertiary)">
                      {p.shares_held} shares held &middot;{' '}
                      {new Date(p.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-(--success)">
                      +₦{p.amount.toLocaleString()}
                    </p>
                    <Badge variant="success" className="mt-1 text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRoi;
