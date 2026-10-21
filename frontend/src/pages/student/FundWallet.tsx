import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { fundWallet } from '../../api/wallet';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const presetAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

const FundWallet = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value < 100) {
      toast.error('Minimum deposit is ₦100');
      return;
    }

    setLoading(true);
    try {
      await fundWallet(value);
      setSuccess(true);
      toast.success('Wallet funded successfully');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fund wallet';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card className="p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-(--success)" />
          <h2 className="mt-4 text-xl font-semibold text-(--text)">Wallet Funded</h2>
          <p className="mt-2 text-sm text-(--text-secondary)">
            <strong className="font-mono text-(--text)">
              ₦{parseFloat(amount).toLocaleString()}
            </strong>{' '}
            has been credited to your campus wallet.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => navigate('/student/wallet')}>View Wallet</Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setAmount('');
              }}
            >
              Add More
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <Link
        to="/student/wallet"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text)"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Wallet
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-(--text)">Add Funds</h1>
      <p className="mt-1 text-sm text-(--text-secondary)">
        Instant top-up to invest in verified campus entrepreneurs.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <Input
            label="Deposit Amount (₦)"
            type="number"
            min={100}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5000"
            required
          />

          {/* Quick preset chips */}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-medium transition-colors ${
                  amount === String(preset)
                    ? 'border-(--accent-primary) bg-(--accent-primary)/10 text-(--accent-primary)'
                    : 'border-(--border) bg-(--bg-secondary) text-(--text-secondary) hover:border-(--accent-primary) hover:text-(--text)'
                }`}
              >
                ₦{preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Security & Payment Rail Notice */}
        <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-(--success) shrink-0 mt-0.5" />
          <div className="text-xs text-(--text-secondary)">
            <p className="font-medium text-(--text)">Secure Instant Payment</p>
            <p className="mt-0.5 text-(--text-tertiary)">
              Supports Nigerian debit cards (Mastercard, Visa, Verve) and direct bank transfer.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          disabled={!amount || parseFloat(amount) < 100}
          className="w-full gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Pay ₦{parseFloat(amount || '0').toLocaleString()}
        </Button>
      </form>
    </div>
  );
};

export default FundWallet;
