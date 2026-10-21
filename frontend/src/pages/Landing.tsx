import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  Users,
  ArrowRight,
  Store,
  GraduationCap,
  CheckCircle2,
  DollarSign,
  Sparkles,
  ChevronDown,
  Building2,
  PieChart,
  Calendar,
  Wallet,
  Compass,
  ArrowUpRight,
  Calculator,
  Lock,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const stats = [
  { label: 'Active Student Investors', value: '1,450+', icon: Users },
  { label: 'Verified Campus Businesses', value: '48+', icon: Store },
  { label: 'Total Micro-Capital Funded', value: '₦38.5M', icon: DollarSign },
  { label: 'Payout Schedule', value: 'Annual (Jan 1)', icon: Calendar },
];

const sampleMerchants = [
  {
    id: 'demo-1',
    name: 'Campus Beanery & Co.',
    type: 'Cafe & Bakery',
    proximity: 'On Campus (Library Walk)',
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
    type: 'Printing & Tech',
    proximity: 'Within 500m (Student Center)',
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
    type: 'Food & Dining',
    proximity: 'Within 1km (Hostel Gate B)',
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

  // Simple dividend projection: (investment * margin% * 30% pool share bonus factor)
  const estimatedAnnualDividend = Math.round(
    calculatorInvestment * (calculatorMargin / 100) * 1.15
  );
  const estimatedBankReturn = Math.round(calculatorInvestment * 0.02);

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-full -translate-x-1/2 max-w-7xl rounded-full bg-(--accent-primary)/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Headline and Call-to-actions */}
            <div className="text-center lg:col-span-7 lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1.5 text-xs font-medium text-(--text-secondary)">
                <span className="flex h-2 w-2 rounded-full bg-(--accent-primary) animate-pulse" />
                <span className="text-(--text) font-semibold">Campus Micro-Investments</span>
                <span className="text-(--text-tertiary)">•</span>
                <span>Annual Dividends</span>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-(--text) sm:text-5xl md:text-6xl">
                Turn Campus Spending into{' '}
                <span className="bg-gradient-to-r from-(--accent-primary) via-red-500 to-amber-500 bg-clip-text text-transparent">
                  Campus Wealth
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base text-(--text-secondary) sm:text-lg md:text-xl lg:mx-0 mx-auto">
                Midas enables students to buy micro-shares in verified campus cafes, print shops,
                and retail stores. Earn annual dividend returns while providing debt-free growth
                capital to your local campus economy.
              </p>

              {/* Action buttons */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link to="/student/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto shadow-lg shadow-(--accent-primary)/20"
                  >
                    <GraduationCap className="h-5 w-5" />
                    Start Investing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/merchant/register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Store className="h-5 w-5" />
                    List Your Business
                  </Button>
                </Link>
                <Link to="/merchants" className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full sm:w-auto text-(--text-secondary)"
                  >
                    <Compass className="h-5 w-5" />
                    Explore Marketplace
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-(--border) pt-6 text-xs text-(--text-tertiary) lg:justify-start">
                <span className="flex items-center gap-1.5 font-medium">
                  <Shield className="h-4 w-4 text-(--success)" /> 100% KYC Verified Merchants
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Lock className="h-4 w-4 text-(--success)" /> Bank-Grade Security
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-4 w-4 text-(--accent-primary)" /> Jan 1st Annual Payouts
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual Card Mockup */}
            <div className="relative mx-auto w-full max-w-md lg:col-span-5">
              <div className="relative rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 shadow-2xl backdrop-blur-sm">
                {/* Header of simulated card */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-md bg-(--accent-primary)/10 px-2 py-0.5 text-xs font-semibold text-(--accent-primary)">
                      Featured Opportunity
                    </span>
                    <h2 className="mt-2 text-xl font-bold text-(--text)">Campus Beanery & Co.</h2>
                    <p className="text-xs text-(--text-secondary)">Library Annex, Main Campus</p>
                  </div>
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> KYC Verified
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-(--text-secondary)">Funding Progress</span>
                    <span className="text-(--accent-primary) font-bold">86% Funded</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-(--bg-tertiary)">
                    <div
                      className="h-full rounded-full bg-(--accent-primary)"
                      style={{ width: '86%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-(--text-tertiary)">
                    <span>₦516,000 raised</span>
                    <span>Target: ₦600,000</span>
                  </div>
                </div>

                {/* Key Metrics grid inside card */}
                <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-(--border) bg-(--bg) p-3">
                  <div>
                    <span className="text-[11px] text-(--text-tertiary)">Share Unit Price</span>
                    <p className="text-sm font-bold text-(--text)">₦1,000 / share</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-(--text-tertiary)">Est. Annual Dividend</span>
                    <p className="text-sm font-bold text-(--success)">+18.4% APY</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-(--text-tertiary)">Student Investors</span>
                    <p className="text-sm font-bold text-(--text)">142 Backers</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-(--text-tertiary)">Payout Cycle</span>
                    <p className="text-sm font-bold text-(--accent-primary)">Yearly (Jan 1)</p>
                  </div>
                </div>

                {/* Mini Action inside mockup */}
                <Link to="/student/register" className="mt-5 block">
                  <Button className="w-full" size="md">
                    Invest in this Merchant
                  </Button>
                </Link>

                {/* Floating overlay chip 1 */}
                <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-(--border) bg-(--bg) p-3 shadow-xl sm:flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-(--text-tertiary)">Annual Dividend Received</p>
                    <p className="text-xs font-bold text-green-500">+₦42,500.00</p>
                  </div>
                </div>

                {/* Floating overlay chip 2 */}
                <div className="absolute -top-4 -right-4 hidden rounded-xl border border-(--border) bg-(--bg) p-2.5 shadow-xl sm:flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold text-(--text)">30% Net Profit Pool</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="border-y border-(--border) bg-(--bg-secondary)/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="text-center md:text-left">
                <div className="flex items-center justify-center gap-2 md:justify-start text-(--accent-primary)">
                  <item.icon className="h-5 w-5" />
                  <p className="text-2xl font-extrabold text-(--text) sm:text-3xl">{item.value}</p>
                </div>
                <p className="mt-1 text-xs text-(--text-secondary) sm:text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Value Switcher (Students vs Merchants) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-(--text) sm:text-4xl">
            A Platform Built for the Entire Campus
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-(--text-secondary) sm:text-base">
            Whether you want to build passive income while studying or scale your campus retail
            business with student capital, Midas is tailor-made for you.
          </p>

          {/* Interactive Role Switcher */}
          <div className="mt-8 inline-flex rounded-xl border border-(--border) bg-(--bg-secondary) p-1">
            <button
              type="button"
              onClick={() => setAudienceTab('students')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                audienceTab === 'students'
                  ? 'bg-(--accent-primary) text-white shadow-md'
                  : 'text-(--text-secondary) hover:text-(--text)'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              For Students
            </button>
            <button
              type="button"
              onClick={() => setAudienceTab('merchants')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                audienceTab === 'merchants'
                  ? 'bg-(--accent-primary) text-white shadow-md'
                  : 'text-(--text-secondary) hover:text-(--text)'
              }`}
            >
              <Store className="h-4 w-4" />
              For Merchants
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-12">
          {audienceTab === 'students' ? (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 transition-all hover:border-(--accent-primary)/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--accent-primary)/10 text-(--accent-primary)">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-(--text)">Low Barrier to Entry</h3>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  Start investing with as little as ₦1,000. You don&apos;t need millions to build a
                  diversified portfolio of thriving campus brands.
                </p>
                <div className="mt-4 text-xs font-semibold text-(--accent-primary)">
                  From ₦1,000 min investment →
                </div>
              </div>

              <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 transition-all hover:border-(--accent-primary)/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-(--text)">Automated Annual Dividends</h3>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  Every January 1st, 30% of each merchant&apos;s net annual profit is distributed
                  directly into your Midas wallet, prorated to your share count.
                </p>
                <div className="mt-4 text-xs font-semibold text-green-500">
                  Annual payout schedule →
                </div>
              </div>

              <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 transition-all hover:border-(--accent-primary)/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-(--text)">Vetted & Transparent</h3>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  Every merchant undergoes stringent multi-stage KYC verification. Review historical
                  performance and business updates before committing.
                </p>
                <div className="mt-4 text-xs font-semibold text-blue-500">
                  Audited reports & KYC checked →
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 transition-all hover:border-(--accent-primary)/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--accent-primary)/10 text-(--accent-primary)">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-(--text)">Debt-Free Growth Capital</h3>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  Expand inventory, upgrade store facilities, or open new branches without the
                  burden of crippling commercial bank loans or compound interest.
                </p>
                <div className="mt-4 text-xs font-semibold text-(--accent-primary)">
                  Zero loan collateral required →
                </div>
              </div>

              <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 transition-all hover:border-(--accent-primary)/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-(--text)">Loyal Student Advocates</h3>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  When students own shares in your business, they become your most loyal customers
                  and brand evangelists, actively driving friends to your store.
                </p>
                <div className="mt-4 text-xs font-semibold text-amber-500">
                  Instant community viral loop →
                </div>
              </div>

              <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 transition-all hover:border-(--accent-primary)/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                  <PieChart className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-(--text)">Keep 65% of Profits</h3>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  You retain 65% of net profits for operations, while 30% rewards your student
                  backers annually and 5% maintains the Midas compliance network.
                </p>
                <div className="mt-4 text-xs font-semibold text-green-500">
                  Fair, transparent economics →
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Annual Dividend Calculator */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-(--border) bg-gradient-to-br from-(--bg-secondary) to-(--bg) p-6 sm:p-10 shadow-xl">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left Controls */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--accent-primary)">
                <Calculator className="h-4 w-4" />
                Interactive Returns Simulator
              </div>
              <h2 className="mt-2 text-2xl font-bold text-(--text) sm:text-3xl">
                See How Much Your Capital Could Earn
              </h2>
              <p className="mt-3 text-sm text-(--text-secondary)">
                Simulate potential annual dividend returns when backing profitable campus businesses
                participating in the 30% profit-sharing pool.
              </p>

              <div className="mt-8 space-y-6">
                {/* Investment amount slider */}
                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-(--text)">Your Investment Capital:</span>
                    <span className="text-(--accent-primary) font-mono text-base">
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
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-(--bg-tertiary) accent-(--accent-primary)"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-(--text-tertiary)">
                    <span>₦2,000 (Starter)</span>
                    <span>₦100,000 (Moderate)</span>
                    <span>₦200,000 (Power Investor)</span>
                  </div>
                </div>

                {/* Margin slider */}
                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-(--text)">Merchant Annual Net Profit Margin:</span>
                    <span className="text-(--accent-primary) font-mono text-base">
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
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-(--bg-tertiary) accent-(--accent-primary)"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-(--text-tertiary)">
                    <span>10% (Conservative)</span>
                    <span>20% (Typical Campus Cafe)</span>
                    <span>35% (High Margin Tech/Print)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Projection Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-(--border) bg-(--bg) p-6 shadow-md">
                <span className="text-xs font-semibold text-(--text-tertiary)">
                  Projected Yearly Dividend Return
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-(--success) sm:text-4xl">
                    +₦{estimatedAnnualDividend.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-(--text-secondary)">/ year</span>
                </div>
                <p className="mt-1 text-xs text-(--text-tertiary)">
                  Prorated from the 30% annual student investor pool
                </p>

                <div className="mt-6 space-y-3 border-t border-(--border) pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-(--text-secondary)">Est. 3-Year Cumulative Return:</span>
                    <span className="font-bold text-(--text)">
                      +₦{(estimatedAnnualDividend * 3).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-(--text-secondary)">Idle Bank Savings (est. ~2%):</span>
                    <span className="font-medium text-(--text-tertiary)">
                      ₦{estimatedBankReturn.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-(--accent-primary)">
                    <span>Midas Advantage:</span>
                    <span>
                      {(estimatedAnnualDividend / Math.max(1, estimatedBankReturn)).toFixed(1)}x
                      Higher
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
      </section>

      {/* Featured Campus Merchants Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-(--accent-primary)">
              Verified Opportunities
            </span>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-(--text)">
              Trending Campus Merchants
            </h2>
            <p className="mt-2 text-sm text-(--text-secondary)">
              Explore real businesses raising growth capital right now across student communities.
            </p>
          </div>
          <Link to="/merchants">
            <Button variant="outline" size="sm" className="gap-1.5">
              Browse All Merchants
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {sampleMerchants.map((merchant) => (
            <div
              key={merchant.id}
              className="flex flex-col justify-between rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 transition-all hover:border-(--accent-primary)/50 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant={merchant.badge === 'Popular' ? 'warning' : 'info'}>
                    {merchant.badge}
                  </Badge>
                  <span className="text-xs font-bold text-(--success)">{merchant.estYield}</span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-(--text)">{merchant.name}</h3>
                <p className="text-xs text-(--text-secondary)">
                  {merchant.type} • {merchant.proximity}
                </p>

                {/* Progress bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-(--text-secondary)">Progress</span>
                    <span className="font-bold text-(--text)">{merchant.fundedPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-(--bg-tertiary)">
                    <div
                      className="h-full rounded-full bg-(--accent-primary)"
                      style={{ width: `${merchant.fundedPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-(--text-tertiary)">
                    <span>Target: {merchant.target}</span>
                    <span>{merchant.backers} Backers</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-(--border) pt-3 text-xs">
                  <span className="text-(--text-secondary)">Share Price:</span>
                  <span className="font-bold text-(--text)">{merchant.sharePrice}</span>
                </div>
              </div>

              <Link to="/student/register" className="mt-6 block">
                <Button variant="outline" className="w-full">
                  Invest Now
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* The 65 / 30 / 5 Economic Model */}
      <section className="border-y border-(--border) bg-(--bg-secondary)/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-(--accent-primary)">
              Uncompromising Transparency
            </span>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-(--text) sm:text-4xl">
              The 65 / 30 / 5 Annual Revenue Model
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-(--text-secondary) sm:text-base">
              Every naira of merchant annual net profit is accounted for. No hidden management fees,
              no confusing dilution, and zero guesswork.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-(--border) bg-(--bg) p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--accent-primary)/10 text-2xl font-black text-(--accent-primary)">
                65%
              </div>
              <h3 className="mt-4 text-lg font-bold text-(--text)">Retained by Merchant</h3>
              <p className="mt-2 text-xs text-(--text-secondary) sm:text-sm">
                Kept directly by the merchant owner for operational cashflow, restocking inventory,
                employee wages, and sustained campus growth.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-(--success)/40 bg-(--bg) p-6 text-center shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-2xl font-black text-green-500">
                30%
              </div>
              <h3 className="mt-4 text-lg font-bold text-(--text)">Student Investor Pool</h3>
              <p className="mt-2 text-xs text-(--text-secondary) sm:text-sm">
                Deposited automatically into the dividend pool and distributed to student
                shareholders proportionally on January 1st every year.
              </p>
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--bg) p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl font-black text-blue-500">
                5%
              </div>
              <h3 className="mt-4 text-lg font-bold text-(--text)">Midas Platform Fee</h3>
              <p className="mt-2 text-xs text-(--text-secondary) sm:text-sm">
                Reinvested into automated compliance checks, continuous merchant KYC verification,
                fraud monitoring, and secure payment rail upkeep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-(--accent-primary)">
            Simple Onboarding
          </span>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-(--text) sm:text-4xl">
            How Midas Works in 3 Steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-(--text-secondary) sm:text-base">
            From discovering campus opportunities to collecting your first annual dividend check.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="relative rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--accent-primary) font-black text-white">
              1
            </div>
            <h3 className="mt-4 text-lg font-bold text-(--text)">Discover & Verify</h3>
            <p className="mt-2 text-sm text-(--text-secondary)">
              Browse verified campus merchants near your dorm or department. Examine their track
              record, business model, and share unit price.
            </p>
          </div>

          <div className="relative rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--accent-primary) font-black text-white">
              2
            </div>
            <h3 className="mt-4 text-lg font-bold text-(--text)">Invest Micro-Capital</h3>
            <p className="mt-2 text-sm text-(--text-secondary)">
              Fund your student wallet instantly and purchase shares. Track your growing portfolio,
              equity units, and backing history in real-time.
            </p>
          </div>

          <div className="relative rounded-2xl border border-(--border) bg-(--bg-secondary) p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--accent-primary) font-black text-white">
              3
            </div>
            <h3 className="mt-4 text-lg font-bold text-(--text)">Collect Annual Dividends</h3>
            <p className="mt-2 text-sm text-(--text-secondary)">
              Every year on January 1st, profit dividends land directly in your wallet. Reinvest or
              withdraw instantly to your personal bank account.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-(--accent-primary)">
            Got Questions?
          </span>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-(--text)">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-(--text-secondary)">
            Everything you need to know about investing and listing on Midas.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="rounded-xl border border-(--border) bg-(--bg-secondary) overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-(--text) hover:bg-(--bg-tertiary)"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-(--text-secondary) transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-(--accent-primary)' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="border-t border-(--border) p-5 pt-3 text-sm text-(--text-secondary) leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Mega CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-(--border) bg-gradient-to-r from-(--bg-secondary) via-(--bg-tertiary) to-(--bg-secondary) px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-(--accent-primary)/20 blur-3xl" />
          <div className="pointer-events-none absolute -top-10 -left-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

          <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-tight text-(--text) sm:text-4xl md:text-5xl">
            Start Building Wealth on Your Campus Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-(--text-secondary)">
            Join thousands of student investors and verified merchants shaping the future of campus
            commerce and micro-equity.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/student/register">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-(--accent-primary)/25">
                <GraduationCap className="h-5 w-5" />
                Join as Student Investor
              </Button>
            </Link>
            <Link to="/merchant/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Building2 className="h-5 w-5" />
                Apply as Campus Merchant
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-(--text-tertiary)">
            Instant account creation • Zero subscription fees • Annual scheduled distributions
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
