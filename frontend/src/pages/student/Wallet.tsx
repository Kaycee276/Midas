import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, CreditCard } from 'lucide-react';
import { getWalletInfo } from '../../api/wallet';
import type { WalletInfo, WalletTransaction } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const txnTypeLabel: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  investment_debit: 'Investment',
  investment_refund: 'Investment Refund',
  dividend_credit: 'Dividend',
};

const txnBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  if (status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'failed' || status === 'reversed') return 'error';
  return 'default';
};

const isCredit = (type: string) =>
  ['deposit', 'investment_refund', 'dividend_credit'].includes(type);

const Wallet = () => {
  const [info, setInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getWalletInfo();
        setInfo(data.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-(--text)">Wallet</h1>
      <p className="mt-1 text-(--text-secondary)">Manage your funds</p>

      {/* Balance Card */}
      <Card className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <WalletIcon className="h-10 w-10 text-(--accent-primary)" />
            <div>
              <p className="text-sm text-(--text-secondary)">Available Balance</p>
              <p className="text-3xl font-bold text-(--text)">
                {'\u20A6'}{(info?.balance || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/student/wallet/fund">
              <Button><Plus className="h-4 w-4" /> Fund Wallet</Button>
            </Link>
            <Link to="/student/wallet/withdraw">
              <Button variant="outline"><CreditCard className="h-4 w-4" /> Withdraw</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-(--text)">Recent Transactions</h2>
          <span className="text-sm text-(--text-tertiary)">Last 10</span>
        </div>

        {!info?.recent_transactions?.length ? (
          <Card className="mt-4 text-center">
            <p className="text-(--text-secondary)">No transactions yet.</p>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {info.recent_transactions.map((txn: WalletTransaction) => (
              <Card key={txn.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isCredit(txn.type) ? (
                    <ArrowDownLeft className="h-5 w-5 text-(--success)" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-(--error)" />
                  )}
                  <div>
                    <p className="font-medium text-(--text)">{txnTypeLabel[txn.type] || txn.type}</p>
                    <p className="text-sm text-(--text-tertiary)">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${isCredit(txn.type) ? 'text-(--success)' : 'text-(--text)'}`}>
                    {isCredit(txn.type) ? '+' : '-'}{'\u20A6'}{parseFloat(String(txn.amount)).toLocaleString()}
                  </p>
                  <Badge variant={txnBadgeVariant(txn.status)}>{txn.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
