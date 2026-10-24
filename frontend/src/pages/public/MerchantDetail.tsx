import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Store,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMerchant } from '../../api/public';
import { getMerchantInvestments } from '../../api/investments';
import { getCacheKey, getFromCache } from '../../api/cache';
import type { ApiResponse, Merchant, MerchantInvestmentSummary } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useAuth } from '../../stores/useAuthStore';

const proximityLabels: Record<string, string> = {
  on_campus: 'Directly On Campus',
  within_1km: 'Within 1km of Campus Gate',
  within_2km: 'Within 2km of Campus',
  within_5km: 'Within 5km of Campus',
  more_than_5km: 'Campus Vicinity (>5km)',
};

const MerchantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Instant hydration from cache for 0ms initial render
  const [merchant, setMerchant] = useState<Merchant | null>(() => {
    if (!id) return null;
    const cached = getFromCache<ApiResponse<{ merchant: Merchant }>>(
      getCacheKey(`/public/merchants/${id}`)
    );
    return cached?.data?.merchant || null;
  });
  const [summary, setSummary] = useState<MerchantInvestmentSummary | null>(() => {
    if (!id) return null;
    const cached = getFromCache<ApiResponse<{ summary: MerchantInvestmentSummary }>>(
      getCacheKey(`/investments/merchants/${id}`)
    );
    return cached?.data?.summary || null;
  });
  const [loading, setLoading] = useState(() => !merchant);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      if (!merchant) {
        setLoading(true);
      }
      try {
        const [mRes, iRes] = await Promise.all([
          getMerchant(id),
          getMerchantInvestments(id).catch(() => null),
        ]);
        setMerchant(mRes.data.data.merchant);
        if (iRes) setSummary(iRes.data.data.summary);
      } catch {
        if (!merchant) {
          toast.error('Merchant not found');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, merchant]);

  if (loading) return <Spinner size="lg" className="py-24" />;
  if (!merchant)
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <Store className="mx-auto h-12 w-12 text-(--text-tertiary)" />
        <h2 className="mt-3 text-base font-semibold text-(--text)">Merchant not found</h2>
        <p className="mt-1 text-xs text-(--text-secondary)">
          The campus merchant storefront you are looking for may have been delisted or relocated.
        </p>
        <Link to="/merchants" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            ← Browse Marketplace
          </Button>
        </Link>
      </div>
    );

  const capitalRaised = Number(summary?.total_capital_raised ?? summary?.total_raised ?? 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        to="/merchants"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text) transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Marketplace
      </Link>

      {/* Main Storefront Hero Card */}
      <Card className="mt-4 p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-(--border) bg-(--bg-tertiary) text-(--accent-primary)">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-(--text)">
                  {merchant.business_name}
                </h1>
                <Badge variant="success" className="text-xs">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Verified Merchant
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-(--text-tertiary)">
                <span className="capitalize font-medium text-(--text-secondary)">
                  {(merchant.business_type || 'merchant').replace(/_/g, ' ')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-(--accent-primary)" />
                  {proximityLabels[merchant.proximity_to_campus] || merchant.proximity_to_campus}
                </span>
              </div>
            </div>
          </div>

          {user?.role === 'student' && (
            <Link to={`/student/invest/${merchant.id}`}>
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                <TrendingUp className="h-4 w-4" /> Invest in Micro-Shares
              </Button>
            </Link>
          )}
        </div>

        {/* Description */}
        <div className="mt-6 border-t border-(--border) pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-(--text-tertiary)">
            About the Venture
          </h2>
          <p className="mt-2 text-sm text-(--text-secondary) leading-relaxed">
            {merchant.business_description ||
              'This verified campus merchant is registered on the Midas protocol, offering micro-equity opportunities and participating in annual dividend profit distribution.'}
          </p>
        </div>

        {/* Operating Meta */}
        <div className="mt-6 grid gap-4 border-t border-(--border) pt-6 sm:grid-cols-2 text-xs">
          <div className="flex items-start gap-2.5 text-(--text-secondary)">
            <Building2 className="h-4 w-4 text-(--text-tertiary) shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-(--text)">Storefront Address</span>
              <p className="mt-0.5 text-(--text-tertiary)">{merchant.business_address}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-(--text-secondary)">
            <Phone className="h-4 w-4 text-(--text-tertiary) shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-(--text)">Direct Inquiries</span>
              <p className="mt-0.5 text-(--text-tertiary)">{merchant.business_phone}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Financial & Performance Highlights */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary) mb-3">
          Performance & Backing Metrics
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center justify-between text-(--text-secondary)">
              <span className="text-xs font-medium uppercase tracking-wider">Total Backers</span>
              <Users className="h-4 w-4 text-(--accent-primary)" />
            </div>
            <p className="mt-3 font-mono text-2xl sm:text-3xl font-bold tracking-tight text-(--text)">
              {summary?.total_investors || 0}
            </p>
            <p className="mt-1 text-xs text-(--text-tertiary)">Student shareholders</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-(--text-secondary)">
              <span className="text-xs font-medium uppercase tracking-wider">Capital Funded</span>
              <DollarSign className="h-4 w-4 text-(--success)" />
            </div>
            <p className="mt-3 font-mono text-2xl sm:text-3xl font-bold tracking-tight text-(--text)">
              ₦{capitalRaised.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-(--text-tertiary)">Total debt-free micro-equity</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-(--text-secondary)">
              <span className="text-xs font-medium uppercase tracking-wider">Profit Pool</span>
              <Calendar className="h-4 w-4 text-(--warning)" />
            </div>
            <p className="mt-3 font-mono text-2xl sm:text-3xl font-bold tracking-tight text-(--text)">
              30%
            </p>
            <p className="mt-1 text-xs text-(--text-tertiary)">Annual Jan 1 investor pool</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MerchantDetail;
