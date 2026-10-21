import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMerchantWalletInfo, merchantWithdraw } from '../../api/merchant-wallet';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const MerchantWithdraw = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const bankName = 'Zenith Bank';
  const accountNumber = '1012345678';
  const accountName = 'Business Operating Account';
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await getMerchantWalletInfo({ bypassCache: true });
        setBalance(data.data.balance);
      } catch {
        toast.error('Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const handlePercentage = (pct: number) => {
    const val = Math.floor(balance * pct);
    setAmount(val > 0 ? String(val) : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value < 100) {
      toast.error('Minimum withdrawal is ₦100');
      return;
    }
    if (value > balance) {
      toast.error('Insufficient vault balance');
      return;
    }

    setSubmitting(true);
    try {
      await merchantWithdraw(value);
      setSuccess(true);
      toast.success('Withdrawal processed successfully');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Withdrawal failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card className="p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-(--success)" />
          <h2 className="mt-4 text-xl font-semibold text-(--text)">Withdrawal Initiated</h2>
          <p className="mt-2 text-sm text-(--text-secondary)">
            <strong className="font-mono text-(--text)">
              ₦{parseFloat(amount).toLocaleString()}
            </strong>{' '}
            is being transferred to your verified bank account ({bankName} ••••
            {accountNumber.slice(-4)}).
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => navigate('/merchant/wallet')}>Back to Vault</Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setAmount('');
              }}
            >
              Withdraw Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <Link
        to="/merchant/wallet"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text)"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Vault
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-(--text)">Withdraw Funds</h1>
      <p className="mt-1 text-sm text-(--text-secondary)">
        Transfer available revenue directly to your Nigerian commercial bank account.
      </p>

      {/* Available Balance Pill */}
      <div className="mt-6 rounded-xl border border-(--border) bg-(--bg-secondary) p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-(--text-secondary)">Available for Withdrawal</span>
          <span className="font-mono text-base font-bold text-(--text)">
            ₦{balance.toLocaleString()}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <Input
            label="Withdrawal Amount (₦)"
            type="number"
            min={100}
            max={balance}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 25000"
            required
          />

          {/* Quick preset buttons */}
          <div className="mt-2 flex gap-2">
            {[0.25, 0.5, 0.75, 1.0].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentage(pct)}
                className="flex-1 rounded-lg border border-(--border) bg-(--bg-secondary) py-1 text-xs font-medium text-(--text-secondary) transition-colors hover:border-(--accent-primary) hover:text-(--text)"
              >
                {pct === 1.0 ? 'Max' : `${pct * 100}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Bank Details (Read-only verified bank account) */}
        <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--text-secondary)">
            Payout Destination
          </p>
          <div className="text-sm">
            <p className="font-medium text-(--text)">{accountName}</p>
            <p className="font-mono text-xs text-(--text-secondary)">
              {bankName} &middot; {accountNumber}
            </p>
          </div>
          <p className="text-[11px] text-(--text-tertiary)">
            Instant automated NIP transfer. Payouts arrive in 2–5 minutes.
          </p>
        </div>

        <Button
          type="submit"
          loading={submitting}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
          className="w-full gap-2"
        >
          <ArrowUpRight className="h-4 w-4" />
          Confirm & Transfer ₦{parseFloat(amount || '0').toLocaleString()}
        </Button>
      </form>
    </div>
  );
};

export default MerchantWithdraw;
