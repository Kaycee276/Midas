import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getInvestmentDetail, withdrawInvestment } from '../../api/investments';
import type { Investment } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const InvestmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const { data } = await getInvestmentDetail(id);
        setInvestment(data.data.investment);
      } catch {
        toast.error('Investment not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleWithdraw = async () => {
    if (!id) return;
    setWithdrawing(true);
    try {
      const { data } = await withdrawInvestment(id);
      setInvestment(data.data.investment);
      toast.success('Investment withdrawn successfully');
      setShowModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Withdrawal failed';
      toast.error(msg);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!investment) return <div className="py-20 text-center text-(--text-secondary)">Investment not found</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/student/portfolio" className="mb-6 inline-flex items-center gap-1 text-sm text-(--text-secondary) hover:text-(--text)">
        <ArrowLeft className="h-4 w-4" /> Back to Portfolio
      </Link>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-(--text)">{investment.merchant?.business_name || 'Investment'}</h1>
            <Badge variant={investment.status === 'active' ? 'success' : investment.status === 'withdrawn' ? 'default' : 'warning'} className="mt-1">
              {investment.status}
            </Badge>
          </div>
          {investment.status === 'active' && (
            <Button variant="danger" size="sm" onClick={() => setShowModal(true)}>Withdraw</Button>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-(--text-tertiary)" />
            <div>
              <p className="text-sm text-(--text-secondary)">Amount Invested</p>
              <p className="text-lg font-semibold text-(--text)">{'\u20A6'}{investment.amount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-(--text-tertiary)" />
            <div>
              <p className="text-sm text-(--text-secondary)">Current Value</p>
              <p className="text-lg font-semibold text-(--text)">{'\u20A6'}{investment.current_value.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-(--text-tertiary)" />
            <div>
              <p className="text-sm text-(--text-secondary)">Invested On</p>
              <p className="text-lg font-semibold text-(--text)">{new Date(investment.invested_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-(--text-secondary)">Shares</p>
            <p className="text-lg font-semibold text-(--text)">{investment.shares} @ {'\u20A6'}{investment.price_per_share}/share</p>
          </div>
        </div>

        {investment.return_amount !== 0 && (
          <div className="mt-4 rounded-lg bg-(--bg-tertiary) p-4">
            <p className="text-sm text-(--text-secondary)">Returns</p>
            <p className={`text-lg font-bold ${investment.return_amount >= 0 ? 'text-(--success)' : 'text-(--error)'}`}>
              {'\u20A6'}{investment.return_amount.toLocaleString()} ({investment.return_percentage}%)
            </p>
          </div>
        )}

        {investment.notes && (
          <div className="mt-4">
            <p className="text-sm text-(--text-secondary)">Notes</p>
            <p className="text-(--text)">{investment.notes}</p>
          </div>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Withdraw Investment">
        <p className="text-(--text-secondary)">
          Are you sure you want to withdraw your investment of {'\u20A6'}{investment.amount.toLocaleString()} from {investment.merchant?.business_name}?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" loading={withdrawing} onClick={handleWithdraw}>Confirm Withdrawal</Button>
        </div>
      </Modal>
    </div>
  );
};

export default InvestmentDetail;
