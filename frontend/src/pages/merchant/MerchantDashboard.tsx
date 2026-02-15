import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, AlertCircle, Clock, CheckCircle, XCircle, Upload } from 'lucide-react';
import { useAuth } from '../../stores/useAuthStore';
import { getKYCStatus } from '../../api/kyc';
import type { Merchant, KYC } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const statusConfig: Record<string, { variant: 'success' | 'error' | 'warning' | 'info' | 'default'; icon: typeof CheckCircle; label: string }> = {
  not_started: { variant: 'default', icon: Upload, label: 'Not Started' },
  pending: { variant: 'warning', icon: Clock, label: 'Under Review' },
  approved: { variant: 'success', icon: CheckCircle, label: 'Approved' },
  rejected: { variant: 'error', icon: XCircle, label: 'Rejected' },
  resubmission_required: { variant: 'warning', icon: AlertCircle, label: 'Resubmission Required' },
};

const MerchantDashboard = () => {
  const { user } = useAuth();
  const merchant = user?.data as Merchant;
  const [kyc, setKyc] = useState<KYC | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getKYCStatus();
        setKyc(data.data.kyc);
      } catch {
        // No KYC yet
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Spinner size="lg" className="py-20" />;

  const kycStatus = kyc?.status || 'not_started';
  const config = statusConfig[kycStatus] || statusConfig.not_started;
  const StatusIcon = config.icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)]">Welcome, {merchant.business_name}</h1>
      <p className="mt-1 text-[var(--text-secondary)]">Manage your business and KYC verification</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* KYC Status */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-3">
              <StatusIcon className="h-6 w-6 text-[var(--accent-primary)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text)]">KYC Verification</h3>
              <Badge variant={config.variant} className="mt-1">{config.label}</Badge>
              {kycStatus === 'rejected' && kyc?.rejection_reason && (
                <p className="mt-2 text-sm text-[var(--error)]">{kyc.rejection_reason}</p>
              )}
              {kycStatus === 'resubmission_required' && kyc?.rejection_reason && (
                <p className="mt-2 text-sm text-[var(--warning)]">{kyc.rejection_reason}</p>
              )}
              {(kycStatus === 'not_started' || kycStatus === 'rejected' || kycStatus === 'resubmission_required') && (
                <Link to="/merchant/kyc" className="mt-3 block">
                  <Button size="sm">{kycStatus === 'not_started' ? 'Start KYC' : 'Resubmit KYC'}</Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        {/* Account Status */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-3">
              <FileCheck className="h-6 w-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)]">Account Status</h3>
              <Badge variant={merchant.account_status === 'active' ? 'success' : 'warning'} className="mt-1">
                {merchant.account_status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {merchant.account_status === 'active'
                  ? 'Your business is live and accepting investments.'
                  : 'Complete KYC verification to activate your account.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick links */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/merchant/profile"><Button variant="outline" size="sm">Edit Profile</Button></Link>
          <Link to="/merchant/kyc"><Button variant="outline" size="sm">KYC Documents</Button></Link>
          <Link to={`/merchants/${merchant.id}`}><Button variant="outline" size="sm">View Public Page</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
