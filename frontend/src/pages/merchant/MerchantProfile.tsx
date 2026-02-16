import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Store, Mail, Phone, MapPin, User } from 'lucide-react';
import { useAuth } from '../../stores/useAuthStore';
import { updateMerchantProfile } from '../../api/auth';
import type { Merchant } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

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

const proximityLabels: Record<string, string> = {
  on_campus: 'On Campus', within_1km: 'Within 1km', within_2km: 'Within 2km',
  within_5km: 'Within 5km', more_than_5km: 'More than 5km',
};

const MerchantProfile = () => {
  const { user, updateUser } = useAuth();
  const merchant = user?.data as Merchant;
  const [form, setForm] = useState({
    business_name: merchant.business_name,
    business_type: merchant.business_type,
    business_description: merchant.business_description,
    business_address: merchant.business_address,
    business_phone: merchant.business_phone,
    owner_full_name: merchant.owner_full_name,
    owner_phone: merchant.owner_phone,
    owner_email: merchant.owner_email || '',
    proximity_to_campus: merchant.proximity_to_campus,
  });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateMerchantProfile(form);
      updateUser(data.data.merchant);
      toast.success('Profile updated');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Update failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const initials = merchant.business_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-(--text)">Profile</h1>
      <p className="mt-1 text-(--text-secondary)">Manage your business information</p>

      {/* Profile Header */}
      <Card className="mt-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-(--accent-primary)/15 text-2xl font-bold text-(--accent-primary)">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-(--text)">{merchant.business_name}</h2>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-(--text-secondary) sm:justify-start">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {merchant.email}</span>
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {merchant.business_phone}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {proximityLabels[merchant.proximity_to_campus] || merchant.proximity_to_campus}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant={merchant.account_status === 'active' ? 'success' : 'warning'}>
                {merchant.account_status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
              <Badge variant={merchant.kyc_status === 'approved' ? 'success' : merchant.kyc_status === 'pending' ? 'warning' : 'default'}>
                KYC: {merchant.kyc_status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
              <Badge>{merchant.business_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-(--border) pt-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-xs text-(--text-tertiary)">Owner</p>
            <p className="mt-0.5 text-sm font-medium text-(--text)">{merchant.owner_full_name}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-(--text-tertiary)">Address</p>
            <p className="mt-0.5 text-sm font-medium text-(--text) truncate" title={merchant.business_address}>{merchant.business_address}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-(--text-tertiary)">Proximity</p>
            <p className="mt-0.5 text-sm font-medium text-(--text)">{proximityLabels[merchant.proximity_to_campus] || '—'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-(--text-tertiary)">Joined</p>
            <p className="mt-0.5 text-sm font-medium text-(--text)">{new Date(merchant.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-(--text-tertiary)">
            <Store className="h-4 w-4" /> Business Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Business Name" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} />
            <Select label="Business Type" options={businessTypeOptions} value={form.business_type} onChange={(e) => update('business_type', e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Description" value={form.business_description} onChange={(e) => update('business_description', e.target.value)} />
            </div>
            <Input label="Business Address" value={form.business_address} onChange={(e) => update('business_address', e.target.value)} />
            <Input label="Business Phone" value={form.business_phone} onChange={(e) => update('business_phone', e.target.value)} />
            <Select label="Proximity to Campus" options={proximityOptions} value={form.proximity_to_campus} onChange={(e) => update('proximity_to_campus', e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-(--text-tertiary)">
            <User className="h-4 w-4" /> Owner Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Owner Name" value={form.owner_full_name} onChange={(e) => update('owner_full_name', e.target.value)} />
            <Input label="Owner Phone" value={form.owner_phone} onChange={(e) => update('owner_phone', e.target.value)} />
            <Input label="Owner Email" value={form.owner_email} onChange={(e) => update('owner_email', e.target.value)} placeholder="Optional" />
          </div>
        </Card>

        <Button type="submit" loading={loading} className="w-full" size="lg">Save Changes</Button>
      </form>
    </div>
  );
};

export default MerchantProfile;
