import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../stores/useAuthStore';
import { updateStudentProfile } from '../../api/auth';
import type { Student } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const student = user?.data as Student;
  const [form, setForm] = useState({
    full_name: student.full_name,
    phone: student.phone || '',
    university: student.university || '',
    program: student.program || '',
    year_of_study: student.year_of_study?.toString() || '',
  });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        year_of_study: form.year_of_study ? Number(form.year_of_study) : undefined,
        phone: form.phone || undefined,
        university: form.university || undefined,
        program: form.program || undefined,
      };
      const { data } = await updateStudentProfile(payload);
      updateUser(data.data.student);
      toast.success('Profile updated');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Update failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)]">Edit Profile</h1>
      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
          <Input label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          <Input label="University" value={form.university} onChange={(e) => update('university', e.target.value)} />
          <Input label="Program" value={form.program} onChange={(e) => update('program', e.target.value)} />
          <Input label="Year of Study" type="number" min="1" max="10" value={form.year_of_study} onChange={(e) => update('year_of_study', e.target.value)} />
          <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
};

export default StudentProfile;
