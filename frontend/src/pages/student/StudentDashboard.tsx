import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  Wallet,
  GraduationCap,
  Store,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../stores/useAuthStore';
import { getPortfolio } from '../../api/investments';
import { getWalletInfo } from '../../api/wallet';
import type { Student, PortfolioSummary, Investment } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const StudentDashboard = () => {
  const { user } = useAuth();
  const student = user?.data as Student;
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(student?.wallet_balance || 0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async (bypassCache = false) => {
    try {
      const [portfolioRes, walletRes] = await Promise.allSettled([
        getPortfolio({ bypassCache }),
        getWalletInfo({ bypassCache }),
      ]);
      if (portfolioRes.status === 'fulfilled') {
        setSummary(portfolioRes.value.data.data.summary);
        setInvestments(portfolioRes.value.data.data.investments);
      }
      if (walletRes.status === 'fulfilled') {
        setWalletBalance(walletRes.value.data.data.balance);
      }
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch always forces fresh data to ensure recently funded accounts or new investments are immediately visible
    fetchData(true);
  }, [fetchData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  const totalInvested = Number(summary?.total_invested || 0);
  const portfolioValuation = Number(summary?.current_portfolio_value || totalInvested);
  const totalReturns = Number(summary?.total_returns || 0);
  const activeCount =
    summary?.active_investments ?? investments.filter((i) => i.status === 'active').length;

  const returnPercentage =
    totalInvested > 0
      ? (((portfolioValuation + totalReturns - totalInvested) / totalInvested) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner / Student Investor Identity */}
      <div className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-(--accent-primary)/10 text-(--accent-primary) ring-1 ring-(--accent-primary)/20">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-(--text) sm:text-3xl">
                  Welcome, {student?.full_name || 'Student Investor'}
                </h1>
                <Badge variant="success" className="text-xs">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                  Verified Student
                </Badge>
                {student?.university && (
                  <span className="rounded-full bg-(--bg-tertiary) px-2.5 py-0.5 text-xs font-medium text-(--text-secondary) border border-(--border)">
                    {student.university}
                  </span>
                )}
                {student?.program && (
                  <span className="rounded-full bg-(--bg-tertiary) px-2.5 py-0.5 text-xs font-medium text-(--text-secondary) border border-(--border)">
                    {student.program}{' '}
                    {student?.year_of_study ? `(Year ${student.year_of_study})` : ''}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-(--text-secondary)">
                Academic micro-equity dashboard • Backing verified campus entrepreneurs.
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-(--text-tertiary)">
                <span>
                  Campus ID:{' '}
                  <strong className="font-mono text-(--text-secondary)">
                    {student?.student_id || 'ID Pending'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Synced{' '}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync'}
            </Button>
            <Link to="/student/wallet">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Wallet className="h-3.5 w-3.5" />
                Wallet & Top-up
              </Button>
            </Link>
            <Link to="/merchants">
              <Button size="sm" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Explore Businesses
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Financial Metric Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Wallet Liquidity */}
        <Link to="/student/wallet" className="group">
          <Card className="h-full transition-all duration-150 hover:border-(--accent-primary) group-hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-(--text-secondary)">
                Campus Wallet Balance
              </span>
              <div className="rounded-lg bg-(--accent-primary)/10 p-2 text-(--accent-primary)">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="font-mono text-2xl font-bold tracking-tight text-(--text)">
                ₦{walletBalance.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-(--text-tertiary)">
                <span>Available to deploy</span>
                <span className="flex items-center text-(--accent-primary) group-hover:underline">
                  Add Funds <PlusCircle className="ml-0.5 h-3 w-3" />
                </span>
              </div>
            </div>
          </Card>
        </Link>

        {/* Card 2: Total Invested */}
        <Card className="h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--text-secondary)">
              Total Capital Invested
            </span>
            <div className="rounded-lg bg-(--info)/10 p-2 text-(--info)">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-mono text-2xl font-bold tracking-tight text-(--text)">
              ₦{totalInvested.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-(--text-tertiary)">
              <span>Across {activeCount} businesses</span>
              <span className="font-mono text-(--info)">Cost Basis</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Portfolio Valuation */}
        <Link to="/student/portfolio" className="group">
          <Card className="h-full transition-all duration-150 hover:border-(--success) group-hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-(--text-secondary)">Current Valuation</span>
              <div className="rounded-lg bg-(--success)/10 p-2 text-(--success)">
                <PieChart className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="font-mono text-2xl font-bold tracking-tight text-(--text)">
                ₦{portfolioValuation.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-(--text-tertiary)">
                <span>Real-time NAV</span>
                <span className="font-semibold text-(--success)">
                  {Number(returnPercentage) >= 0 ? `+${returnPercentage}%` : `${returnPercentage}%`}
                </span>
              </div>
            </div>
          </Card>
        </Link>

        {/* Card 4: Annual Dividend Cycle */}
        <Card className="h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--text-secondary)">
              Annual Dividend Cycle
            </span>
            <div className="rounded-lg bg-(--warning)/10 p-2 text-(--warning)">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-mono text-xl font-bold tracking-tight text-(--text)">Jan 1, 2027</p>
            <div className="mt-2 flex items-center justify-between text-xs text-(--text-tertiary)">
              <span>Next Distribution</span>
              <span className="text-(--warning)">30% Net Profit Pool</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Annual Remodeling Notice Banner */}
      <div className="mt-6 rounded-xl border border-(--accent-primary)/20 bg-(--accent-primary)/5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-(--accent-primary) shrink-0" />
            <p className="text-sm text-(--text)">
              <strong className="font-semibold">Annual Dividend Schedule Active:</strong> Merchant
              distributions are pooled and paid out annually every <strong>January 1st</strong>,
              aligning with university academic calendars and seasonal retail accounting.
            </p>
          </div>
          <Link
            to="/student/portfolio"
            className="text-xs font-medium text-(--accent-primary) hover:underline whitespace-nowrap"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>

      {/* Active Holdings / Portfolio Table */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-(--text)">Your Active Business Stakes</h2>
            <p className="text-sm text-(--text-secondary)">
              Campus businesses in your equity portfolio.
            </p>
          </div>
          <Link to="/student/portfolio">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              Full Portfolio <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {investments.length === 0 ? (
          <Card className="mt-4 py-12 text-center">
            <Store className="mx-auto h-12 w-12 text-(--text-tertiary)" />
            <h3 className="mt-3 text-base font-semibold text-(--text)">
              No Active Investments Yet
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-(--text-secondary)">
              Put your wallet funds to work! Back verified student favorite cafes, print labs, and
              dining spots on campus to earn annual profit dividends.
            </p>
            <div className="mt-5">
              <Link to="/merchants">
                <Button size="sm" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Explore Campus Businesses
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {investments.map((inv) => {
              const currentVal = Number(inv.current_value || inv.amount);
              const investedAmt = Number(inv.amount);
              const gain = currentVal - investedAmt;
              const gainPct = investedAmt > 0 ? ((gain / investedAmt) * 100).toFixed(1) : '0.0';

              return (
                <Link key={inv.id} to={`/student/investments/${inv.id}`} className="group block">
                  <Card className="h-full border border-(--border) transition-all duration-150 hover:border-(--accent-primary) group-hover:shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--bg-tertiary) text-(--accent-primary) border border-(--border)">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-(--text) group-hover:text-(--accent-primary) transition-colors">
                            {inv.merchant?.business_name || 'Campus Business'}
                          </h3>
                          <span className="text-xs text-(--text-tertiary) capitalize">
                            {inv.merchant?.business_type || 'Retail'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="success" className="text-[10px]">
                        Active
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-(--bg-tertiary) p-3 border border-(--border)">
                      <div>
                        <p className="text-[11px] text-(--text-tertiary)">Shares Owned</p>
                        <p className="font-mono text-sm font-semibold text-(--text)">
                          {inv.shares} sh
                        </p>
                        <p className="text-[10px] text-(--text-secondary)">
                          @ ₦{inv.price_per_share}/sh
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-(--text-tertiary)">Holding Value</p>
                        <p className="font-mono text-sm font-bold text-(--text)">
                          ₦{currentVal.toLocaleString()}
                        </p>
                        <p
                          className={`font-mono text-[10px] font-medium ${gain >= 0 ? 'text-(--success)' : 'text-(--error)'}`}
                        >
                          {gain >= 0
                            ? `+₦${gain.toLocaleString()} (+${gainPct}%)`
                            : `-₦${Math.abs(gain).toLocaleString()} (${gainPct}%)`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-(--text-tertiary)">
                      <span>Invested: {new Date(inv.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center text-(--accent-primary) group-hover:underline">
                        Details <ArrowUpRight className="ml-0.5 h-3 w-3" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Dock */}
      <div className="mt-10 rounded-2xl border border-(--border) bg-(--bg-secondary) p-6">
        <h3 className="text-sm font-semibold text-(--text)">Student Investor Actions</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/student/wallet"
            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-tertiary) p-3.5 transition-colors hover:border-(--accent-primary)"
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="h-5 w-5 text-(--accent-primary)" />
              <div>
                <p className="text-sm font-medium text-(--text)">Top-Up Wallet</p>
                <p className="text-xs text-(--text-secondary)">
                  Instant deposit via card or transfer
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-(--text-tertiary)" />
          </Link>

          <Link
            to="/merchants"
            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-tertiary) p-3.5 transition-colors hover:border-(--accent-primary)"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-(--success)" />
              <div>
                <p className="text-sm font-medium text-(--text)">Discover Merchants</p>
                <p className="text-xs text-(--text-secondary)">Find vetted businesses to back</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-(--text-tertiary)" />
          </Link>

          <Link
            to="/student/portfolio"
            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-tertiary) p-3.5 transition-colors hover:border-(--accent-primary)"
          >
            <div className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-(--info)" />
              <div>
                <p className="text-sm font-medium text-(--text)">Full Portfolio</p>
                <p className="text-xs text-(--text-secondary)">
                  Equity distribution & share ledger
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-(--text-tertiary)" />
          </Link>

          <Link
            to="/student/withdraw"
            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-tertiary) p-3.5 transition-colors hover:border-(--accent-primary)"
          >
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-(--warning)" />
              <div>
                <p className="text-sm font-medium text-(--text)">Withdraw to Bank</p>
                <p className="text-xs text-(--text-secondary)">Transfer returns to your bank</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-(--text-tertiary)" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
