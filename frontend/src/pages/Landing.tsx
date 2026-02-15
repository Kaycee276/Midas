import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Users, ArrowRight, Store, GraduationCap, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const features = [
  { icon: TrendingUp, title: 'Smart Investments', desc: 'Invest in verified campus merchants with transparent returns and real-time portfolio tracking.' },
  { icon: Shield, title: 'KYC Verified', desc: 'Every merchant undergoes rigorous identity and business verification before accepting investments.' },
  { icon: Users, title: 'Student-Powered', desc: 'Built for students to grow their money by supporting businesses they already use every day.' },
];

const steps = [
  { step: '01', title: 'Sign Up', desc: 'Create your student or merchant account in minutes.' },
  { step: '02', title: 'Get Verified', desc: 'Merchants complete KYC. Students browse verified businesses.' },
  { step: '03', title: 'Invest & Grow', desc: 'Students invest in merchants and track portfolio performance.' },
];

const Landing = () => (
  <div>
    {/* Hero */}
    <section className="relative overflow-hidden px-4 py-24 md:py-32">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text)] md:text-6xl">
          Invest in Campus<br />
          <span className="text-[var(--accent-primary)]">Businesses You Trust</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-secondary)]">
          Midas connects students with verified campus merchants for micro-investments.
          Grow your portfolio while supporting the businesses that power your campus life.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/student/register">
            <Button size="lg">
              <GraduationCap className="h-5 w-5" />
              Start Investing
            </Button>
          </Link>
          <Link to="/merchant/register">
            <Button variant="outline" size="lg">
              <Store className="h-5 w-5" />
              List Your Business
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="border-t border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold text-[var(--text)]">Why Midas?</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-6">
              <f.icon className="h-10 w-10 text-[var(--accent-primary)]" />
              <h3 className="mt-4 text-lg font-semibold text-[var(--text)]">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold text-[var(--text)]">How It Works</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-primary)]/10 text-2xl font-bold text-[var(--accent-primary)]">
                {s.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--text)]">{s.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="border-t border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-[var(--text)]">Ready to Get Started?</h2>
        <p className="mt-4 text-[var(--text-secondary)]">
          Join hundreds of students already investing in campus businesses through Midas.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link to="/merchants">
            <Button size="lg">
              Browse Merchants
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-[var(--success)]" /> KYC Verified</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-[var(--success)]" /> Secure</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-[var(--success)]" /> Transparent</span>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Landing;
