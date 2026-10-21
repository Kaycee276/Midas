import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  Users,
  ArrowRight,
  Store,
  GraduationCap,
  Calendar,
  Wallet,
  Compass,
  ArrowUpRight,
  Calculator,
  Lock,
  ChevronDown,
  Terminal,
  FileCode2,
  Check,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const stats = [
  { label: 'Active Student Investors', value: '1,450+' },
  { label: 'Verified Campus Businesses', value: '48+' },
  { label: 'Total Micro-Capital Funded', value: '₦38.5M' },
  { label: 'Dividend Distribution Cycle', value: 'Annual (Jan 1)' },
];

const sampleMerchants = [
  {
    id: 'demo-1',
    name: 'Campus Beanery & Co.',
    type: 'Cafe & Bakery',
    proximity: 'On Campus • Library Annex',
    fundedPercent: 86,
    target: '₦600,000',
    sharePrice: '₦1,000',
    estYield: '18.4% APY',
    backers: 142,
    badge: 'Popular',
  },
  {
    id: 'demo-2',
    name: 'UniTech Diagnostics & Print',
    type: 'Printing & Tech Hub',
    proximity: 'Within 500m • Student Center',
    fundedPercent: 92,
    target: '₦1,200,000',
    sharePrice: '₦2,500',
    estYield: '21.0% APY',
    backers: 210,
    badge: 'Almost Funded',
  },
  {
    id: 'demo-3',
    name: 'Green Kitchen Express',
    type: 'Healthy Dining & Smoothies',
    proximity: 'Within 1km • Hostel Gate B',
    fundedPercent: 64,
    target: '₦850,000',
    sharePrice: '₦1,500',
    estYield: '17.8% APY',
    backers: 95,
    badge: 'Verified',
  },
];

const faqs = [
  {
    q: 'How do annual investor dividend payouts work?',
    a: 'Every year on January 1st at midnight, Midas automatically triggers the dividend distribution engine. Participating merchants submit their annual fiscal reports, from which 30% of net profits is placed into the investor dividend pool and distributed proportionally to all student shareholders directly in their Midas wallets.',
  },
  {
    q: 'What is the 65% / 30% / 5% revenue sharing formula?',
    a: 'Total annual net profit is transparently divided: 65% is retained by the merchant for business growth and operational cashflow, 30% is deposited into the investor dividend pool for student shareholders, and 5% covers Midas verification, compliance, and platform maintenance.',
  },
  {
    q: 'What is the minimum amount required to start investing?',
    a: 'Students can begin investing with as little as ₦1,000. Each merchant sets their own share price (typically between ₦1,000 and ₦5,000 per share), making campus micro-investments accessible to everyone.',
  },
  {
    q: 'How are merchants verified on Midas?',
    a: 'Every campus business must undergo our multi-tier KYC verification process. Our compliance team verifies government identification, campus business operational proof, student/staff affiliation, physical location, and historical revenue statements before any business is approved for public investment.',
  },
  {
    q: 'How and when can students withdraw their returns?',
    a: 'Whenever annual dividends are paid or when your wallet has funds, you can initiate instant bank withdrawals to any verified Nigerian bank account directly through your Student Wallet.',
  },
];

