import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';
import { studentRegister } from '../../api/auth';
import { useAuth } from '../../stores/useAuthStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const StudentRegister = () => {
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', student_id: '',
    phone: '', university: '', program: '', year_of_study: '',
    terms_accepted: false,
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
      const payload = {
        ...form,
        year_of_study: form.year_of_study ? Number(form.year_of_study) : undefined,
        student_id: form.student_id || undefined,
        phone: form.phone || undefined,
        university: form.university || undefined,
        program: form.program || undefined,
      };
      const { data } = await studentRegister(payload);
      login(data.data.token, 'student', data.data.student);
      toast.success('Registration successful!');
      navigate('/student/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-[var(--accent-primary)]" />
          <h1 className="mt-3 text-2xl font-bold text-[var(--text)]">Create Student Account</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Start investing in campus businesses</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="student@university.edu" />
          <Input label="Password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required placeholder="Min 8 chars, mixed case, digit, special" />
          <Input label="Student ID (optional)" value={form.student_id} onChange={(e) => update('student_id', e.target.value)} placeholder="STU2024001" />
          <Input label="Phone (optional)" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1234567890" />
          <Input label="University (optional)" value={form.university} onChange={(e) => update('university', e.target.value)} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Program (optional)" value={form.program} onChange={(e) => update('program', e.target.value)} />
            <Input label="Year of Study (optional)" type="number" min="1" max="10" value={form.year_of_study} onChange={(e) => update('year_of_study', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input type="checkbox" checked={form.terms_accepted} onChange={(e) => update('terms_accepted', e.target.checked)} className="accent-[var(--accent-primary)]" />
            I accept the terms and conditions
          </label>
          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Already have an account? <Link to="/student/login" className="text-[var(--accent-primary)] hover:underline">Sign In</Link>
        </p>
      </Card>
    </div>
  );
};

export default StudentRegister;
