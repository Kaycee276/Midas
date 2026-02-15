import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, ArrowLeft, TrendingUp, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMerchant } from '../../api/public';
import { getMerchantInvestments } from '../../api/investments';
import type { Merchant, MerchantInvestmentSummary } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useAuth } from '../../stores/useAuthStore';

const proximityLabels: Record<string, string> = {
  on_campus: 'On Campus', within_1km: 'Within 1km', within_2km: 'Within 2km',
  within_5km: 'Within 5km', more_than_5km: 'More than 5km',
};

const MerchantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [summary, setSummary] = useState<MerchantInvestmentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [mRes, iRes] = await Promise.all([
          getMerchant(id),
          getMerchantInvestments(id).catch(() => null),
        ]);
        setMerchant(mRes.data.data.merchant);
        if (iRes) setSummary(iRes.data.data.summary);
      } catch {
        toast.error('Merchant not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!merchant) return <div className="py-20 text-center text-[var(--text-secondary)]">Merchant not found</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/merchants" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">
        <ArrowLeft className="h-4 w-4" /> Back to Merchants
      </Link>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">{merchant.business_name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Badge>{merchant.business_type.replace(/_/g, ' ')}</Badge>
              <span className="flex items-center gap-1 text-sm text-[var(--text-tertiary)]">
                <MapPin className="h-3 w-3" /> {proximityLabels[merchant.proximity_to_campus] || merchant.proximity_to_campus}
              </span>
            </div>
          </div>
          {user?.role === 'student' && (
            <Link to={`/student/invest/${merchant.id}`}>
              <Button><TrendingUp className="h-4 w-4" /> Invest</Button>
            </Link>
          )}
        </div>
        <p className="mt-4 text-[var(--text-secondary)]">{merchant.business_description}</p>
        <div className="mt-4 space-y-1 text-sm text-[var(--text-secondary)]">
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {merchant.business_address}</p>
          <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {merchant.business_phone}</p>
        </div>
      </Card>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-[var(--accent-primary)]" />
              <div>
                <p className="text-2xl font-bold text-[var(--text)]">{summary.total_investors}</p>
                <p className="text-sm text-[var(--text-secondary)]">Investors</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-[var(--success)]" />
              <div>
                <p className="text-2xl font-bold text-[var(--text)]">${summary.total_capital_raised.toLocaleString()}</p>
                <p className="text-sm text-[var(--text-secondary)]">Capital Raised</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-[var(--info)]" />
              <div>
                <p className="text-2xl font-bold text-[var(--text)]">{summary.active_investments}</p>
                <p className="text-sm text-[var(--text-secondary)]">Active Investments</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MerchantDetail;
