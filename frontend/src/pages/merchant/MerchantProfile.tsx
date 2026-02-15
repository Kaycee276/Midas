import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../stores/useAuthStore';
import { updateMerchantProfile } from '../../api/auth';
import type { Merchant } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)]">Edit Profile</h1>
      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Business Name" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} />
          <Select label="Business Type" options={businessTypeOptions} value={form.business_type} onChange={(e) => update('business_type', e.target.value)} />
          <Input label="Description" value={form.business_description} onChange={(e) => update('business_description', e.target.value)} />
          <Input label="Address" value={form.business_address} onChange={(e) => update('business_address', e.target.value)} />
          <Input label="Phone" value={form.business_phone} onChange={(e) => update('business_phone', e.target.value)} />
          <Select label="Proximity" options={proximityOptions} value={form.proximity_to_campus} onChange={(e) => update('proximity_to_campus', e.target.value)} />
          <Input label="Owner Name" value={form.owner_full_name} onChange={(e) => update('owner_full_name', e.target.value)} />
          <Input label="Owner Phone" value={form.owner_phone} onChange={(e) => update('owner_phone', e.target.value)} />
          <Input label="Owner Email" value={form.owner_email} onChange={(e) => update('owner_email', e.target.value)} />
          <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
};

export default MerchantProfile;
