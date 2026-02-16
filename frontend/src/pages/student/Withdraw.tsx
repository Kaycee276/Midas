import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getWalletInfo, withdrawFunds } from '../../api/wallet';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const Withdraw = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getWalletInfo();
        setBalance(data.data.balance);
      } catch {
        toast.error('Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value < 100) {
      toast.error('Minimum withdrawal is \u20A6100');
      return;
    }
    if (value > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setSubmitting(true);
    try {
      await withdrawFunds(value);
      setSuccess(true);
      toast.success('Withdrawal successful!');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Withdrawal failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-(--success)" />
          <h2 className="mt-4 text-xl font-bold text-(--text)">Withdrawal Successful!</h2>
          <p className="mt-2 text-(--text-secondary)">
            {'\u20A6'}{parseFloat(amount).toLocaleString()} has been withdrawn from your wallet.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/student/wallet')}>Go to Wallet</Button>
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

      <h1 className="text-2xl font-bold text-(--text)">Withdraw Funds</h1>

      <Card className="mt-4 flex items-center justify-between">
        <span className="text-sm text-(--text-secondary)">Available Balance</span>
        <span className="font-semibold text-(--text)">{'\u20A6'}{balance.toLocaleString()}</span>
      </Card>

      <Card className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Withdrawal Amount (\u20A6)"
            type="number"
            min={100}
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          {parseFloat(amount) > balance && (
            <p className="text-sm text-(--error)">Insufficient balance</p>
          )}

          <Button
            type="submit"
            loading={submitting}
            disabled={!amount || parseFloat(amount) > balance}
            className="w-full"
          >
            Withdraw {'\u20A6'}{parseFloat(amount || '0').toLocaleString()}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Withdraw;
