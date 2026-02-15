import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { User, Mail, GraduationCap, Phone } from 'lucide-react';
import { useAuth } from '../../stores/useAuthStore';
import { updateStudentProfile } from '../../api/auth';
import type { Student } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
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

  const initials = student.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)]">Profile</h1>
      <p className="mt-1 text-[var(--text-secondary)]">Manage your personal information</p>

      {/* Profile Header */}
      <Card className="mt-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)]/15 text-2xl font-bold text-[var(--accent-primary)]">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-[var(--text)]">{student.full_name}</h2>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)] sm:justify-start">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {student.email}</span>
              {student.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {student.phone}</span>}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge variant={student.account_status === 'active' ? 'success' : 'warning'}>
                {student.account_status}
              </Badge>
              {student.is_verified && <Badge variant="success">Email Verified</Badge>}
              {student.university && <Badge variant="info">{student.university}</Badge>}
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-xs text-[var(--text-tertiary)]">Student ID</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--text)]">{student.student_id || '—'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--text-tertiary)]">Program</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--text)]">{student.program || '—'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--text-tertiary)]">Year</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--text)]">{student.year_of_study || '—'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--text-tertiary)]">Joined</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--text)]">{new Date(student.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-[var(--text-tertiary)]">
            <User className="h-4 w-4" /> Personal Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
            <Input label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Optional" />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase text-[var(--text-tertiary)]">
            <GraduationCap className="h-4 w-4" /> Academic Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="University" value={form.university} onChange={(e) => update('university', e.target.value)} placeholder="Optional" />
            <Input label="Program" value={form.program} onChange={(e) => update('program', e.target.value)} placeholder="Optional" />
            <Input label="Year of Study" type="number" min="1" max="10" value={form.year_of_study} onChange={(e) => update('year_of_study', e.target.value)} placeholder="Optional" />
          </div>
        </Card>

        <Button type="submit" loading={loading} className="w-full" size="lg">Save Changes</Button>
      </form>
    </div>
  );
};

export default StudentProfile;
