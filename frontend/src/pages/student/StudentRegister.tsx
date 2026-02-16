import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap, Mail } from 'lucide-react';
import { studentRegister } from '../../api/auth';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';

const StudentRegister = () => {
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', student_id: '',
    phone: '', university: '', program: '', year_of_study: '',
    terms_accepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const update = (field: string, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.terms_accepted) return toast.error('You must accept the terms');
    setLoading(true);
    try {
      const payload = {
        ...form,
        year_of_study: Number(form.year_of_study),
      };
      await studentRegister(payload);
      setRegistered(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="flex min-h-screen items-start justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <Mail className="mx-auto h-12 w-12 text-(--accent-primary)" />
          <h2 className="mt-4 text-xl font-bold text-(--text)">Check Your Email</h2>
          <p className="mt-2 text-(--text-secondary)">
            We've sent a verification link to <strong>{form.email}</strong>. Please check your inbox and click the link to verify your account.
          </p>
          <p className="mt-4 text-sm text-(--text-tertiary)">
            Didn't receive the email? Check your spam folder or{' '}
            <Link to="/student/login" className="text-(--accent-primary) hover:underline">try logging in</Link> to resend.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-(--accent-primary)" />
          <h1 className="mt-3 text-2xl font-bold text-(--text)">Create Student Account</h1>
          <p className="mt-1 text-sm text-(--text-secondary)">Start investing in campus businesses</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="student@university.edu" />
          <PasswordInput label="Password" value={form.password} onChange={(e) => update('password', e.target.value)} required showCriteria />
          <Input label="Student ID" value={form.student_id} onChange={(e) => update('student_id', e.target.value)} required placeholder="STU2024001" />
          <Input label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} required placeholder="+1234567890" />
          <Input label="University" value={form.university} onChange={(e) => update('university', e.target.value)} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Program" value={form.program} onChange={(e) => update('program', e.target.value)} required />
            <Input label="Year of Study" type="number" min="1" max="10" value={form.year_of_study} onChange={(e) => update('year_of_study', e.target.value)} required />
          </div>
          <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
            <input type="checkbox" checked={form.terms_accepted} onChange={(e) => update('terms_accepted', e.target.checked)} className="accent-(--accent-primary)" />
            I accept the terms and conditions
          </label>
          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>
        <p className="mt-4 text-center text-sm text-(--text-secondary)">
          Already have an account? <Link to="/student/login" className="text-(--accent-primary) hover:underline">Sign In</Link>
        </p>
      </Card>
    </div>
  );
};

export default StudentRegister;
