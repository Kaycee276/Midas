import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Clock,
  Store,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getInvestmentDetail, withdrawInvestment } from '../../api/investments';
import type { Investment } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const InvestmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const { data } = await getInvestmentDetail(id, { bypassCache: true });
        setInvestment(data.data.investment);
      } catch {
        toast.error('Investment not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleWithdraw = async () => {
    if (!id) return;
    setWithdrawing(true);
    try {
      const { data } = await withdrawInvestment(id);
      setInvestment(data.data.investment);
      toast.success('Investment withdrawn successfully');
      setShowModal(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Withdrawal failed';
      toast.error(msg);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-24" />;
  if (!investment)
    return <div className="py-24 text-center text-(--text-secondary)">Investment not found</div>;

  const currentVal = Number(investment.current_value || investment.amount);
  const investedAmt = Number(investment.amount);
  const gain = currentVal - investedAmt;
  const gainPct = investedAmt > 0 ? ((gain / investedAmt) * 100).toFixed(1) : '0.0';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        to="/student/portfolio"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text)"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Portfolio
      </Link>

      {/* Header Card */}
      <Card className="mt-4 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--bg-tertiary) text-(--accent-primary) border border-(--border)">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-(--text)">
                  {investment.merchant?.business_name || 'Campus Merchant'}
                </h1>
                <Badge
                  variant={
                    investment.status === 'active'
                      ? 'success'
                      : investment.status === 'withdrawn'
                        ? 'default'
                        : 'warning'
                  }
                  className="text-xs"
                >
                  {investment.status === 'active' ? 'Active Equity Stake' : investment.status}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-(--text-secondary) capitalize">
                {investment.merchant?.business_type || 'Retail'} &middot;{' '}
                {investment.merchant?.proximity_to_campus?.replace('_', ' ') || 'Campus Area'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {investment.merchant_id && (
              <Link to={`/merchants/${investment.merchant_id}`}>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <ExternalLink className="h-3 w-3" /> Storefront
                </Button>
              </Link>
            )}
            {investment.status === 'active' && (
              <Button variant="danger" size="sm" onClick={() => setShowModal(true)}>
                Exit Position
              </Button>
            )}
          </div>
        </div>

        {/* Stake Valuation Summary */}
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-(--border) bg-(--bg-tertiary) p-4">
          <div>
            <p className="text-xs text-(--text-secondary)">Holding NAV Value</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-(--text)">
              ₦{currentVal.toLocaleString()}
            </p>
            <p
              className={`mt-0.5 font-mono text-xs font-medium ${gain >= 0 ? 'text-(--success)' : 'text-(--error)'}`}
            >
              {gain >= 0
                ? `+₦${gain.toLocaleString()} (+${gainPct}%)`
                : `-₦${Math.abs(gain).toLocaleString()} (${gainPct}%)`}
            </p>
          </div>
          <div className="border-l border-(--border) pl-4">
            <p className="text-xs text-(--text-secondary)">Shares Allocated</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-(--text)">
              {investment.shares}{' '}
              <span className="text-xs font-normal text-(--text-secondary)">shares</span>
            </p>
            <p className="mt-0.5 font-mono text-xs text-(--text-secondary)">
              @ ₦{Number(investment.price_per_share)}/share
            </p>
          </div>
        </div>

        {/* Position Metadata */}
        <div className="mt-6 grid gap-4 border-t border-(--border) pt-6 sm:grid-cols-2 text-sm">
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-(--text-secondary)" />
            <div>
              <p className="text-xs text-(--text-secondary)">Cost Basis</p>
              <p className="font-mono font-medium text-(--text)">₦{investedAmt.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-(--text-secondary)" />
            <div>
              <p className="text-xs text-(--text-secondary)">Invested Date</p>
              <p className="font-medium text-(--text)">
                {new Date(investment.invested_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-(--text-secondary)" />
            <div>
              <p className="text-xs text-(--text-secondary)">Payout Schedule</p>
              <p className="font-medium text-(--text)">Annual (January 1st)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-(--text-secondary)" />
            <div>
              <p className="text-xs text-(--text-secondary)">Share Custody</p>
              <p className="font-medium text-(--text)">Verified Campus Ledger</p>
            </div>
          </div>
        </div>

        {investment.notes && (
          <div className="mt-6 rounded-lg border border-(--border) bg-(--bg-secondary) p-3 text-xs text-(--text-secondary)">
            <p className="font-medium text-(--text)">Investment Notes</p>
            <p className="mt-0.5">{investment.notes}</p>
          </div>
        )}
      </Card>

      {/* Exit Confirmation Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Withdraw Investment">
        <p className="text-sm text-(--text-secondary)">
          Are you sure you want to withdraw your equity position of{' '}
          <strong className="text-(--text)">₦{investedAmt.toLocaleString()}</strong> (
          {investment.shares} shares) from {investment.merchant?.business_name}?
        </p>
        <p className="mt-2 text-xs text-(--text-tertiary)">
          The funds will be credited back to your campus wallet immediately.
        </p>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={withdrawing} onClick={handleWithdraw}>
            Confirm Withdrawal
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default InvestmentDetail;
