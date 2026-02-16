import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getKYCDetail, approveKYC, rejectKYC } from '../../api/admin';
import type { KYC } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const documentFields = [
  { key: 'student_id_document_url', label: 'Student ID' },
  { key: 'national_id_document_url', label: 'National ID' },
  { key: 'business_registration_document_url', label: 'Business Registration' },
  { key: 'proof_of_address_document_url', label: 'Proof of Address' },
  { key: 'business_photo_url', label: 'Business Photo' },
] as const;

const KYCReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kyc, setKyc] = useState<KYC | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectForm, setRejectForm] = useState({ status: 'rejected' as 'rejected' | 'resubmission_required', rejection_reason: '', admin_notes: '' });

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const { data } = await getKYCDetail(id);
        setKyc(data.data.kyc);
      } catch {
        toast.error('KYC not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setProcessing(true);
    try {
      await approveKYC(id);
      toast.success('KYC approved');
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Approval failed';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectForm.rejection_reason) {
      toast.error('Rejection reason is required');
      return;
    }
    setProcessing(true);
    try {
      await rejectKYC(id, rejectForm);
      toast.success(rejectForm.status === 'rejected' ? 'KYC rejected' : 'Resubmission requested');
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Rejection failed';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!kyc) return <div className="py-20 text-center text-(--text-secondary)">KYC not found</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/admin/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-(--text-secondary) hover:text-(--text)">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--text)">KYC Review</h1>
          <p className="mt-1 text-(--text-secondary)">{kyc.merchant?.business_name}</p>
        </div>
        <Badge variant="warning">{kyc.status}</Badge>
      </div>

      {/* Details */}
      <Card className="mt-6">
        <h3 className="mb-4 text-sm font-semibold uppercase text-(--text-tertiary)">Identification</h3>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {kyc.student_id_number && <div><span className="text-(--text-secondary)">Student ID:</span> <span className="text-(--text)">{kyc.student_id_number}</span></div>}
          {kyc.national_id_number && <div><span className="text-(--text-secondary)">National ID:</span> <span className="text-(--text)">{kyc.national_id_number}</span></div>}
          {kyc.business_registration_number && <div><span className="text-(--text-secondary)">Business Reg:</span> <span className="text-(--text)">{kyc.business_registration_number}</span></div>}
          {kyc.tax_identification_number && <div><span className="text-(--text-secondary)">Tax ID:</span> <span className="text-(--text)">{kyc.tax_identification_number}</span></div>}
          {kyc.years_in_operation != null && <div><span className="text-(--text-secondary)">Years Operating:</span> <span className="text-(--text)">{kyc.years_in_operation}</span></div>}
          {kyc.average_monthly_revenue != null && <div><span className="text-(--text-secondary)">Avg Monthly Revenue:</span> <span className="text-(--text)">{'\u20A6'}{kyc.average_monthly_revenue.toLocaleString()}</span></div>}
        </div>
      </Card>

      {/* Documents */}
      <Card className="mt-4">
        <h3 className="mb-4 text-sm font-semibold uppercase text-(--text-tertiary)">Documents</h3>
        <div className="space-y-3">
          {documentFields.map(({ key, label }) => {
            const url = kyc[key as keyof KYC] as string | undefined;
            return (
              <div key={key} className="flex items-center justify-between rounded-lg bg-(--bg-tertiary) px-4 py-3">
                <span className="text-sm text-(--text)">{label}</span>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-(--accent-primary) hover:underline">
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-sm text-(--text-tertiary)">Not uploaded</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      {kyc.status === 'pending' && (
        <div className="mt-6 flex gap-3">
          <Button onClick={handleApprove} loading={processing} className="flex-1">
            <CheckCircle className="h-4 w-4" /> Approve
          </Button>
          <Button variant="danger" onClick={() => setShowReject(true)} className="flex-1">
            <XCircle className="h-4 w-4" /> Reject
          </Button>
        </div>
      )}

      <Modal isOpen={showReject} onClose={() => setShowReject(false)} title="Reject KYC">
        <div className="space-y-4">
          <Select
            label="Action"
            options={[
              { value: 'rejected', label: 'Reject' },
              { value: 'resubmission_required', label: 'Request Resubmission' },
            ]}
            value={rejectForm.status}
            onChange={(e) => setRejectForm((p) => ({ ...p, status: e.target.value as 'rejected' | 'resubmission_required' }))}
          />
          <Input label="Reason" value={rejectForm.rejection_reason} onChange={(e) => setRejectForm((p) => ({ ...p, rejection_reason: e.target.value }))} required placeholder="Explain why..." />
          <Input label="Admin Notes (optional)" value={rejectForm.admin_notes} onChange={(e) => setRejectForm((p) => ({ ...p, admin_notes: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowReject(false)}>Cancel</Button>
            <Button variant="danger" loading={processing} onClick={handleReject}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KYCReview;
