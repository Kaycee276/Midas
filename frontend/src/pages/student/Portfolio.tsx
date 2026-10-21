import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowUpRight, TrendingUp, RefreshCw } from 'lucide-react';
import { getPortfolio, getInvestmentHistory } from '../../api/investments';
import type { Investment, Transaction } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const Portfolio = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'investments' | 'history'>('investments');

  const fetchPortfolio = useCallback(async (bypassCache = false) => {
    try {
      const [pRes, hRes] = await Promise.all([
        getPortfolio({ bypassCache }),
        getInvestmentHistory({ limit: 50 }, { bypassCache }),
      ]);
      setInvestments(pRes.data.data.investments);
      setTransactions(hRes.data.data.transactions);
    } catch {
      // empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio(true);
  }, [fetchPortfolio]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPortfolio(true);
  };

  if (loading) return <Spinner size="lg" className="py-24" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--text)">Portfolio</h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Your equity stakes and dividend history across campus businesses.
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
          <Link to="/merchants">
            <Button size="sm" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Explore Shops
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-(--border)">
        <button
          onClick={() => setTab('investments')}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            tab === 'investments'
              ? 'border-(--accent-primary) text-(--accent-primary)'
              : 'border-transparent text-(--text-secondary) hover:text-(--text)'
          }`}
        >
          Active Stakes ({investments.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            tab === 'history'
              ? 'border-(--accent-primary) text-(--accent-primary)'
              : 'border-transparent text-(--text-secondary) hover:text-(--text)'
          }`}
        >
          Transaction History ({transactions.length})
        </button>
      </div>

      <div className="mt-6">
        {tab === 'investments' ? (
          investments.length === 0 ? (
            <Card className="py-12 text-center">
              <Store className="mx-auto h-10 w-10 text-(--text-tertiary)" />
              <h3 className="mt-3 text-sm font-semibold text-(--text)">No active investments</h3>
              <p className="mt-1 text-xs text-(--text-secondary)">
                Start backing campus merchants to receive annual dividend returns.
              </p>
              <div className="mt-4">
                <Link to="/merchants">
                  <Button size="sm" className="gap-1.5">
                    Browse Campus Merchants
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {investments.map((inv) => {
                const currentVal = Number(inv.current_value || inv.amount);
                const investedAmt = Number(inv.amount);
                const gain = currentVal - investedAmt;
                const gainPct = investedAmt > 0 ? ((gain / investedAmt) * 100).toFixed(1) : '0.0';

                return (
                  <Link key={inv.id} to={`/student/investments/${inv.id}`} className="group block">
                    <Card className="flex items-center justify-between p-4 transition-all duration-150 hover:border-(--accent-primary)">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--bg-tertiary) text-(--accent-primary) border border-(--border)">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-(--text) group-hover:text-(--accent-primary) transition-colors">
                            {inv.merchant?.business_name || 'Campus Business'}
                          </p>
                          <p className="text-xs text-(--text-secondary)">
                            {inv.shares} shares &middot; Cost: ₦{investedAmt.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-mono font-semibold text-(--text)">
                            ₦{currentVal.toLocaleString()}
                          </p>
                          <p
                            className={`font-mono text-xs ${gain >= 0 ? 'text-(--success)' : 'text-(--error)'}`}
                          >
                            {gain >= 0 ? `+${gainPct}%` : `${gainPct}%`}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-(--text-tertiary) group-hover:text-(--accent-primary)" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )
        ) : transactions.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-sm text-(--text-secondary)">No transaction records found.</p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-(--border) bg-(--bg-secondary)">
            <div className="divide-y divide-(--border)">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-(--bg-tertiary)/40"
                >
                  <div>
                    <p className="font-medium text-(--text)">{tx.description}</p>
                    <p className="text-xs text-(--text-tertiary)">
                      {tx.merchant?.business_name} &middot;{' '}
                      {new Date(tx.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono font-semibold ${
                        tx.transaction_type === 'withdrawal' ? 'text-(--error)' : 'text-(--success)'
                      }`}
                    >
                      {tx.transaction_type === 'withdrawal' ? '-' : '+'}₦
                      {tx.amount.toLocaleString()}
                    </p>
                    <Badge
                      variant={
                        tx.transaction_type === 'investment'
                          ? 'info'
                          : tx.transaction_type === 'withdrawal'
                            ? 'error'
                            : 'success'
                      }
                      className="mt-1 text-[10px]"
                    >
                      {tx.transaction_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
