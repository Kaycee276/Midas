import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  Users,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../stores/useAuthStore';
import { getMerchantInvestments } from '../../api/investments';
import { getMerchantWalletInfo } from '../../api/merchant-wallet';
import type { Merchant, Investment, MerchantWalletInfo } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const MerchantDashboard = () => {
  const { user } = useAuth();
  const merchant = user?.data as Merchant;
  const [walletInfo, setWalletInfo] = useState<MerchantWalletInfo | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [totalRaised, setTotalRaised] = useState<number>(0);
  const [investorCount, setInvestorCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(
    async (bypassCache = false) => {
      if (!user?.id) return;
      try {
        const [walletRes, investRes] = await Promise.allSettled([
          getMerchantWalletInfo({ bypassCache }),
          getMerchantInvestments(user.id, { limit: 10 }, { bypassCache }),
        ]);

        if (walletRes.status === 'fulfilled') {
          setWalletInfo(walletRes.value.data.data);
        }
        if (investRes.status === 'fulfilled') {
          const invData = investRes.value.data.data;
          setInvestments(invData.investments);
          setTotalRaised(
            Number(invData.summary?.total_capital_raised ?? invData.summary?.total_raised ?? 0)
          );
          setInvestorCount(invData.summary?.total_investors || invData.investments.length);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  const balance = walletInfo?.balance ?? Number(merchant?.wallet_balance || 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Calm, Focused Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-(--text)">
              {merchant.business_name}
            </h1>
            <Badge variant="success" className="text-xs">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          </div>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Overview of your campus micro-equity and student backers.
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
          <Link to="/merchant/wallet/withdraw">
            <Button size="sm" className="gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Withdraw
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Core Metric Cards (Spacious, Uncluttered) */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {/* Card 1: Vault Balance */}
        <Card>
          <div className="flex items-center justify-between text-(--text-secondary)">
            <span className="text-xs font-medium uppercase tracking-wider">Vault Balance</span>
            <Wallet className="h-4 w-4 text-(--accent-primary)" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-(--text)">
            ₦{balance.toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-(--text-tertiary)">
            <Link
              to="/merchant/wallet"
              className="font-medium text-(--accent-primary) hover:underline"
            >
              View ledger &rarr;
            </Link>
          </div>
        </Card>

        {/* Card 2: Total Raised */}
        <Card>
          <div className="flex items-center justify-between text-(--text-secondary)">
            <span className="text-xs font-medium uppercase tracking-wider">Capital Raised</span>
            <TrendingUp className="h-4 w-4 text-(--success)" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-(--text)">
            ₦{totalRaised.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-(--text-tertiary)">Active equity funded by students</p>
        </Card>

        {/* Card 3: Student Backers */}
        <Card>
          <div className="flex items-center justify-between text-(--text-secondary)">
            <span className="text-xs font-medium uppercase tracking-wider">Student Backers</span>
            <Users className="h-4 w-4 text-(--warning)" />
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-(--text)">
            {investorCount}
          </p>
          <p className="mt-2 text-xs text-(--text-tertiary)">Verified campus investors</p>
        </Card>
      </div>

      {/* Recent Student Backers Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-(--text)">Recent Student Backers</h2>
          <span className="text-xs text-(--text-secondary)">
            {investments.length} {investments.length === 1 ? 'investment' : 'investments'}
          </span>
        </div>

        {investments.length === 0 ? (
          <Card className="mt-4 py-12 text-center">
            <Users className="mx-auto h-10 w-10 text-(--text-tertiary)" />
            <h3 className="mt-3 text-sm font-semibold text-(--text)">No student backers yet</h3>
            <p className="mt-1 text-xs text-(--text-secondary)">
              When students invest in your business, they will appear here.
            </p>
            <div className="mt-4">
              <Link to={`/merchants/${merchant.id}`}>
                <Button variant="outline" size="sm">
                  Preview Public Storefront
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-(--border) bg-(--bg-secondary)">
            <div className="divide-y divide-(--border)">
              {investments.map((inv) => {
                const name = inv.student?.full_name || 'Student Investor';
                const initials = name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-(--bg-tertiary)/40"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent-primary)/10 text-xs font-semibold text-(--accent-primary)">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-(--text)">{name}</p>
                        <p className="text-xs text-(--text-secondary)">
                          {inv.student?.student_id || 'Campus Student'} &middot; {inv.shares} shares
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-semibold text-(--success)">
                        +₦{Number(inv.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-(--text-tertiary)">
                        {new Date(inv.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Clean Quick Access Links */}
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <Link
          to="/merchant/revenue"
          className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-secondary) p-4 transition-colors hover:border-(--accent-primary)"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="h-4 w-4 text-(--text-secondary)" />
            <div>
              <p className="text-sm font-medium text-(--text)">Annual Revenue</p>
              <p className="text-xs text-(--text-tertiary)">Submit fiscal reports</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-(--text-tertiary)" />
        </Link>

        <Link
          to={`/merchants/${merchant.id}`}
          className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-secondary) p-4 transition-colors hover:border-(--accent-primary)"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="h-4 w-4 text-(--text-secondary)" />
            <div>
              <p className="text-sm font-medium text-(--text)">Public Storefront</p>
              <p className="text-xs text-(--text-tertiary)">View student listing</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-(--text-tertiary)" />
        </Link>

        <Link
          to="/merchant/profile"
          className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-secondary) p-4 transition-colors hover:border-(--accent-primary)"
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-(--text-secondary)" />
            <div>
              <p className="text-sm font-medium text-(--text)">Store Settings</p>
              <p className="text-xs text-(--text-tertiary)">Hours & contact info</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-(--text-tertiary)" />
        </Link>
      </div>
    </div>
  );
};

export default MerchantDashboard;
