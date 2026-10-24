import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Shield,
  Building2,
  Coins,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { loadBachs, type Bachs } from '@bachs/js';
import { socket } from '../../lib/socket';
import {
  initiateBachsCheckout,
  checkPaymentStatus,
  simulateSandboxPayment,
} from '../../api/wallet';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const presetAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

interface CheckoutState {
  reference: string;
  checkout_id: string;
  checkout_url: string;
  amount: number;
  is_simulated: boolean;
}

const FundWallet = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeCheckout, setActiveCheckout] = useState<CheckoutState | null>(null);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [success, setSuccess] = useState(false);
  const bachsRef = useRef<Bachs | null>(null);

  // Pre-load Bachs overlay SDK
  useEffect(() => {
    let mounted = true;
    loadBachs({ baseUrl: 'https://sandbox-checkout.bachs.io' })
      .then((bachs) => {
        if (mounted) {
          bachs.Initialize({
            onEvent: (event) => {
              if (event.type === 'checkout.completed') {
                setSuccess(true);
                toast.success('Bachs payment confirmed • Wallet credited!');
              }
            },
          });
          bachsRef.current = bachs;
        }
      })
      .catch(() => {
        // Fallback gracefully if external script fails
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Real-time WebSocket listener for payment confirmation
  useEffect(() => {
    const handlePayment = () => {
      setSuccess(true);
      toast.success('Bachs payment confirmed • Wallet credited!');
    };
    socket.on('payment:succeeded', handlePayment);
    return () => {
      socket.off('payment:succeeded', handlePayment);
    };
  }, []);

  const verifyStatus = async (ref: string) => {
    setVerifying(true);
    try {
      const res = await checkPaymentStatus(ref);
      if (res.data.data.status === 'completed') {
        setSuccess(true);
        toast.success('Payment verified! Your wallet has been credited.');
        return true;
      }
      toast('Payment is still pending. If you just paid, please allow a few seconds.', {
        icon: '⏳',
      });
      return false;
    } catch {
      toast.error('Could not verify status. Please try again.');
      return false;
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value < 100) {
      toast.error('Minimum deposit is ₦100');
      return;
    }

    setLoading(true);
    try {
      const res = await initiateBachsCheckout(value);
      const data = res.data.data;

      // Real Bachs checkout session
      if (!data.is_simulated && data.checkout_url.startsWith('http')) {
        setActiveCheckout({
          reference: data.reference,
          checkout_id: data.checkout_id,
          checkout_url: data.checkout_url,
          amount: value,
          is_simulated: false,
        });

        // Try opening in modern Overlay Checkout modal so user never leaves localhost
        if (bachsRef.current) {
          try {
            await bachsRef.current.Checkout.open({
              checkoutUrl: data.checkout_url,
              onEvent: (event) => {
                if (event.type === 'checkout.completed') {
                  setSuccess(true);
                  toast.success('Bachs payment confirmed • Wallet credited!');
                } else if (event.type === 'checkout.closed') {
                  // When modal closes, double-check backend status
                  verifyStatus(data.reference);
                }
              },
            });
            return;
          } catch {
            // Fall through to manual open
          }
        }

        // If overlay cannot mount or user prefers direct window, open popup/tab
        window.open(data.checkout_url, '_blank', 'noopener,noreferrer');
        toast.success('Bachs checkout opened in a new tab');
        return;
      }

      // Offline / Simulated sandbox drawer for demo
      setActiveCheckout({
        reference: data.reference,
        checkout_id: data.checkout_id,
        checkout_url: data.checkout_url,
        amount: value,
        is_simulated: true,
      });
      toast.success('Bachs Sandbox session initialized');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to initiate Bachs checkout';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!activeCheckout) return;

    setSimulatingPayment(true);
    try {
      await simulateSandboxPayment(activeCheckout.reference);
      setSuccess(true);
      setActiveCheckout(null);
      toast.success('Bachs webhook received • Wallet credited!');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Payment simulation failed';
      toast.error(message);
    } finally {
      setSimulatingPayment(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--success)/10">
            <CheckCircle className="h-8 w-8 text-(--success)" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-(--text)">Payment Confirmed</h2>
          <p className="mt-2 text-sm text-(--text-secondary)">
            <strong className="font-mono text-(--text)">
              ₦{parseFloat(amount || '0').toLocaleString()}
            </strong>{' '}
            was fulfilled via Bachs webhook and credited to your UNN campus wallet.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => navigate('/student/wallet')}>View Wallet</Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setAmount('');
                setActiveCheckout(null);
              }}
            >
              Add More
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Active Checkout / Status Waiting View
  if (activeCheckout) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <button
          onClick={() => setActiveCheckout(null)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text)"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Amount Selection
        </button>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <Sparkles className="h-3 w-3" /> Bachs Sandbox Checkout
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-(--text)">
              Complete Payment
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-(--text-secondary)">Amount Due</span>
            <p className="font-mono text-xl font-bold text-(--text)">
              ₦{activeCheckout.amount.toLocaleString()}
            </p>
          </div>
        </div>

        <Card className="mt-6 divide-y divide-(--border) p-0 overflow-hidden">
          {/* External / Overlay Action Bar */}
          {!activeCheckout.is_simulated && (
            <div className="p-5 bg-(--bg-secondary)/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-(--text)">Checkout Session Active</h3>
                  <p className="text-xs text-(--text-secondary)">
                    Ref: <code className="font-mono">{activeCheckout.reference}</code>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (bachsRef.current) {
                      bachsRef.current.Checkout.open({
                        checkoutUrl: activeCheckout.checkout_url,
                        onEvent: (e) => {
                          if (e.type === 'checkout.completed') {
                            setSuccess(true);
                          }
                        },
                      });
                    } else {
                      window.open(activeCheckout.checkout_url, '_blank');
                    }
                  }}
                  className="gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Reopen Checkout
                </Button>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => verifyStatus(activeCheckout.reference)}
                  loading={verifying}
                  className="w-full gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${verifying ? 'animate-spin' : ''}`} />I have paid
                  • Check Payment Status
                </Button>
              </div>
            </div>
          )}

          {/* Rail 1: Test Debit Card */}
          <div className="p-5">
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-5 w-5 text-(--accent-primary)" />
              <h3 className="text-sm font-semibold text-(--text)">Card Payment (Sandbox)</h3>
            </div>
            <p className="mt-1 text-xs text-(--text-secondary)">
              Simulate instant payment with the official Bachs sandbox test card.
            </p>
            <div className="mt-3 rounded-lg bg-(--bg-tertiary) p-3 font-mono text-xs text-(--text) flex justify-between items-center border border-(--border)">
              <span>Card: 4242 •••• •••• 4242</span>
              <span className="text-(--text-secondary)">Exp: 12/28 • CVV: 408</span>
            </div>
          </div>

          {/* Rail 2: Virtual Bank Transfer */}
          <div className="p-5">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-(--text)">UNN Campus Virtual Transfer</h3>
            </div>
            <p className="mt-1 text-xs text-(--text-secondary)">
              Supports OPay, Kuda, PalmPay, and Nigerian bank transfers.
            </p>
          </div>

          {/* Rail 3: Stablecoins */}
          <div className="p-5">
            <div className="flex items-center gap-2.5">
              <Coins className="h-5 w-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-(--text)">Stablecoins (USDC / USDT)</h3>
            </div>
            <p className="mt-1 text-xs text-(--text-secondary)">
              Unified Web3 payment rails settled into campus Naira.
            </p>
          </div>

          {/* Simulation fallback for offline demo */}
          {activeCheckout.is_simulated && (
            <div className="bg-(--bg-secondary) p-5">
              <div className="flex flex-col gap-2.5">
                <Button
                  onClick={handleSimulatePayment}
                  loading={simulatingPayment}
                  className="w-full gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Simulate Successful Payment (₦{activeCheckout.amount.toLocaleString()})
                </Button>
                <p className="text-center text-[11px] text-(--text-tertiary)">
                  Triggers verified <code className="font-mono">checkout.completed</code> webhook
                  handler in backend.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Verification guarantee */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-(--text-tertiary)">
          <Shield className="h-4 w-4 text-(--success)" />
          <span>No real funds are moved • Isolated sandbox test mode</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <Link
        to="/student/wallet"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text)"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Wallet
      </Link>

      <div className="mt-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
          <Shield className="h-3.5 w-3.5" /> Powered by Bachs Sandbox
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-(--text)">
          Fund Campus Wallet
        </h1>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Add deployable capital to back verified UNN entrepreneurs and earn dividends.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <Input
            label="Deposit Amount (₦)"
            type="number"
            min={100}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5000"
            required
          />

          {/* Quick preset chips */}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-medium transition-colors ${
                  amount === String(preset)
                    ? 'border-(--accent-primary) bg-(--accent-primary)/10 text-(--accent-primary)'
                    : 'border-(--border) bg-(--bg-secondary) text-(--text-secondary) hover:border-(--accent-primary) hover:text-(--text)'
                }`}
              >
                ₦{preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Rail breakdown card */}
        <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-(--success) shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-(--text)">Bachs Multi-Rail Checkout</p>
              <p className="mt-0.5 text-(--text-secondary)">
                Supports Nigerian debit cards (Mastercard, Visa, Verve), dedicated virtual accounts,
                and stablecoins (USDT/USDC).
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          disabled={!amount || parseFloat(amount) < 100}
          className="w-full gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Proceed to Bachs Checkout (₦{parseFloat(amount || '0').toLocaleString()})
        </Button>
      </form>
    </div>
  );
};

export default FundWallet;
