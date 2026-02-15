import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import { merchantLogin } from '../../api/auth';
import { useAuth } from '../../stores/useAuthStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';

const MerchantLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await merchantLogin({ email, password });
      login(data.data.token, 'merchant', data.data.merchant);
      toast.success('Welcome back!');
      navigate('/merchant/dashboard');
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
          <LogIn className="mx-auto h-10 w-10 text-[var(--accent-primary)]" />
          <h1 className="mt-3 text-2xl font-bold text-[var(--text)]">Merchant Login</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Sign in to manage your business</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="merchant@example.com" />
          <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
          <Button type="submit" loading={loading} className="w-full">Sign In</Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Don't have an account?{' '}
          <Link to="/merchant/register" className="text-[var(--accent-primary)] hover:underline">Register</Link>
        </p>
      </Card>
    </div>
  );
};

export default MerchantLogin;
