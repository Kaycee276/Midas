import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Store } from 'lucide-react';
import { listMerchants } from '../../api/public';
import type { Merchant, Pagination } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const businessTypeOptions = [
  'restaurant', 'cafe', 'food_truck', 'retail', 'bookstore', 'laundry',
  'salon', 'gym', 'tutoring', 'printing', 'electronics', 'clothing', 'other',
].map((v) => ({ value: v, label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }));

const proximityOptions = [
  { value: 'on_campus', label: 'On Campus' },
  { value: 'within_1km', label: 'Within 1km' },
  { value: 'within_2km', label: 'Within 2km' },
  { value: 'within_5km', label: 'Within 5km' },
  { value: 'more_than_5km', label: 'More than 5km' },
];

const formatProximity = (p: string) => proximityOptions.find((o) => o.value === p)?.label || p;

const MerchantList = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [proximity, setProximity] = useState('');
  const [page, setPage] = useState(1);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const { data } = await listMerchants({
        page, limit: 12,
        search: search || undefined,
        business_type: businessType || undefined,
        proximity: proximity || undefined,
      });
      setMerchants(data.data.merchants);
      setPagination(data.data.pagination);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMerchants(); }, [page, businessType, proximity]);

  const handleSearch = () => { setPage(1); fetchMerchants(); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text)">Browse Merchants</h1>
        <p className="mt-2 text-(--text-secondary)">Discover verified campus businesses to invest in</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input placeholder="Search merchants..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              </div>
              <Button onClick={handleSearch}><Search className="h-4 w-4" /></Button>
            </div>
          </div>
          <Select options={businessTypeOptions} value={businessType} onChange={(e) => { setBusinessType(e.target.value); setPage(1); }} placeholder="All Types" />
          <Select options={proximityOptions} value={proximity} onChange={(e) => { setProximity(e.target.value); setPage(1); }} placeholder="Any Distance" />
        </div>
      </Card>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : merchants.length === 0 ? (
        <div className="py-20 text-center text-(--text-secondary)">
          <Store className="mx-auto h-12 w-12 text-(--text-tertiary)" />
          <p className="mt-4">No merchants found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {merchants.map((m) => (
              <Link key={m.id} to={`/merchants/${m.id}`}>
                <Card className="h-full transition-colors hover:border-(--accent-primary)">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-(--text)">{m.business_name}</h3>
                    <Badge>{m.business_type.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-(--text-secondary)">{m.business_description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-(--text-tertiary)">
                    <MapPin className="h-3 w-3" />
                    {formatProximity(m.proximity_to_campus)}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-(--text-secondary)">Page {page} of {pagination.total_pages}</span>
              <Button variant="outline" size="sm" disabled={page >= pagination.total_pages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MerchantList;
