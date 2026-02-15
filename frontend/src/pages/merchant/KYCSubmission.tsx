import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';
import { submitKYC } from '../../api/kyc';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';

const KYCSubmission = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Shield className="h-8 w-8 text-[var(--accent-primary)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">KYC Verification</h1>
          <p className="text-sm text-[var(--text-secondary)]">Submit your documents for verification</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase text-[var(--text-tertiary)]">Identification Numbers</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Student ID Number" value={form.student_id_number} onChange={(e) => updateField('student_id_number', e.target.value)} placeholder="Optional" />
            <Input label="National ID Number" value={form.national_id_number} onChange={(e) => updateField('national_id_number', e.target.value)} placeholder="Required if no Student ID" />
            <Input label="Business Registration No." value={form.business_registration_number} onChange={(e) => updateField('business_registration_number', e.target.value)} placeholder="Optional" />
            <Input label="Tax ID Number" value={form.tax_identification_number} onChange={(e) => updateField('tax_identification_number', e.target.value)} placeholder="Optional" />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase text-[var(--text-tertiary)]">Business Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Years in Operation" type="number" min="0" max="100" value={form.years_in_operation} onChange={(e) => updateField('years_in_operation', e.target.value)} />
            <Input label="Avg Monthly Revenue ($)" type="number" min="0" value={form.average_monthly_revenue} onChange={(e) => updateField('average_monthly_revenue', e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase text-[var(--text-tertiary)]">Documents</h3>
          <div className="space-y-4">
            <FileUpload label="Student ID Document" value={files.student_id_document} onChange={(f) => updateFile('student_id_document', f)} />
            <FileUpload label="National ID Document" value={files.national_id_document} onChange={(f) => updateFile('national_id_document', f)} />
            <FileUpload label="Business Registration Document" value={files.business_registration_document} onChange={(f) => updateFile('business_registration_document', f)} />
            <FileUpload label="Proof of Address" value={files.proof_of_address_document} onChange={(f) => updateFile('proof_of_address_document', f)} />
            <FileUpload label="Business Photo" value={files.business_photo} onChange={(f) => updateFile('business_photo', f)} />
          </div>
        </Card>

        <Button type="submit" loading={loading} className="w-full" size="lg">Submit KYC</Button>
      </form>
    </div>
  );
};

export default KYCSubmission;
