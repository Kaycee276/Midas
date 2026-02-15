import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';
import { studentLogin } from '../../api/auth';
import { useAuth } from '../../stores/useAuthStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await studentLogin({ email, password });
      login(data.data.token, 'student', data.data.student);
      toast.success('Welcome back!');
      navigate('/student/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-[var(--accent-primary)]" />
          <h1 className="mt-3 text-2xl font-bold text-[var(--text)]">Student Login</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Sign in to your investment account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="student@university.edu" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
          <Button type="submit" loading={loading} className="w-full">Sign In</Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Don't have an account?{' '}
          <Link to="/student/register" className="text-[var(--accent-primary)] hover:underline">Register</Link>
        </p>
      </Card>
    </div>
  );
};

export default StudentLogin;
