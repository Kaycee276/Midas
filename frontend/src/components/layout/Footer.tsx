import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-(--border) bg-(--bg) py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-(--accent-primary)" />
            <span className="text-lg font-semibold tracking-tight text-(--text)">Midas</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-(--text-secondary) leading-relaxed">
            The student-powered campus merchant investment protocol. Transparent annual dividend
            distributions backed by verified local economies.
          </p>
          <div className="mt-6 flex items-center gap-2 font-mono text-xs text-(--text-tertiary)">
            <span className="h-2 w-2 rounded-full bg-[#1f8a65]" />
            <span>Network status: Operational (v0.1.3)</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-(--text)">Platform</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-(--text-secondary)">
            <li>
              <Link to="/merchants" className="hover:text-(--text) transition-colors">
                Marketplace
              </Link>
            </li>
            <li>
              <Link to="/student/register" className="hover:text-(--text) transition-colors">
                Student Investing
              </Link>
            </li>
            <li>
              <Link to="/merchant/register" className="hover:text-(--text) transition-colors">
                Merchant Listing
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-(--text)">
            Economics
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-(--text-secondary)">
            <li className="text-(--text-secondary)">65% Merchant Retained</li>
            <li className="text-(--text-secondary)">30% Annual Investor Pool</li>
            <li className="text-(--text-secondary)">5% Platform Protocol</li>
            <li className="text-(--text-tertiary) text-xs">Jan 1 Distribution Cycle</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-(--text)">Account</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-(--text-secondary)">
            <li>
              <Link to="/student/login" className="hover:text-(--text) transition-colors">
                Student Login
              </Link>
            </li>
            <li>
              <Link to="/merchant/login" className="hover:text-(--text) transition-colors">
                Merchant Login
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-(--text) transition-colors">
                Compliance Review
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-(--border) pt-6 text-xs text-(--text-tertiary) sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Midas Network. Built for campus economies.</p>
        <div className="flex gap-6">
          <span className="hover:text-(--text) cursor-pointer">Security & Audits</span>
          <span className="hover:text-(--text) cursor-pointer">KYC Standards</span>
          <span className="hover:text-(--text) cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
