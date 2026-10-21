import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Wallet,
  TrendingUp,
  Users,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Calendar,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../stores/useAuthStore';
import { getKYCStatus } from '../../api/kyc';
import { getMerchantInvestments } from '../../api/investments';
import { getMerchantWalletInfo } from '../../api/merchant-wallet';
import { getRevenueSummary } from '../../api/revenue';
import type {
  Merchant,
  KYC,
  Investment,
  MerchantInvestmentSummary,
  MerchantWalletInfo,
  RevenueSummary,
} from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const statusConfig: Record<
  string,
  {
    variant: 'success' | 'error' | 'warning' | 'info' | 'default';
    icon: typeof CheckCircle;
    label: string;
  }
> = {
  not_started: { variant: 'default', icon: Upload, label: 'Not Started' },
  pending: { variant: 'warning', icon: Clock, label: 'Under Review' },
  approved: { variant: 'success', icon: CheckCircle, label: 'Approved & Verified' },
  rejected: { variant: 'error', icon: XCircle, label: 'Rejected' },
  resubmission_required: { variant: 'warning', icon: AlertCircle, label: 'Resubmission Required' },
};

const proximityLabels: Record<string, string> = {
  on_campus: 'On Campus Direct',
  within_1km: 'Within 1km of Campus',
  within_3km: 'Within 3km of Campus',
  beyond_3km: 'Greater Campus Vicinity',
};