const Landing = () => {
  const [audienceTab, setAudienceTab] = useState<'students' | 'merchants'>('students');
  const [calculatorInvestment, setCalculatorInvestment] = useState<number>(25000);
  const [calculatorMargin, setCalculatorMargin] = useState<number>(20);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const estimatedAnnualDividend = Math.round(
    calculatorInvestment * (calculatorMargin / 100) * 1.15
  );
  const estimatedBankReturn = Math.round(calculatorInvestment * 0.02);

  return (
    <div className="flex flex-col bg-(--bg) text-(--text)">
      {/* Editorial Hero Band */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 md:pt-24 md:pb-28 border-b border-(--border)">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            {/* Tag / Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1 text-xs text-(--text-secondary)">
              <span className="h-1.5 w-1.5 rounded-full bg-(--accent-primary)" />
              <span className="font-medium text-(--text)">Campus Micro-Investments</span>
              <span className="text-(--text-tertiary)">•</span>
              <span className="font-mono text-[11px] text-(--text-secondary)">
                v0.1.3 Annual Distribution Protocol
              </span>
            </div>

            {/* Display Mega Headline (Weight 400 with negative tracking per Cursor design) */}
            <h1 className="mt-8 text-4xl sm:text-6xl md:text-7xl font-normal tracking-[-0.035em] text-(--text) leading-[1.08]">
              Turn campus spending into <br className="hidden sm:inline" />
              <span className="text-(--accent-primary)">campus wealth.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-(--text-secondary) font-normal leading-relaxed">
              Midas enables students to buy micro-shares in verified campus cafes, print shops, and
              retail stores. Earn annual dividend returns while providing debt-free growth capital
              to your local campus economy.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/student/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  <GraduationCap className="h-4 w-4" />
                  Start Investing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/merchant/register" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Store className="h-4 w-4" />
                  List Your Business
                </Button>
              </Link>
              <Link to="/merchants" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  <Compass className="h-4 w-4" />
                  Explore Marketplace
                </Button>
              </Link>
            </div>

            {/* Hairline trust proofs */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-(--border) pt-6 text-xs text-(--text-secondary)">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#1f8a65]" />
                100% KYC Verified Merchants
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#1f8a65]" />
                Bank-Grade Escrow Security
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-(--accent-primary)" />
                Jan 1 Annual Dividend Payouts
              </span>
            </div>
          </div>

          {/* Cursor In-Product IDE / Engine Mockup Card */}
          <div className="mt-16 mx-auto max-w-5xl rounded-xl border border-(--border) bg-(--bg-secondary) overflow-hidden">
            {/* Editor Top Bar with Action Timeline */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border) bg-(--bg-tertiary) px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-(--border) bg-[#cf2d56]/70" />
                <span className="h-3 w-3 rounded-full border border-(--border) bg-[#c08532]/70" />
                <span className="h-3 w-3 rounded-full border border-(--border) bg-[#1f8a65]/70" />
                <span className="ml-3 flex items-center gap-1.5 font-mono text-xs text-(--text-secondary)">
                  <FileCode2 className="h-3.5 w-3.5 text-(--accent-primary)" />
                  distribution.service.ts
                </span>
              </div>

              {/* Cursor Signature AI Timeline Pastel Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
                <Badge variant="thinking">thinking</Badge>
                <Badge variant="grep">grep kyc</Badge>
                <Badge variant="read">read fiscal_reports</Badge>
                <Badge variant="edit">calc 30% pool</Badge>
                <Badge variant="done">done: ₦38.5M paid</Badge>
              </div>
            </div>

            {/* Split Editor Panes */}
            <div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-(--border)">
              {/* Left Pane: Code & Algorithm */}
              <div className="p-5 font-mono text-xs md:col-span-7 bg-(--bg-secondary) overflow-x-auto">
                <div className="space-y-1 text-(--text-secondary) leading-relaxed">
                  <p className="text-(--text-tertiary)">
                    // Midas Annual Profit Distribution Protocol
                  </p>
                  <p className="text-(--text-tertiary)">
                    // Schedule: Cron 0 0 1 1 * (Annually on Jan 1)
                  </p>
                  <p className="pt-2">
                    <span className="text-(--accent-primary)">const</span> executeAnnualDividends ={' '}
                    <span className="text-(--accent-primary)">async</span> (merchantId) =&gt; &#123;
                  </p>
                  <p className="pl-4">
                    <span className="text-(--accent-primary)">const</span> report ={' '}
                    <span className="text-(--accent-primary)">await</span>{' '}
                    db.annualReport.findVerified(merchantId);
                  </p>
                  <p className="pl-4">
                    <span className="text-(--accent-primary)">const</span> studentPool =
                    report.netProfit * <span className="text-[#1f8a65]">0.30</span>;
                  </p>
                  <p className="pl-4">
                    <span className="text-(--accent-primary)">const</span> merchantRetained =
                    report.netProfit * <span className="text-[#3b82f6]">0.65</span>;
                  </p>
                  <p className="pl-4 text-[#1f8a65]">
                    await studentWallet.creditDividends(merchantId, studentPool);
                  </p>
                  <p className="pl-4 text-(--text-tertiary)">
                    return &#123; status: &apos;SUCCESS&apos;, payoutDate: &apos;01-01&apos; &#125;;
                  </p>
                  <p>&#125;;</p>
                </div>
              </div>

              {/* Right Pane: Live Simulated Inspection */}
              <div className="p-5 md:col-span-5 bg-(--bg-tertiary)/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-(--text-secondary)">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-[#1f8a65]" />
                      Verified Merchant Inspection
                    </span>
                    <Badge variant="success">Active Round</Badge>
                  </div>

                  <div className="mt-4 rounded-lg border border-(--border) bg-(--bg) p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-(--text)">
                        Campus Beanery & Co.
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#1f8a65]">
                        +18.4% APY
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-(--text-secondary)">
                      On Campus • 142 Student Backers
                    </p>

                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] text-(--text-tertiary)">
                        <span>Funded: ₦516,000</span>
                        <span>86% of ₦600k</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--bg-tertiary)">
                        <div
                          className="h-full rounded-full bg-(--accent-primary)"
                          style={{ width: '86%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-(--border) pt-3 flex items-center justify-between text-xs font-mono text-(--text-tertiary)">
                  <span>Unit Share: ₦1,000</span>
                  <span className="text-(--accent-primary)">30% Pool Share Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Stats Band */}
      <section className="border-b border-(--border) bg-(--bg) py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="border-l border-(--border) pl-4">
                <p className="text-2xl sm:text-3xl font-normal tracking-tight text-(--text)">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-(--text-secondary)">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Value Propositions (Students vs Merchants) */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-b border-(--border)">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-(--accent-primary)">
              Campus Alignment
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-normal tracking-tight text-(--text)">
              A platform built for both sides of campus.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-(--text-secondary)">
              Whether growing personal savings as a student or funding business equipment as a
              campus merchant.
            </p>

            {/* Editorial Segmented Switcher */}
            <div className="mt-8 inline-flex rounded-lg border border-(--border) bg-(--bg-secondary) p-1">
              <button
                type="button"
                onClick={() => setAudienceTab('students')}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition-all ${
                  audienceTab === 'students'
                    ? 'bg-(--text) text-(--bg)'
                    : 'text-(--text-secondary) hover:text-(--text)'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                For Students
              </button>
              <button
                type="button"
                onClick={() => setAudienceTab('merchants')}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition-all ${
                  audienceTab === 'merchants'
                    ? 'bg-(--text) text-(--bg)'
                    : 'text-(--text-secondary) hover:text-(--text)'
                }`}
              >
                <Store className="h-3.5 w-3.5" />
                For Merchants
              </button>
            </div>
          </div>

          <div className="mt-14">
            {audienceTab === 'students' ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--border) bg-(--bg-tertiary) text-(--text)">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-(--text)">
                    Low Barrier to Entry
                  </h3>
                  <p className="mt-2 text-sm text-(--text-secondary) leading-relaxed">
                    Start investing with as little as ₦1,000. You don&apos;t need millions to build
                    a diversified portfolio of thriving campus brands.
                  </p>
                  <p className="mt-4 font-mono text-xs text-(--accent-primary)">
                    From ₦1,000 per share →
                  </p>
                </div>

                <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--border) bg-(--bg-tertiary) text-(--text)">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-(--text)">
                    Automated Annual Dividends
                  </h3>
                  <p className="mt-2 text-sm text-(--text-secondary) leading-relaxed">
                    Every January 1st, 30% of each merchant&apos;s net annual profit is distributed
                    directly into your Midas wallet, prorated to your share count.
                  </p>
                  <p className="mt-4 font-mono text-xs text-[#1f8a65]">
                    Jan 1 Automated Distribution →
                  </p>
                </div>

                <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--border) bg-(--bg-tertiary) text-(--text)">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-(--text)">
                    Vetted & Transparent
                  </h3>
                  <p className="mt-2 text-sm text-(--text-secondary) leading-relaxed">
                    Every merchant undergoes multi-stage KYC verification. Review historical
                    performance, operating licenses, and revenue statements before investing.
                  </p>
                  <p className="mt-4 font-mono text-xs text-(--text-secondary)">
                    Full Audit Trail →
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--border) bg-(--bg-tertiary) text-(--text)">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-(--text)">
                    Debt-Free Growth Capital
                  </h3>
                  <p className="mt-2 text-sm text-(--text-secondary) leading-relaxed">
                    Expand inventory, purchase modern equipment, or open new service counters
                    without predatory commercial loans, collateral, or compound interest.
                  </p>
                  <p className="mt-4 font-mono text-xs text-(--accent-primary)">
                    Zero debt obligations →
                  </p>
                </div>

                <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--border) bg-(--bg-tertiary) text-(--text)">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-(--text)">
                    Loyal Student Advocates
                  </h3>
                  <p className="mt-2 text-sm text-(--text-secondary) leading-relaxed">
                    When students own shares in your business, they become your most loyal customers
                    and brand advocates, actively referring classmates to your store.
                  </p>
                  <p className="mt-4 font-mono text-xs text-(--text-secondary)">
                    Organic Campus Growth →
                  </p>
                </div>

                <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--border) bg-(--bg-tertiary) text-(--text)">
                    <Check className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-(--text)">
                    Keep 65% of Profits
                  </h3>
                  <p className="mt-2 text-sm text-(--text-secondary) leading-relaxed">
                    You keep 65% of net profits for operations and reinvestment, 30% rewards your
                    student backers annually, and 5% covers the Midas protocol network.
                  </p>
                  <p className="mt-4 font-mono text-xs text-[#1f8a65]">
                    Transparent 65/30/5 split →
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Annual Dividend Calculator */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-b border-(--border) bg-(--bg-secondary)/30">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-6 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-(--accent-primary)">
                  <Calculator className="inline h-3.5 w-3.5 mr-1" />
                  Interactive Returns Simulator
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-normal tracking-tight text-(--text)">
                  Simulate potential annual dividend returns.
                </h2>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  Adjust capital and profit margin to see projected returns from the 30% annual
                  investor pool.
                </p>

                <div className="mt-8 space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-(--text-secondary)">Your Investment Capital:</span>
                      <span className="font-mono font-semibold text-(--accent-primary)">
                        ₦{calculatorInvestment.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2000"
                      max="200000"
                      step="1000"
                      value={calculatorInvestment}
                      onChange={(e) => setCalculatorInvestment(Number(e.target.value))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-(--bg-tertiary) accent-(--accent-primary)"
                    />
                    <div className="mt-1 flex justify-between font-mono text-[11px] text-(--text-tertiary)">
                      <span>₦2,000</span>
                      <span>₦100,000</span>
                      <span>₦200,000</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-(--text-secondary)">
                        Merchant Annual Net Profit Margin:
                      </span>
                      <span className="font-mono font-semibold text-(--accent-primary)">
                        {calculatorMargin}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="35"
                      step="1"
                      value={calculatorMargin}
                      onChange={(e) => setCalculatorMargin(Number(e.target.value))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-(--bg-tertiary) accent-(--accent-primary)"
                    />
                    <div className="mt-1 flex justify-between font-mono text-[11px] text-(--text-tertiary)">
                      <span>10% (Conservative)</span>
                      <span>20% (Typical Cafe)</span>
                      <span>35% (High Margin Tech)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projection Box */}
              <div className="lg:col-span-5">
                <div className="rounded-lg border border-(--border) bg-(--bg) p-6">
                  <span className="font-mono text-xs text-(--text-tertiary)">
                    Projected Yearly Dividend Return
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-mono text-3xl sm:text-4xl font-normal text-[#1f8a65]">
                      +₦{estimatedAnnualDividend.toLocaleString()}
                    </span>
                    <span className="text-xs text-(--text-secondary)">/ year</span>
                  </div>
                  <p className="mt-1 text-xs text-(--text-secondary)">
                    Distributed automatically on January 1st
                  </p>

                  <div className="mt-6 space-y-2.5 border-t border-(--border) pt-4 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-(--text-secondary)">3-Year Cumulative Return:</span>
                      <span className="text-(--text)">
                        +₦{(estimatedAnnualDividend * 3).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-(--text-secondary)">Idle Bank Savings (~2%):</span>
                      <span className="text-(--text-tertiary)">
                        ₦{estimatedBankReturn.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#1f8a65]">
                      <span>Protocol Advantage:</span>
                      <span>
                        {(estimatedAnnualDividend / Math.max(1, estimatedBankReturn)).toFixed(1)}x
                        higher
                      </span>
                    </div>
                  </div>

                  <Link to="/student/register" className="mt-6 block">
                    <Button className="w-full">
                      Start Earning with ₦{calculatorInvestment.toLocaleString()}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campus Merchants */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-b border-(--border)">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-(--accent-primary)">
                Active Offerings
              </span>
              <h2 className="mt-1 text-3xl font-normal tracking-tight text-(--text)">
                Trending campus merchants.
              </h2>
              <p className="mt-2 text-sm text-(--text-secondary)">
                Explore verified businesses accepting community micro-investments today.
              </p>
            </div>
            <Link to="/merchants">
              <Button variant="secondary" size="sm" className="gap-1.5">
                Browse All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {sampleMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="flex flex-col justify-between rounded-xl border border-(--border) bg-(--bg-secondary) p-6 hover:border-(--text-tertiary) transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Badge variant={merchant.badge === 'Popular' ? 'warning' : 'info'}>
                      {merchant.badge}
                    </Badge>
                    <span className="font-mono text-xs font-semibold text-[#1f8a65]">
                      {merchant.estYield}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-(--text)">{merchant.name}</h3>
                  <p className="mt-1 text-xs text-(--text-secondary)">
                    {merchant.type} • {merchant.proximity}
                  </p>

                  <div className="mt-6 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-(--text-secondary)">Funded</span>
                      <span className="text-(--text)">{merchant.fundedPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--bg-tertiary)">
                      <div
                        className="h-full rounded-full bg-(--accent-primary)"
                        style={{ width: `${merchant.fundedPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-(--text-tertiary)">
                      <span>Target: {merchant.target}</span>
                      <span>{merchant.backers} Backers</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-(--border) pt-3 text-xs font-mono">
                    <span className="text-(--text-secondary)">Share Price:</span>
                    <span className="text-(--text) font-semibold">{merchant.sharePrice}</span>
                  </div>
                </div>

                <Link to="/student/register" className="mt-6 block">
                  <Button variant="secondary" className="w-full">
                    Invest in Shares
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 65 / 30 / 5 Economic Model */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-b border-(--border) bg-(--bg-secondary)/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-(--accent-primary)">
              Protocol Economics
            </span>
            <h2 className="mt-1 text-3xl font-normal tracking-tight text-(--text)">
              The 65 / 30 / 5 annual model.
            </h2>
            <p className="mt-2 text-sm text-(--text-secondary)">
              Every naira of annual merchant profit is cleanly structured.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-6">
              <span className="font-mono text-3xl font-normal text-(--text)">65%</span>
              <h3 className="mt-3 text-base font-semibold text-(--text)">Retained by Merchant</h3>
              <p className="mt-2 text-xs text-(--text-secondary) leading-relaxed">
                Directly retained by the business owner for restocking inventory, operational
                cashflow, equipment maintenance, and employee payroll.
              </p>
            </div>

            <div className="rounded-xl border border-(--accent-primary) bg-(--bg-secondary) p-6">
              <span className="font-mono text-3xl font-normal text-(--accent-primary)">30%</span>
              <h3 className="mt-3 text-base font-semibold text-(--text)">Student Investor Pool</h3>
              <p className="mt-2 text-xs text-(--text-secondary) leading-relaxed">
                Deposited automatically into the dividend distribution pool and credited to student
                investors every January 1st according to their share count.
              </p>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-6">
              <span className="font-mono text-3xl font-normal text-[#1f8a65]">5%</span>
              <h3 className="mt-3 text-base font-semibold text-(--text)">Protocol Operations</h3>
              <p className="mt-2 text-xs text-(--text-secondary) leading-relaxed">
                Allocated to ongoing KYC merchant verification, financial fraud monitoring, payment
                escrow, and continuous server reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-b border-(--border)">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-(--accent-primary)">
              Clarifications
            </span>
            <h2 className="mt-1 text-3xl font-normal tracking-tight text-(--text)">
              Frequently asked questions.
            </h2>
            <p className="mt-2 text-sm text-(--text-secondary)">
              Everything you need to know about investing and listing on Midas.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-lg border border-(--border) bg-(--bg-secondary) overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-(--text) hover:bg-(--bg-tertiary) transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-(--text-secondary) transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-(--accent-primary)' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="border-t border-(--border) p-4 text-xs sm:text-sm text-(--text-secondary) leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-Footer CTA Band (96px padding per Cursor design) */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 text-center bg-(--bg)">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-(--text)">
            Start building campus wealth today.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-(--text-secondary)">
            Join hundreds of student investors and verified merchants shaping the future of campus
            commerce.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/student/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                <GraduationCap className="h-4 w-4" />
                Join as Student Investor
              </Button>
            </Link>
            <Link to="/merchant/register" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Store className="h-4 w-4" />
                Apply as Campus Merchant
              </Button>
            </Link>
          </div>

          <p className="mt-6 font-mono text-[11px] text-(--text-tertiary)">
            Instant account setup • Jan 1 annual distribution schedule
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
