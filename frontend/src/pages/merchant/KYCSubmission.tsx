import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, Clock } from 'lucide-react';
import { getKYCStatus, submitKYC } from '../../api/kyc';
import type { KYC } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import FileUpload from '../../components/ui/FileUpload';

const KYCSubmission = () => {
  const navigate = useNavigate();
  const [kyc, setKyc] = useState<KYC | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getKYCStatus();
        setKyc(data.data.kyc);
      } catch {
        // No KYC yet — show the form
      } finally {
        setChecking(false);
      }
    };
    fetch();
  }, []);
  const [form, setForm] = useState({
    student_id_number: '',
    national_id_number: '',
    business_registration_number: '',
    tax_identification_number: '',
    years_in_operation: '',
    average_monthly_revenue: '',
  });
  const [files, setFiles] = useState<Record<string, File | null>>({
    student_id_document: null,
    national_id_document: null,
    business_registration_document: null,
    proof_of_address_document: null,
    business_photo: null,
  });

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));
  const updateFile = (field: string, file: File | null) => setFiles((p) => ({ ...p, [field]: file }));

  const requiredFiles = ['national_id_document', 'business_registration_document', 'proof_of_address_document', 'business_photo'] as const;
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    for (const key of requiredFiles) {
      if (!files[key]) errors[key] = 'This document is required';
    }
    if (Object.keys(errors).length > 0) {
      setFileErrors(errors);
      return;
    }
    setFileErrors({});

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => { if (val) formData.append(key, val); });
      Object.entries(files).forEach(([key, file]) => { if (file) formData.append(key, file); });
      await submitKYC(formData);
      toast.success('KYC submitted successfully');
      navigate('/merchant/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Submission failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <Spinner size="lg" className="py-20" />;

  // KYC approved — show verified state
  if (kyc?.status === 'approved') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-(--success)" />
          <h1 className="mt-4 text-2xl font-bold text-(--text)">KYC Verified</h1>
          <p className="mt-2 text-(--text-secondary)">
            Your identity and business documents have been verified. No further action is needed.
          </p>
          <Badge variant="success" className="mt-4">Approved</Badge>
          <div className="mt-6">
            <Link to="/merchant/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // KYC pending review — show waiting state
  if (kyc?.status === 'pending') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card className="text-center">
          <Clock className="mx-auto h-16 w-16 text-(--warning)" />
          <h1 className="mt-4 text-2xl font-bold text-(--text)">KYC Under Review</h1>
          <p className="mt-2 text-(--text-secondary)">
            Your documents have been submitted and are being reviewed. We'll notify you once the review is complete.
          </p>
          <Badge variant="warning" className="mt-4">Under Review</Badge>
          <div className="mt-6">
            <Link to="/merchant/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Shield className="h-8 w-8 text-(--accent-primary)" />
        <div>
          <h1 className="text-2xl font-bold text-(--text)">KYC Verification</h1>
          <p className="text-sm text-(--text-secondary)">Submit your documents for verification</p>
        </div>
      </div>

      {kyc?.status === 'rejected' && kyc.rejection_reason && (
        <Card className="mb-6 border-(--error)/30 bg-(--error)/5">
          <p className="text-sm font-medium text-(--error)">Rejection reason: {kyc.rejection_reason}</p>
        </Card>
      )}
      {kyc?.status === 'resubmission_required' && kyc.rejection_reason && (
        <Card className="mb-6 border-(--warning)/30 bg-(--warning)/5">
          <p className="text-sm font-medium text-(--warning)">Resubmission required: {kyc.rejection_reason}</p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase text-(--text-tertiary)">Identification Numbers</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Student ID Number" value={form.student_id_number} onChange={(e) => updateField('student_id_number', e.target.value)} placeholder="Optional" />
            <Input label="National ID Number" value={form.national_id_number} onChange={(e) => updateField('national_id_number', e.target.value)} placeholder="Required if no Student ID" />
            <Input label="Business Registration No." value={form.business_registration_number} onChange={(e) => updateField('business_registration_number', e.target.value)} placeholder="Optional" />
            <Input label="Tax ID Number" value={form.tax_identification_number} onChange={(e) => updateField('tax_identification_number', e.target.value)} placeholder="Optional" />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase text-(--text-tertiary)">Business Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Years in Operation" type="number" min="0" max="100" value={form.years_in_operation} onChange={(e) => updateField('years_in_operation', e.target.value)} />
            <Input label="Avg Monthly Revenue (₦)" type="number" min="0" value={form.average_monthly_revenue} onChange={(e) => updateField('average_monthly_revenue', e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase text-(--text-tertiary)">Documents</h3>
          <div className="space-y-4">
            <FileUpload label="Student ID Document" value={files.student_id_document} onChange={(f) => updateFile('student_id_document', f)} />
            <FileUpload label="National ID Document *" value={files.national_id_document} onChange={(f) => updateFile('national_id_document', f)} error={fileErrors.national_id_document} />
            <FileUpload label="Business Registration Document *" value={files.business_registration_document} onChange={(f) => updateFile('business_registration_document', f)} error={fileErrors.business_registration_document} />
            <FileUpload label="Proof of Address *" value={files.proof_of_address_document} onChange={(f) => updateFile('proof_of_address_document', f)} error={fileErrors.proof_of_address_document} />
            <FileUpload label="Business Photo *" value={files.business_photo} onChange={(f) => updateFile('business_photo', f)} error={fileErrors.business_photo} />
          </div>
        </Card>

        <Button type="submit" loading={loading} className="w-full" size="lg">Submit KYC</Button>
      </form>
    </div>
  );
};

export default KYCSubmission;