const MerchantDashboard = () => {
  const { user } = useAuth();
  const merchant = user?.data as Merchant;
  const [kyc, setKyc] = useState<KYC | null>(null);
  const [walletInfo, setWalletInfo] = useState<MerchantWalletInfo | null>(null);
  const [investmentSummary, setInvestmentSummary] = useState<MerchantInvestmentSummary | null>(
    null
  );
  const [recentInvestments, setRecentInvestments] = useState<Investment[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'investors' | 'financials' | 'compliance'>(
    'investors'
  );

  const fetchData = useCallback(
    async (bypassCache = false) => {
      if (!user?.id) return;
      try {
        const [kycRes, walletRes, investRes, revenueRes] = await Promise.allSettled([
          getKYCStatus(),
          getMerchantWalletInfo({ bypassCache }),
          getMerchantInvestments(user.id, { limit: 20 }, { bypassCache }),
          getRevenueSummary(),
        ]);
        if (kycRes.status === 'fulfilled') setKyc(kycRes.value.data.data.kyc);
        if (walletRes.status === 'fulfilled') setWalletInfo(walletRes.value.data.data);
        if (investRes.status === 'fulfilled') {
          setInvestmentSummary(investRes.value.data.data.summary);
          setRecentInvestments(investRes.value.data.data.investments);
        }
        if (revenueRes.status === 'fulfilled') setRevenueSummary(revenueRes.value.data.data);
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    // Initial fetch always bypasses cache to guarantee immediate visibility of recent investments
    fetchData(true);
  }, [fetchData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  const kycStatus = kyc?.status || merchant?.kyc_status || 'not_started';
  const config = statusConfig[kycStatus] || statusConfig.not_started;
  const StatusIcon = config.icon;

  const totalRaised = Number(
    investmentSummary?.total_capital_raised ?? investmentSummary?.total_raised ?? 0
  );
  const totalInvestors = investmentSummary?.total_investors || recentInvestments.length;
  const activeInvestmentsCount = investmentSummary?.active_investments || recentInvestments.length;
  const totalSharesIssued =
    investmentSummary?.total_shares_issued ??
    recentInvestments.reduce((acc, inv) => acc + (Number(inv.shares) || 0), 0);
  const availableBalance = walletInfo?.balance ?? Number(merchant?.wallet_balance || 0);

  // Projected 30% Investor Dividend Pool calculation from approved annual profit
  const totalRevenue = revenueSummary?.total_revenue || 0;
  const annualDividendPool = Math.round(totalRevenue * 0.3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner / Merchant Brand Header */}
      <div className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-(--accent-primary)/10 text-(--accent-primary) ring-1 ring-(--accent-primary)/20">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-(--text) sm:text-3xl">
                  {merchant.business_name}
                </h1>
                <Badge variant="success" className="text-xs">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                  Verified Campus Merchant
                </Badge>
                <span className="rounded-full bg-(--bg-tertiary) px-2.5 py-0.5 text-xs font-medium text-(--text-secondary) border border-(--border)">
                  {proximityLabels[merchant.proximity_to_campus] || 'Campus Area'}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-(--text-secondary)">
                {merchant.business_description?.slice(0, 140) ||
                  'Campus retail and services partner powered by student micro-equity.'}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-(--text-tertiary)">
                <span>
                  Logged in as:{' '}
                  <strong className="text-(--text-secondary)">{merchant.email}</strong>
                </span>
                <span>•</span>
                <span>
                  Updated{' '}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync Data'}
            </Button>
            <Link to={`/merchants/${merchant.id}`}>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Public Storefront
              </Button>
            </Link>
            <Link to="/merchant/revenue">
              <Button size="sm" className="gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Submit Revenue
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Financial KPI Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Available Wallet Balance */}
        <Link to="/merchant/wallet" className="group">
          <Card className="h-full transition-all duration-150 hover:border-(--accent-primary) group-hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-(--text-secondary)">
                Available Vault Balance
              </span>
              <div className="rounded-lg bg-(--accent-primary)/10 p-2 text-(--accent-primary)">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="font-mono text-2xl font-bold tracking-tight text-(--text)">
                ₦{availableBalance.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-(--text-tertiary)">
                <span>Operational funds</span>
                <span className="flex items-center text-(--accent-primary) group-hover:underline">
                  Withdraw <ArrowUpRight className="ml-0.5 h-3 w-3" />
                </span>
              </div>
            </div>
          </Card>
        </Link>

        {/* Card 2: Micro-Equity Capital Raised */}
        <Card className="h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--text-secondary)">
              Student Micro-Equity Raised
            </span>
            <div className="rounded-lg bg-(--success)/10 p-2 text-(--success)">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-mono text-2xl font-bold tracking-tight text-(--text)">
              ₦{totalRaised.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-(--text-tertiary)">
              <span>{totalSharesIssued} shares allocated</span>
              <span className="font-medium text-(--success)">100% Backed</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Active Student Backers */}
        <Card className="h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--text-secondary)">
              Verified Student Backers
            </span>
            <div className="rounded-lg bg-(--warning)/10 p-2 text-(--warning)">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-mono text-2xl font-bold tracking-tight text-(--text)">
              {totalInvestors}{' '}
              <span className="text-sm font-normal text-(--text-secondary)">Students</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-(--text-tertiary)">
              <span>{activeInvestmentsCount} active positions</span>
              <span className="text-(--warning)">On-Campus Network</span>
            </div>
          </div>
        </Card>

        {/* Card 4: Annual Dividend Reserve Pool */}
        <Link to="/merchant/revenue" className="group">
          <Card className="h-full transition-all duration-150 hover:border-(--info) group-hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-(--text-secondary)">
                Investor Dividend Pool (30%)
              </span>
              <div className="rounded-lg bg-(--info)/10 p-2 text-(--info)">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="font-mono text-2xl font-bold tracking-tight text-(--text)">
                ₦{annualDividendPool.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-(--text-tertiary)">
                <span>Annual Cycle: Jan 1</span>
                <span className="text-(--info) group-hover:underline">View Ledger</span>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 border-b border-(--border)">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('investors')}
            className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'investors'
                ? 'border-(--accent-primary) text-(--accent-primary)'
                : 'border-transparent text-(--text-secondary) hover:text-(--text)'
            }`}
          >
            <Users className="h-4 w-4" />
            Student Investors & Cap Table
            <span className="ml-1 rounded-full bg-(--bg-tertiary) px-2 py-0.5 text-xs text-(--text-secondary) border border-(--border)">
              {recentInvestments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'financials'
                ? 'border-(--accent-primary) text-(--accent-primary)'
                : 'border-transparent text-(--text-secondary) hover:text-(--text)'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Annual Profit & Dividend Model
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'compliance'
                ? 'border-(--accent-primary) text-(--accent-primary)'
                : 'border-transparent text-(--text-secondary) hover:text-(--text)'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            KYC & Campus Accreditation
          </button>
        </nav>
      </div>

      {/* Tab 1: Live Student Cap Table & Recent Investments */}
      {activeTab === 'investors' && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-(--text)">Direct Student Equity Backers</h2>
              <p className="text-sm text-(--text-secondary)">
                Real-time cap table of students who purchased micro-equity shares in your business.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-(--text-secondary)">
              <span className="inline-block h-2 w-2 rounded-full bg-(--success) animate-pulse" />
              Live Ledger Synced
            </div>
          </div>

          {recentInvestments.length === 0 ? (
            <Card className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-(--text-tertiary)" />
              <h3 className="mt-3 text-base font-semibold text-(--text)">
                No Student Investments Yet
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-(--text-secondary)">
                When students discover and invest in your storefront, their equity allocations,
                share counts, and capital credits will appear here instantly.
              </p>
              <div className="mt-4">
                <Link to={`/merchants/${merchant.id}`}>
                  <Button variant="outline" size="sm">
                    Preview Your Public Storefront
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border border-(--border) bg-(--bg-secondary)">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-(--border) bg-(--bg-tertiary) text-xs font-semibold uppercase tracking-wider text-(--text-secondary)">
                    <tr>
                      <th className="px-6 py-3.5">Student Backer</th>
                      <th className="px-6 py-3.5">Program & Campus ID</th>
                      <th className="px-6 py-3.5">Shares Held</th>
                      <th className="px-6 py-3.5">Capital Backed</th>
                      <th className="px-6 py-3.5">Investment Date</th>
                      <th className="px-6 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {recentInvestments.map((inv) => {
                      const studentName = inv.student?.full_name || 'Student Investor';
                      const initials = studentName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={inv.id} className="transition-colors hover:bg-(--bg-tertiary)/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--accent-primary)/10 text-xs font-semibold text-(--accent-primary)">
                                {initials}
                              </div>
                              <div>
                                <p className="font-medium text-(--text)">{studentName}</p>
                                <p className="text-xs text-(--text-tertiary)">
                                  {inv.student_id
                                    ? `ID: ${inv.student_id.slice(0, 8)}...`
                                    : 'Verified Investor'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-(--text-secondary)">
                              {inv.student?.student_id || 'Campus Student'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm font-semibold text-(--text)">
                              {inv.shares} shares
                            </div>
                            <span className="text-xs text-(--text-tertiary)">
                              @ ₦{inv.price_per_share}/sh
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm font-bold text-(--success)">
                              +₦{Number(inv.amount).toLocaleString()}
                            </div>
                            <span className="text-xs text-(--text-tertiary)">
                              Direct Equity Credit
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-(--text-secondary)">
                            {new Date(inv.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Badge
                              variant={
                                inv.status === 'active'
                                  ? 'success'
                                  : inv.status === 'withdrawn'
                                    ? 'default'
                                    : 'warning'
                              }
                            >
                              {inv.status === 'active' ? 'Active Backer' : inv.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Annual Revenue & Dividend Distribution Breakdown */}
      {activeTab === 'financials' && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-(--accent-primary)/20 bg-(--accent-primary)/5 md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-(--accent-primary)/10 p-3 text-(--accent-primary)">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-(--text)">
                    Annual Profit Distribution Model (Remodeled 2026)
                  </h3>
                  <p className="mt-1 text-sm text-(--text-secondary)">
                    To maximize seasonal stability and campus academic cycles, investor returns are
                    distributed annually on <strong>January 1st</strong> rather than monthly.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl border border-(--border) bg-(--bg-secondary) p-3 text-center">
                    <div>
                      <p className="text-xs text-(--text-secondary)">Merchant Retained</p>
                      <p className="font-mono text-lg font-bold text-(--text)">65%</p>
                      <p className="text-[10px] text-(--text-tertiary)">Business Growth</p>
                    </div>
                    <div className="border-x border-(--border)">
                      <p className="text-xs text-(--text-secondary)">Student Backers Pool</p>
                      <p className="font-mono text-lg font-bold text-(--success)">30%</p>
                      <p className="text-[10px] text-(--text-tertiary)">Pro-rata Dividends</p>
                    </div>
                    <div>
                      <p className="text-xs text-(--text-secondary)">Platform Reserve</p>
                      <p className="font-mono text-lg font-bold text-(--text)">5%</p>
                      <p className="text-[10px] text-(--text-tertiary)">Network Escrow</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-(--text)">Fiscal Reporting Summary</h4>
                <div className="mt-4 space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-(--text-secondary)">Total Recorded Revenue:</span>
                    <span className="font-mono font-medium text-(--text)">
                      ₦{(revenueSummary?.total_revenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-(--text-secondary)">Pending Audit Reports:</span>
                    <span className="font-mono font-medium text-(--warning)">
                      {revenueSummary?.pending_count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-(--text-secondary)">Next Annual Payout:</span>
                    <span className="font-medium text-(--text)">January 1, 2027</span>
                  </div>
                </div>
              </div>
              <Link to="/merchant/revenue" className="mt-4 block">
                <Button variant="outline" size="sm" className="w-full">
                  Submit Audited Report
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: KYC & Campus Accreditation */}
      {activeTab === 'compliance' && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-(--bg-tertiary) p-3 text-(--accent-primary)">
                <StatusIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-(--text)">KYC & Business Registration</h3>
                <Badge variant={config.variant} className="mt-1.5">
                  {config.label}
                </Badge>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  {kycStatus === 'approved'
                    ? 'Your CAC documentation, bank accounts, and campus operating permits are fully audited.'
                    : 'Submit your business registration documents to activate live fundraising.'}
                </p>
                {(kycStatus === 'not_started' || kycStatus === 'resubmission_required') && (
                  <Link to="/merchant/kyc" className="mt-4 inline-block">
                    <Button size="sm">
                      {kycStatus === 'not_started' ? 'Begin Verification' : 'Resubmit Documents'}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-(--bg-tertiary) p-3 text-(--accent-primary)">
                <FileCheck className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-(--text)">Campus Proximity Accreditation</h3>
                <Badge variant="success" className="mt-1.5">
                  {proximityLabels[merchant.proximity_to_campus] || 'Campus Merchant'}
                </Badge>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  Operating Address: <strong>{merchant.business_address}</strong>
                </p>
                <p className="mt-1 text-xs text-(--text-tertiary)">
                  Phone: {merchant.business_phone} • Owner: {merchant.owner_full_name}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Action Dock */}
      <div className="mt-10 rounded-2xl border border-(--border) bg-(--bg-secondary) p-6">
        <h3 className="text-sm font-semibold text-(--text)">Quick Merchant Actions</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/merchant/wallet"
            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-tertiary) p-3.5 transition-colors hover:border-(--accent-primary)"
          >
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-(--accent-primary)" />
              <div>
                <p className="text-sm font-medium text-(--text)">Withdraw to Bank</p>
                <p className="text-xs text-(--text-secondary)">Transfer available vault balance</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-(--text-tertiary)" />
          </Link>

          <Link
            to="/merchant/revenue"
            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-tertiary) p-3.5 transition-colors hover:border-(--accent-primary)"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-(--success)" />
              <div>
                <p className="text-sm font-medium text-(--text)">File Revenue Report</p>
                <p className="text-xs text-(--text-secondary)">Record gross & net profit</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-(--text-tertiary)" />
          </Link>

          <Link
            to={`/merchants/${merchant.id}`}
            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-tertiary) p-3.5 transition-colors hover:border-(--accent-primary)"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 text-(--info)" />
              <div>
                <p className="text-sm font-medium text-(--text)">Storefront View</p>
                <p className="text-xs text-(--text-secondary)">How students see your business</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-(--text-tertiary)" />
          </Link>

          <Link
            to="/merchant/profile"
            className="flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-tertiary) p-3.5 transition-colors hover:border-(--accent-primary)"
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-(--warning)" />
              <div>
                <p className="text-sm font-medium text-(--text)">Business Settings</p>
                <p className="text-xs text-(--text-secondary)">Hours, catalog & contacts</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-(--text-tertiary)" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
