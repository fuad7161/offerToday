import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Store } from 'lucide-react'
import { usePlaces, usePlaceShops, usePlaceStats } from '../hooks/queries'
import ShopCard from '../components/ShopCard'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { ShopListSkeleton } from '../components/Skeleton'

export default function PlaceViewPage() {
  const { id } = useParams()

  const [category, setCategory] = useState(null)
  const [minDiscount, setMinDiscount] = useState(null)
  const [activeOnly, setActiveOnly] = useState(false)

  const filters = useMemo(() => {
    const f = {}
    if (category) f.category = category
    if (minDiscount != null) f.minDiscount = minDiscount
    if (activeOnly) f.activeOnly = 'true'
    return f
  }, [category, minDiscount, activeOnly])

  const placesQuery = usePlaces()
  const statsQuery = usePlaceStats(id)
  const shopsQuery = usePlaceShops(id, filters)

  const place = placesQuery.data?.find((p) => p._id === id)
  const shops = shopsQuery.data || []
  const offerCount = statsQuery.data?.offerCount ?? 0
  const categories = statsQuery.data?.categories ?? []
  const hasActiveFilters = category != null || minDiscount != null || activeOnly

  const clearFilters = () => {
    setCategory(null)
    setMinDiscount(null)
    setActiveOnly(false)
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="pb-4 pt-5">
        <Link
          to="/"
          className="mb-3 inline-flex h-8 items-center gap-1 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          All places
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{place?.name ?? '…'}</h1>
        <p className="mt-1 text-sm text-muted">
          {offerCount} {offerCount === 1 ? 'shop' : 'shops'} with offers today
        </p>
      </header>

      <FilterBar
        categories={categories}
        activeCategory={category}
        minDiscount={minDiscount}
        activeOnly={activeOnly}
        onCategoryChange={setCategory}
        onMinDiscountChange={setMinDiscount}
        onActiveOnlyChange={setActiveOnly}
      />

      <div className="py-4">
        {hasActiveFilters && !shopsQuery.isLoading && !shopsQuery.isError && (
          <p className="mb-3 text-sm text-muted">
            Showing {shops.length} {shops.length === 1 ? 'shop' : 'shops'}
          </p>
        )}

        {shopsQuery.isLoading && <ShopListSkeleton />}

        {shopsQuery.isError && (
          <ErrorState
            title="Couldn't load shops"
            onRetry={shopsQuery.refetch}
          />
        )}

        {!shopsQuery.isLoading && !shopsQuery.isError && shops.length === 0 && (
          <EmptyState
            icon={Store}
            title={hasActiveFilters ? 'No shops match your filters' : 'No shops here yet'}
            description={
              hasActiveFilters
                ? 'Try widening the filters to see more shops.'
                : 'This place has no shops listed right now.'
            }
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Clear filters
                </button>
              ) : null
            }
          />
        )}

        {!shopsQuery.isLoading && !shopsQuery.isError && shops.length > 0 && (
          <ol className="space-y-3">
            {shops.map((shop, i) => (
              <li key={shop._id} className="animate-fade-in">
                <ShopCard
                  shop={shop}
                  rank={i + 1}
                  isTop={i === 0 && Number(shop.bestDiscountToday) > 0}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
