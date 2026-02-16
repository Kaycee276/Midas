import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, AlertCircle, Clock, CheckCircle, XCircle, Upload, Wallet, TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';
import { useAuth } from '../../stores/useAuthStore';
import { getKYCStatus } from '../../api/kyc';
import { getMerchantInvestments } from '../../api/investments';
import { getMerchantWalletInfo } from '../../api/merchant-wallet';
import { getRevenueSummary } from '../../api/revenue';
import type { Merchant, KYC, Investment, MerchantInvestmentSummary, MerchantWalletInfo, RevenueSummary } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const statusConfig: Record<string, { variant: 'success' | 'error' | 'warning' | 'info' | 'default'; icon: typeof CheckCircle; label: string }> = {
  not_started: { variant: 'default', icon: Upload, label: 'Not Started' },
  pending: { variant: 'warning', icon: Clock, label: 'Under Review' },
  approved: { variant: 'success', icon: CheckCircle, label: 'Approved' },
  rejected: { variant: 'error', icon: XCircle, label: 'Rejected' },
  resubmission_required: { variant: 'warning', icon: AlertCircle, label: 'Resubmission Required' },
};

const MerchantDashboard = () => {
  const { user } = useAuth();
  const merchant = user?.data as Merchant;
  const [kyc, setKyc] = useState<KYC | null>(null);
  const [walletInfo, setWalletInfo] = useState<MerchantWalletInfo | null>(null);
  const [investmentSummary, setInvestmentSummary] = useState<MerchantInvestmentSummary | null>(null);
  const [recentInvestments, setRecentInvestments] = useState<Investment[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kycRes, walletRes, investRes, revenueRes] = await Promise.allSettled([
          getKYCStatus(),
          getMerchantWalletInfo(),
          getMerchantInvestments(user!.id, { limit: 5 }),
          getRevenueSummary(),
        ]);
        if (kycRes.status === 'fulfilled') setKyc(kycRes.value.data.data.kyc);
        if (walletRes.status === 'fulfilled') setWalletInfo(walletRes.value.data.data);
        if (investRes.status === 'fulfilled') {
          setInvestmentSummary(investRes.value.data.data.summary);
          setRecentInvestments(investRes.value.data.data.investments);
        }
        if (revenueRes.status === 'fulfilled') setRevenueSummary(revenueRes.value.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Spinner size="lg" className="py-20" />;

  const kycStatus = kyc?.status || 'not_started';
  const config = statusConfig[kycStatus] || statusConfig.not_started;
  const StatusIcon = config.icon;

  const stats = [
    {
      icon: Wallet,
      label: 'Wallet Balance',
      value: `\u20A6${(walletInfo?.balance || 0).toLocaleString()}`,
      color: 'text-(--accent-primary)',
      link: '/merchant/wallet',
    },
    {
      icon: TrendingUp,
      label: 'Total Capital Raised',
      value: `\u20A6${(investmentSummary?.total_capital_raised || 0).toLocaleString()}`,
      color: 'text-(--success)',
    },
    {
      icon: Activity,
      label: 'Active Investments',
      value: String(investmentSummary?.active_investments || 0),
      color: 'text-(--info)',
    },
    {
      icon: Users,
      label: 'Total Investors',
      value: String(investmentSummary?.total_investors || 0),
      color: 'text-(--warning)',
    },
    {
      icon: BarChart3,
      label: 'Total Revenue',
      value: `\u20A6${(revenueSummary?.total_revenue || 0).toLocaleString()}`,
      color: 'text-(--success)',
      link: '/merchant/revenue',
    },
    {
      icon: Clock,
      label: 'Pending Reports',
      value: String(revenueSummary?.pending_count || 0),
      color: 'text-(--warning)',
      link: '/merchant/revenue',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-(--text)">Welcome, {merchant.business_name}</h1>
      <p className="mt-1 text-(--text-secondary)">Your business overview</p>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const content = (
            <Card key={s.label}>
              <div className="flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-(--text)">{s.value}</p>
                  <p className="text-xs text-(--text-secondary)">{s.label}</p>
                </div>
              </div>
            </Card>
          );
          return s.link ? (
            <Link key={s.label} to={s.link}>{content}</Link>
          ) : (
            <div key={s.label}>{content}</div>
          );
        })}
      </div>

      {/* KYC + Account Status */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* KYC Status */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-(--bg-tertiary) p-3">
              <StatusIcon className="h-6 w-6 text-(--accent-primary)" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-(--text)">KYC Verification</h3>
              <Badge variant={config.variant} className="mt-1">{config.label}</Badge>
              {kycStatus === 'rejected' && kyc?.rejection_reason && (
                <p className="mt-2 text-sm text-(--error)">{kyc.rejection_reason}</p>
              )}
              {kycStatus === 'resubmission_required' && kyc?.rejection_reason && (
                <p className="mt-2 text-sm text-(--warning)">{kyc.rejection_reason}</p>
              )}
              {(kycStatus === 'not_started' || kycStatus === 'rejected' || kycStatus === 'resubmission_required') && (
                <Link to="/merchant/kyc" className="mt-3 block">
                  <Button size="sm">{kycStatus === 'not_started' ? 'Start KYC' : 'Resubmit KYC'}</Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        {/* Account Status */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-(--bg-tertiary) p-3">
              <FileCheck className="h-6 w-6 text-(--accent-primary)" />
            </div>
            <div>
              <h3 className="font-semibold text-(--text)">Account Status</h3>
              <Badge variant={merchant.account_status === 'active' ? 'success' : 'warning'} className="mt-1">
                {merchant.account_status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
              <p className="mt-2 text-sm text-(--text-secondary)">
                {merchant.account_status === 'active'
                  ? 'Your business is live and accepting investments.'
                  : 'Complete KYC verification to activate your account.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Investments */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-(--text)">Recent Investments</h2>
        {recentInvestments.length === 0 ? (
          <Card className="mt-4 text-center">
            <p className="text-(--text-secondary)">No investments yet. Investments will appear here when students invest in your business.</p>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {recentInvestments.map((inv) => (
              <Card key={inv.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-(--text)">{inv.student?.full_name || 'Student'}</p>
                  <p className="text-sm text-(--text-secondary)">
                    {inv.shares} shares &middot; {new Date(inv.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-(--success)">
                    +{'\u20A6'}{inv.amount.toLocaleString()}
                  </p>
                  <Badge variant={inv.status === 'active' ? 'success' : inv.status === 'withdrawn' ? 'default' : 'warning'}>
                    {inv.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;
