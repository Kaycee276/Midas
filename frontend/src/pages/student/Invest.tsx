import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMerchant } from '../../api/public';
import { createInvestment } from '../../api/investments';
import { getWalletInfo } from '../../api/wallet';
import type { Merchant } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

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
          getWalletInfo(),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value < 10) {
      toast.error('Minimum investment is \u20A610');
      return;
    }
    if (value > balance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setSubmitting(true);
    try {
      await createInvestment({
        merchant_id: merchantId!,
        amount: value,
        notes: notes || undefined,
      });
      toast.success('Investment created successfully!');
      navigate('/student/portfolio');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Investment failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!merchant) return <div className="py-20 text-center text-[var(--text-secondary)]">Merchant not found</div>;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link to={`/merchants/${merchantId}`} className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text)]">
        <ArrowLeft className="h-4 w-4" /> Back to {merchant.business_name}
      </Link>

      <h1 className="text-2xl font-bold text-[var(--text)]">Invest in {merchant.business_name}</h1>

      <Card className="mt-4 flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">Wallet Balance</span>
        <span className="font-semibold text-[var(--text)]">{'\u20A6'}{balance.toLocaleString()}</span>
      </Card>

      <Card className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Investment Amount (\u20A6)"
            type="number"
            min={10}
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label htmlFor="notes" className="block text-sm font-medium text-[var(--text-secondary)]">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text)] placeholder-[var(--text-tertiary)] transition-colors focus:border-[var(--accent-primary)] focus:outline-none"
              rows={3}
              placeholder="Any notes about your investment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {parseFloat(amount) > balance && (
            <p className="text-sm text-[var(--error)]">
              Insufficient balance.{' '}
              <Link to="/student/wallet/fund" className="underline">Fund your wallet</Link>
            </p>
          )}

          <Button
            type="submit"
            loading={submitting}
            disabled={!amount || parseFloat(amount) > balance}
            className="w-full"
          >
            Invest {'\u20A6'}{parseFloat(amount || '0').toLocaleString()}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Invest;
