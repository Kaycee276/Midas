import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  PieChart,
  Store,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  TrendingUp,
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  const totalInvested = Number(summary?.total_invested || 0);
  const portfolioValuation = Number(summary?.current_portfolio_value || totalInvested);
  const totalReturns = Number(summary?.total_returns || 0);
  const activeCount =
    summary?.active_investments ?? investments.filter((i) => i.status === 'active').length;

  const returnPct =
    totalInvested > 0
      ? (((portfolioValuation + totalReturns - totalInvested) / totalInvested) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Calm, Focused Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-(--text)">
              Welcome, {student?.full_name?.split(' ')[0] || 'Student'}
            </h1>
            <Badge variant="success" className="text-xs">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Verified Student
            </Badge>
          </div>
          <p className="mt-1 text-sm text-(--text-secondary)">
            {student?.university ? `${student.university}` : 'Campus Micro-Equity Portfolio'}
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
          <Link to="/student/wallet/fund">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Funds
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {/* Card 1: Wallet Balance */}
        <Card>
          <div className="flex items-center justify-between text-(--text-secondary)">
            <span className="text-xs font-medium uppercase tracking-wider">Wallet Balance</span>
            <Wallet className="h-4 w-4 text-(--accent-primary)" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-(--text)">
            ₦{walletBalance.toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-(--text-tertiary)">
            <Link
              to="/student/wallet"
              className="font-medium text-(--accent-primary) hover:underline"
            >
              Manage wallet &rarr;
            </Link>
          </div>
        </Card>

        {/* Card 2: Portfolio Value */}
        <Card>
          <div className="flex items-center justify-between text-(--text-secondary)">
            <span className="text-xs font-medium uppercase tracking-wider">Portfolio Value</span>
            <PieChart className="h-4 w-4 text-(--success)" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-(--text)">
            ₦{portfolioValuation.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-medium text-(--success)">
              {Number(returnPct) >= 0 ? `+${returnPct}%` : `${returnPct}%`} overall return
            </span>
            <Link to="/student/roi" className="font-medium text-(--accent-primary) hover:underline">
              ROI analytics &rarr;
            </Link>
          </div>
        </Card>

        {/* Card 3: Active Holdings */}
        <Card>
          <div className="flex items-center justify-between text-(--text-secondary)">
            <span className="text-xs font-medium uppercase tracking-wider">Active Stakes</span>
            <Store className="h-4 w-4 text-(--warning)" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-(--text)">
            {activeCount}
          </p>
          <p className="mt-2 text-xs text-(--text-tertiary)">Backed campus businesses</p>
        </Card>
      </div>

      {/* Active Investments Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-(--text)">Your Investments</h2>
          <Link
            to="/student/portfolio"
            className="text-xs font-medium text-(--accent-primary) hover:underline"
          >
            View all &rarr;
          </Link>
        </div>

        {investments.length === 0 ? (
          <Card className="mt-4 py-12 text-center">
            <Store className="mx-auto h-10 w-10 text-(--text-tertiary)" />
            <h3 className="mt-3 text-sm font-semibold text-(--text)">No investments yet</h3>
            <p className="mt-1 text-xs text-(--text-secondary)">
              Discover verified campus businesses and back them with micro-equity.
            </p>
            <div className="mt-4">
              <Link to="/merchants">
                <Button size="sm" className="gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Browse Merchants
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {investments.map((inv) => {
              const currentVal = Number(inv.current_value || inv.amount);
              const investedAmt = Number(inv.amount);
              const gain = currentVal - investedAmt;
              const gainPct = investedAmt > 0 ? ((gain / investedAmt) * 100).toFixed(1) : '0.0';

              return (
                <Link key={inv.id} to={`/student/investments/${inv.id}`} className="group block">
                  <Card className="flex items-center justify-between p-4 transition-all duration-150 hover:border-(--accent-primary)">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--bg-tertiary) text-(--accent-primary) border border-(--border)">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-(--text) group-hover:text-(--accent-primary) transition-colors">
                          {inv.merchant?.business_name || 'Campus Business'}
                        </p>
                        <p className="text-xs text-(--text-secondary)">
                          {inv.shares} shares &middot; ₦{Number(inv.price_per_share)}/sh
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-semibold text-(--text)">
                        ₦{currentVal.toLocaleString()}
                      </p>
                      <p
                        className={`font-mono text-xs ${gain >= 0 ? 'text-(--success)' : 'text-(--error)'}`}
                      >
                        {gain >= 0 ? `+${gainPct}%` : `${gainPct}%`}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Clean Quick Access Links */}
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <Link
          to="/merchants"
          className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-secondary) p-4 transition-colors hover:border-(--accent-primary)"
        >
          <div>
            <p className="text-sm font-medium text-(--text)">Explore Merchants</p>
            <p className="text-xs text-(--text-tertiary)">Find campus shops to back</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-(--text-tertiary)" />
        </Link>

        <Link
          to="/student/portfolio"
          className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-secondary) p-4 transition-colors hover:border-(--accent-primary)"
        >
          <div>
            <p className="text-sm font-medium text-(--text)">Full Portfolio</p>
            <p className="text-xs text-(--text-tertiary)">Transaction and returns history</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-(--text-tertiary)" />
        </Link>

        <Link
          to="/student/withdraw"
          className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-secondary) p-4 transition-colors hover:border-(--accent-primary)"
        >
          <div>
            <p className="text-sm font-medium text-(--text)">Bank Payout</p>
            <p className="text-xs text-(--text-tertiary)">Withdraw funds to your account</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-(--text-tertiary)" />
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
