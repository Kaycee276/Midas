import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw } from 'lucide-react';
import { getWalletInfo } from '../../api/wallet';
import type { WalletInfo, WalletTransaction } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const txnTypeLabel: Record<string, string> = {
  deposit: 'Wallet Top-Up',
  withdrawal: 'Bank Withdrawal',
  investment_debit: 'Micro-Equity Investment',
  investment_refund: 'Investment Refund',
  dividend_credit: 'Annual Dividend Payout',
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
  const [refreshing, setRefreshing] = useState(false);

  const fetchWallet = useCallback(async (bypassCache = false) => {
    try {
      const { data } = await getWalletInfo({ bypassCache });
      setInfo(data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet(true);
  }, [fetchWallet]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWallet(true);
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  const transactions = info?.recent_transactions || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--text)">Student Wallet</h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Manage your campus investing funds and bank payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync'}
          </Button>
          <Link to="/student/wallet/withdraw">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Withdraw
            </Button>
          </Link>
          <Link to="/student/wallet/fund">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Funds
            </Button>
          </Link>
        </div>
      </div>

      {/* Available Balance Card */}
      <Card className="mt-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-(--text-secondary)">
              Available Balance
            </span>
            <p className="mt-2 font-mono text-4xl font-bold tracking-tight text-(--text)">
              ₦{(info?.balance || 0).toLocaleString()}
            </p>
            <p className="mt-1.5 text-xs text-(--text-tertiary)">
              Instant deployable capital for backing campus entrepreneurs.
            </p>
          </div>
          <div className="rounded-xl bg-(--bg-tertiary) p-3.5 text-(--accent-primary) border border-(--border)">
            <WalletIcon className="h-8 w-8" />
          </div>
        </div>
      </Card>

      {/* Transactions Ledger */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-(--text)">Transaction History</h2>
          <span className="text-xs text-(--text-secondary)">
            {transactions.length} recent {transactions.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {transactions.length === 0 ? (
          <Card className="mt-4 py-12 text-center">
            <WalletIcon className="mx-auto h-10 w-10 text-(--text-tertiary)" />
            <h3 className="mt-3 text-sm font-semibold text-(--text)">No transactions yet</h3>
            <p className="mt-1 text-xs text-(--text-secondary)">
              When you top up or invest in campus shops, your transaction receipts will appear here.
            </p>
            <div className="mt-4">
              <Link to="/student/wallet/fund">
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Top Up Wallet
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-(--border) bg-(--bg-secondary)">
            <div className="divide-y divide-(--border)">
              {transactions.map((txn: WalletTransaction) => {
                const credit = isCredit(txn.type);

                return (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-(--bg-tertiary)/40"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                          credit
                            ? 'border-(--success)/20 bg-(--success)/10 text-(--success)'
                            : 'border-(--border) bg-(--bg-tertiary) text-(--text-secondary)'
                        }`}
                      >
                        {credit ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-(--text)">
                          {txn.description || txnTypeLabel[txn.type] || txn.type}
                        </p>
                        <p className="text-xs text-(--text-tertiary)">
                          {new Date(txn.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-mono font-semibold ${
                          credit ? 'text-(--success)' : 'text-(--text)'
                        }`}
                      >
                        {credit ? '+' : '-'}₦{parseFloat(String(txn.amount)).toLocaleString()}
                      </p>
                      <Badge variant={txnBadgeVariant(txn.status)} className="mt-1 text-[10px]">
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
