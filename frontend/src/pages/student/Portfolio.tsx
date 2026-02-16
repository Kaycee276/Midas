import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPortfolio, getInvestmentHistory } from '../../api/investments';
import type { Investment, Transaction } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const Portfolio = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'investments' | 'history'>('investments');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, hRes] = await Promise.all([
          getPortfolio(),
          getInvestmentHistory({ limit: 20 }),
        ]);
        setInvestments(pRes.data.data.investments);
        setTransactions(hRes.data.data.transactions);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-(--text)">Portfolio</h1>

      <div className="mt-6 flex gap-2 border-b border-(--border)">
        <button
          onClick={() => setTab('investments')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'investments' ? 'border-b-2 border-(--accent-primary) text-(--text)' : 'text-(--text-secondary)'}`}
        >
          Investments ({investments.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'history' ? 'border-b-2 border-(--accent-primary) text-(--text)' : 'text-(--text-secondary)'}`}
        >
          Transaction History
        </button>
      </div>

      <div className="mt-6">
        {tab === 'investments' ? (
          investments.length === 0 ? (
            <p className="py-10 text-center text-(--text-secondary)">No investments yet.</p>
          ) : (
            <div className="space-y-3">
              {investments.map((inv) => (
                <Link key={inv.id} to={`/student/investments/${inv.id}`}>
                  <Card className="flex items-center justify-between transition-colors hover:border-(--accent-primary)">
                    <div>
                      <p className="font-medium text-(--text)">{inv.merchant?.business_name || 'Merchant'}</p>
                      <p className="text-sm text-(--text-secondary)">
                        {inv.shares} shares &middot; Invested {'\u20A6'}{inv.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-(--text)">{'\u20A6'}{inv.current_value.toLocaleString()}</p>
                      <Badge variant={inv.status === 'active' ? 'success' : inv.status === 'withdrawn' ? 'default' : 'warning'}>
                        {inv.status}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )
        ) : transactions.length === 0 ? (
          <p className="py-10 text-center text-(--text-secondary)">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <Card key={tx.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-(--text)">{tx.description}</p>
                  <p className="text-sm text-(--text-secondary)">
                    {tx.merchant?.business_name} &middot; {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.transaction_type === 'withdrawal' ? 'text-(--error)' : 'text-(--success)'}`}>
                    {tx.transaction_type === 'withdrawal' ? '-' : '+'}{'\u20A6'}{tx.amount.toLocaleString()}
                  </p>
                  <Badge variant={tx.transaction_type === 'investment' ? 'info' : tx.transaction_type === 'withdrawal' ? 'error' : 'success'}>
                    {tx.transaction_type}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
