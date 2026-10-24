import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, Store } from 'lucide-react';
import { useAuth } from '../../stores/useAuthStore';
import { updateMerchantProfile } from '../../api/auth';
import type { Merchant } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const businessTypeOptions = [
  'restaurant',
  'cafe',
  'food_truck',
  'retail',
  'bookstore',
  'laundry',
  'salon',
  'gym',
  'tutoring',
  'printing',
  'electronics',
  'clothing',
  'other',
].map((v) => ({ value: v, label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }));

const proximityOptions = [
  { value: 'on_campus', label: 'On Campus' },
  { value: 'within_1km', label: 'Within 1km' },
  { value: 'within_2km', label: 'Within 2km' },
  { value: 'within_5km', label: 'Within 5km' },
  { value: 'more_than_5km', label: 'More than 5km' },
];

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
      const payload = {
        ...form,
        owner_email: form.owner_email || undefined,
      };
      const { data } = await updateMerchantProfile(payload);
      updateUser(data.data.merchant);
      toast.success('Storefront profile updated');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Update failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--text)">Store Settings</h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Manage your campus storefront information and contact details.
          </p>
        </div>
        <Badge variant={merchant.account_status === 'active' ? 'success' : 'warning'}>
          <ShieldCheck className="mr-1 h-3 w-3" />
          {merchant.account_status === 'active' ? 'Active Storefront' : merchant.account_status}
        </Badge>
      </div>

      {/* Storefront Overview Card */}
      <Card className="mt-6 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-(--accent-primary)/10 text-xl font-bold text-(--accent-primary) ring-1 ring-(--accent-primary)/20">
            <Store className="h-8 w-8" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-(--text)">{merchant.business_name}</h2>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-(--text-secondary) sm:justify-start">
              <span className="capitalize font-medium">
                {(merchant.business_type || 'merchant').replace(/_/g, ' ')}
              </span>
              <span>&middot;</span>
              <span>{merchant.email}</span>
              {merchant.kyc_status && (
                <Badge
                  variant={merchant.kyc_status === 'approved' ? 'success' : 'default'}
                  className="text-[10px]"
                >
                  KYC {merchant.kyc_status}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">
            Business Details
          </h2>

          <Input
            label="Business Name"
            value={form.business_name}
            onChange={(e) => update('business_name', e.target.value)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Business Type"
              options={businessTypeOptions}
              value={form.business_type}
              onChange={(e) => update('business_type', e.target.value)}
            />
            <Select
              label="Proximity to Campus"
              options={proximityOptions}
              value={form.proximity_to_campus}
              onChange={(e) => update('proximity_to_campus', e.target.value)}
            />
          </div>

          <Textarea
            label="Business Description"
            rows={3}
            value={form.business_description}
            onChange={(e) => update('business_description', e.target.value)}
            required
          />

          <Input
            label="Operating Address"
            value={form.business_address}
            onChange={(e) => update('business_address', e.target.value)}
            required
          />

          <Input
            label="Storefront Phone Number"
            value={form.business_phone}
            onChange={(e) => update('business_phone', e.target.value)}
            required
          />
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">
            Proprietor / Representative Details
          </h2>

          <Input
            label="Owner Full Name"
            value={form.owner_full_name}
            onChange={(e) => update('owner_full_name', e.target.value)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Owner Phone Number"
              value={form.owner_phone}
              onChange={(e) => update('owner_phone', e.target.value)}
              required
            />
            <Input
              label="Owner Direct Email"
              type="email"
              value={form.owner_email}
              onChange={(e) => update('owner_email', e.target.value)}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={loading} className="gap-2">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MerchantProfile;
