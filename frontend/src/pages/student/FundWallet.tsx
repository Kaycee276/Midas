import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
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
      toast.error('Minimum deposit is \u20A6100');
      return;
    }

    setLoading(true);
    try {
      await fundWallet(value);
      setSuccess(true);
      toast.success('Wallet funded successfully!');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fund wallet';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-(--success)" />
          <h2 className="mt-4 text-xl font-bold text-(--text)">Wallet Funded!</h2>
          <p className="mt-2 text-(--text-secondary)">
            {'\u20A6'}{parseFloat(amount).toLocaleString()} has been added to your wallet.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => navigate('/student/wallet')}>Go to Wallet</Button>
            <Button variant="outline" onClick={() => { setSuccess(false); setAmount(''); }}>Fund Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link to="/student/wallet" className="mb-6 inline-flex items-center gap-1 text-sm text-(--text-secondary) hover:text-(--text)">
        <ArrowLeft className="h-4 w-4" /> Back to Wallet
      </Link>

      <h1 className="text-2xl font-bold text-(--text)">Fund Wallet</h1>
      <p className="mt-1 text-(--text-secondary)">Add money to your wallet</p>

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Amount (\u20A6)"
            type="number"
            min={100}
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div>
            <p className="mb-2 text-sm text-(--text-secondary)">Quick amounts</p>
            <div className="flex flex-wrap gap-2">
              {presetAmounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(String(a))}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    amount === String(a)
                      ? 'border-(--accent-primary) bg-(--accent-primary)/10 text-(--accent-primary)'
                      : 'border-(--border) text-(--text-secondary) hover:border-(--accent-primary)'
                  }`}
                >
                  {'\u20A6'}{a.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Fund {'\u20A6'}{parseFloat(amount || '0').toLocaleString()}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default FundWallet;
