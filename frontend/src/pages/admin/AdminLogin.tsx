import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { adminLogin } from '../../api/admin';
import { useAuth } from '../../stores/useAuthStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await adminLogin({ email, password });
      login(data.data.token, 'admin', data.data.admin);
      toast.success('Welcome, admin');
      navigate('/admin/dashboard');
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
          <ShieldCheck className="mx-auto h-10 w-10 text-[var(--accent-primary)]" />
          <h1 className="mt-3 text-2xl font-bold text-[var(--text)]">Admin Login</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Access the admin dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Sign In</Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
