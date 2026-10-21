import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Mail, ShieldCheck } from 'lucide-react';
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
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Update failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const initials = student.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--text)">Student Profile</h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Manage your academic credentials and verified investor details.
          </p>
        </div>
        <Badge variant={student.is_verified ? 'success' : 'warning'}>
          <ShieldCheck className="mr-1 h-3 w-3" />
          {student.is_verified ? 'Verified Student' : 'Verification Pending'}
        </Badge>
      </div>

      {/* Profile Overview Card */}
      <Card className="mt-6 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-(--accent-primary)/10 text-xl font-bold text-(--accent-primary) ring-1 ring-(--accent-primary)/20">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-(--text)">{student.full_name}</h2>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-(--text-secondary) sm:justify-start">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {student.email}
              </span>
              {student.student_id && (
                <span>
                  &middot; Campus ID:{' '}
                  <strong className="font-mono text-(--text)">{student.student_id}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">
            Personal & Academic Information
          </h2>

          <Input
            label="Full Legal Name"
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            required
          />

          <Input
            label="Mobile Phone Number"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+234 800 000 0000"
          />

          <Input
            label="Institution / University"
            value={form.university}
            onChange={(e) => update('university', e.target.value)}
            placeholder="e.g. University of Lagos (UNILAG)"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Academic Program / Major"
              value={form.program}
              onChange={(e) => update('program', e.target.value)}
              placeholder="e.g. Computer Science"
            />
            <Input
              label="Year of Study"
              type="number"
              min={1}
              max={7}
              value={form.year_of_study}
              onChange={(e) => update('year_of_study', e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;
