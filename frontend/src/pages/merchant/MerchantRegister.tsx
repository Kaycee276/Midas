import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Store } from 'lucide-react';
import { merchantRegister } from '../../api/auth';
import { useAuth } from '../../stores/useAuthStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import type { BusinessType, ProximityType } from '../../types';

const businessTypeOptions = [
  'restaurant', 'cafe', 'food_truck', 'retail', 'bookstore', 'laundry',
  'salon', 'gym', 'tutoring', 'printing', 'electronics', 'clothing', 'other',
].map((v) => ({ value: v, label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }));

const proximityOptions = [
  { value: 'on_campus', label: 'On Campus' },
  { value: 'within_1km', label: 'Within 1km' },
  { value: 'within_2km', label: 'Within 2km' },
  { value: 'within_5km', label: 'Within 5km' },
  { value: 'more_than_5km', label: 'More than 5km' },
];

const MerchantRegister = () => {
  const [form, setForm] = useState({
    email: '', password: '', business_name: '', business_type: '' as BusinessType,
    business_description: '', business_address: '', business_phone: '',
    owner_full_name: '', owner_phone: '', owner_email: '',
    proximity_to_campus: '' as ProximityType, terms_accepted: false,
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.terms_accepted) return toast.error('You must accept the terms');
    setLoading(true);
    try {
      const { data } = await merchantRegister(form);
      login(data.data.token, 'merchant', data.data.merchant);
      toast.success('Registration successful!');
      navigate('/merchant/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-12">
      <Card className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <Store className="mx-auto h-10 w-10 text-[var(--accent-primary)]" />
          <h1 className="mt-3 text-2xl font-bold text-[var(--text)]">Register Your Business</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Join Midas and attract student investors</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-[var(--text-tertiary)]">Account</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              <PasswordInput label="Password" value={form.password} onChange={(e) => update('password', e.target.value)} required showCriteria />
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-[var(--text-tertiary)]">Business Info</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Business Name" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} required />
              <Select label="Business Type" options={businessTypeOptions} value={form.business_type} onChange={(e) => update('business_type', e.target.value)} required placeholder="Select type" />
              <div className="md:col-span-2">
                <Input label="Business Description" value={form.business_description} onChange={(e) => update('business_description', e.target.value)} required />
              </div>
              <Input label="Business Address" value={form.business_address} onChange={(e) => update('business_address', e.target.value)} required placeholder="Min 10 characters" />
              <Input label="Business Phone" value={form.business_phone} onChange={(e) => update('business_phone', e.target.value)} required placeholder="+1234567890" />
              <Select label="Proximity to Campus" options={proximityOptions} value={form.proximity_to_campus} onChange={(e) => update('proximity_to_campus', e.target.value)} required placeholder="Select proximity" />
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-[var(--text-tertiary)]">Owner Info</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Full Name" value={form.owner_full_name} onChange={(e) => update('owner_full_name', e.target.value)} required />
              <Input label="Phone" value={form.owner_phone} onChange={(e) => update('owner_phone', e.target.value)} required />
              <Input label="Email" type="email" value={form.owner_email} onChange={(e) => update('owner_email', e.target.value)} required />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input type="checkbox" checked={form.terms_accepted} onChange={(e) => update('terms_accepted', e.target.checked)} className="accent-[var(--accent-primary)]" />
            I accept the terms and conditions
          </label>
          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Already have an account? <Link to="/merchant/login" className="text-[var(--accent-primary)] hover:underline">Sign In</Link>
        </p>
      </Card>
    </div>
  );
};

export default MerchantRegister;
