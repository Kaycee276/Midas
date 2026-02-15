import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText } from 'lucide-react';
import { getPendingKYC } from '../../api/admin';
import type { KYC, Pagination } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<KYC[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await getPendingKYC({ page, limit: 20 });
        setSubmissions(data.data.kyc_submissions);
        setPagination(data.data.pagination);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-[var(--accent-primary)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Admin Dashboard</h1>
          <p className="text-[var(--text-secondary)]">Review pending KYC submissions</p>
        </div>
      </div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : submissions.length === 0 ? (
        <Card className="mt-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-[var(--text-tertiary)]" />
          <p className="mt-4 text-[var(--text-secondary)]">No pending KYC submissions</p>
        </Card>
      ) : (
        <>
          <div className="mt-8 space-y-3">
            {submissions.map((kyc) => (
              <Link key={kyc.id} to={`/admin/kyc/${kyc.id}`}>
                <Card className="flex items-center justify-between transition-colors hover:border-[var(--accent-primary)]">
                  <div>
                    <p className="font-medium text-[var(--text)]">{kyc.merchant?.business_name || 'Merchant'}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Submitted {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Badge variant="warning">Pending Review</Badge>
                </Card>
              </Link>
            ))}
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-[var(--text-secondary)]">Page {page} of {pagination.total_pages}</span>
              <Button variant="outline" size="sm" disabled={page >= pagination.total_pages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
