import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Flag, MapPin, ShieldCheck, Tag } from 'lucide-react'
import { useShop } from '../hooks/queries'
import DiscountBadge from '../components/DiscountBadge'
import OfferCard from '../components/OfferCard'
import ProductRow from '../components/ProductRow'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { DetailSkeleton } from '../components/Skeleton'

function MetaItem({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
      <Icon size={15} className="shrink-0 text-faint" aria-hidden="true" />
      {children}
    </span>
  )
}

export default function ShopDetailPage() {
  const { id } = useParams()
  const shopQuery = useShop(id)

  if (shopQuery.isLoading) {
    return (
      <div className="animate-fade-in pt-5">
        <DetailSkeleton />
      </div>
    )
  }

  if (shopQuery.isError) {
    return (
      <div className="animate-fade-in pt-5">
        <ErrorState title="Couldn't load this shop" onRetry={shopQuery.refetch} />
      </div>
    )
  }

  const { shop, products = [], offers = [] } = shopQuery.data || {}

  if (!shop) {
    return (
      <div className="animate-fade-in pt-5">
        <EmptyState icon={MapPin} title="Shop not found" description="This shop may have been removed." />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <header className="pb-5 pt-5">
        <Link
          to="/"
          className="mb-3 inline-flex h-8 items-center gap-1 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          All places
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-ink">{shop.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              <MetaItem icon={MapPin}>
                {[shop.place?.name, shop.floorUnit].filter(Boolean).join(' · ') || '—'}
              </MetaItem>
              <MetaItem icon={Clock}>{shop.openingHours || 'Hours not set'}</MetaItem>
              <MetaItem icon={Tag}>{shop.category || '—'}</MetaItem>
            </div>
          </div>
          <DiscountBadge value={shop.bestDiscountToday} size="lg" />
        </div>
      </header>

      {/* Trust + report placeholder (backend not implemented yet) */}
      <div className="mb-6 flex items-center justify-between gap-3 rounded-card border border-line bg-paper p-3">
        <span className="flex items-center gap-2 text-sm text-muted">
          <ShieldCheck size={17} className="shrink-0 text-accent-700" aria-hidden="true" />
          Trust score <strong className="font-semibold text-ink">{shop.trustScore ?? 100}</strong>
        </span>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Coming soon"
          className="inline-flex h-10 cursor-not-allowed items-center gap-1.5 rounded-full border border-line px-3.5 text-sm font-medium text-faint"
        >
          <Flag size={14} aria-hidden="true" />
          Report offer
          <span className="rounded-full bg-line px-1.5 py-0.5 text-[10px] font-semibold uppercase text-faint">
            Soon
          </span>
        </button>
      </div>

      {/* Active offers */}
      <section className="mb-6" aria-labelledby="offers-heading">
        <h2 id="offers-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Active offers
        </h2>
        {offers.length > 0 ? (
          <ul className="space-y-3">
            {offers.map((offer) => (
              <OfferCard key={offer._id} offer={offer} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Tag}
            title="No active offers"
            description="This shop has nothing on offer right now."
          />
        )}
      </section>

      {/* Products */}
      <section aria-labelledby="products-heading">
        <h2 id="products-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Products
        </h2>
        {products.length > 0 ? (
          <ul className="space-y-3">
            {products.map((product) => (
              <ProductRow key={product._id} product={product} />
            ))}
          </ul>
        ) : (
          <EmptyState icon={Tag} title="No products listed" description="This shop has not added products yet." />
        )}
      </section>
    </div>
  )
}
