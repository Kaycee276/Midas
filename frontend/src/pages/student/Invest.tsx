import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Store, ShieldCheck, TrendingUp, Wallet, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMerchant } from '../../api/public';
import { createInvestment } from '../../api/investments';
import { getWalletInfo } from '../../api/wallet';
import type { Merchant } from '../../types';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const quickPills = [2000, 5000, 10000, 25000, 50000];

const Invest = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!merchantId) return;
    const fetch = async () => {
      try {
        const [mRes, wRes] = await Promise.all([
          getMerchant(merchantId),
          getWalletInfo({ bypassCache: true }),
        ]);
        setMerchant(mRes.data.data.merchant);
        setBalance(wRes.data.data.balance);
      } catch {
        toast.error('Failed to load merchant');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [merchantId]);

  const numAmount = parseFloat(amount) || 0;
  const estimatedShares = Math.floor(numAmount / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount < 10) {
      toast.error('Minimum investment is ₦10');
      return;
    }
    if (numAmount > balance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setSubmitting(true);
    try {
      await createInvestment({
        merchant_id: merchantId!,
        amount: numAmount,
        notes: notes || undefined,
      });
      toast.success('Investment backed successfully!');
      navigate('/student/portfolio');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Investment failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-24" />;
  if (!merchant)
    return <div className="py-24 text-center text-(--text-secondary)">Merchant not found</div>;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <Link
        to={`/merchants/${merchantId}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text)"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {merchant.business_name}
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--bg-tertiary) text-(--accent-primary) border border-(--border)">
          <Store className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-(--text)">
            Back {merchant.business_name}
          </h1>
          <p className="text-xs text-(--text-secondary) capitalize">
            {merchant.business_type} &middot; Verified Campus Merchant
          </p>
        </div>
      </div>

      {/* Wallet Balance Bar */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-(--border) bg-(--bg-secondary) p-4">
        <div className="flex items-center gap-2 text-xs text-(--text-secondary)">
          <Wallet className="h-4 w-4 text-(--accent-primary)" />
          <span>Available Wallet Balance</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-bold text-(--text)">
            ₦{balance.toLocaleString()}
          </span>
          <Link
            to="/student/wallet/fund"
            className="flex items-center text-xs font-medium text-(--accent-primary) hover:underline"
          >
            <Plus className="h-3 w-3 mr-0.5" /> Top Up
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <Input
            label="Investment Amount (₦)"
            type="number"
            min={100}
            step="any"
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          {/* Preset chips */}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {quickPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setAmount(String(pill))}
                className={`rounded-lg border px-3 py-1 font-mono text-xs font-medium transition-colors ${
                  amount === String(pill)
                    ? 'border-(--accent-primary) bg-(--accent-primary)/10 text-(--accent-primary)'
                    : 'border-(--border) bg-(--bg-secondary) text-(--text-secondary) hover:border-(--accent-primary) hover:text-(--text)'
                }`}
              >
                ₦{pill.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Share calculation preview */}
        {numAmount > 0 && (
          <div className="rounded-xl border border-(--border) bg-(--bg-tertiary) p-3.5 flex items-center justify-between text-xs">
            <span className="text-(--text-secondary)">Equity Shares to Receive:</span>
            <span className="font-mono font-semibold text-(--text)">
              ~{estimatedShares} shares (@ ₦100/share)
            </span>
          </div>
        )}

        <Textarea
          label="Personal Notes (optional)"
          id="notes"
          rows={2}
          placeholder="e.g. Cafe expansion micro-equity"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {numAmount > balance && (
          <p className="text-xs text-(--error)">
            Insufficient wallet balance. Please{' '}
            <Link to="/student/wallet/fund" className="underline font-medium">
              top up your wallet
            </Link>{' '}
            to proceed.
          </p>
        )}

        <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-3.5 text-xs text-(--text-secondary) flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-(--success) shrink-0 mt-0.5" />
          <p>
            <strong>Annual Profit Dividends:</strong> 30% of audited net profits are distributed to
            backer wallets each year on January 1st pro-rata with shares held.
          </p>
        </div>

        <Button
          type="submit"
          loading={submitting}
          disabled={!amount || numAmount < 10 || numAmount > balance}
          className="w-full gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Confirm Investment of ₦{numAmount.toLocaleString()}
        </Button>
      </form>
    </div>
  );
};

export default Invest;
