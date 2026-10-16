import { useEffect, useMemo, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { useAllProducts, useProducts } from '../hooks/queries'
import DiscountBadge from '../components/DiscountBadge'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { ShopListSkeleton } from '../components/Skeleton'
import { formatPrice, discountedPrice } from '../lib/format'

function ResultRow({ product }) {
  const discount = Number(product.bestDiscountToday) || 0
  const hasOffer = discount > 0
  const shop = product.shop || {}

  return (
    <li className="rounded-card border border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-ink">{product.name}</h3>
          <p className="mt-0.5 truncate text-sm text-faint">
            {[product.brand, product.category].filter(Boolean).join(' · ')}
          </p>
        </div>
        <DiscountBadge value={product.bestDiscountToday} size="sm" />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted">
          <MapPin size={14} className="shrink-0 text-faint" aria-hidden="true" />
          <span className="truncate">
            {[shop.name, shop.floorUnit].filter(Boolean).join(' · ') || '—'}
          </span>
        </span>
        {hasOffer && (
          <span className="shrink-0 text-sm font-semibold text-accent-700">
            {formatPrice(discountedPrice(product.regularPrice, discount))}
          </span>
        )}
      </div>
    </li>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  const allProductsQuery = useAllProducts()
  const resultsQuery = useProducts(debounced ? { q: debounced } : {})

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const brands = useMemo(() => {
    const set = new Set()
    for (const p of allProductsQuery.data || []) {
      if (p.brand) set.add(p.brand)
    }
    return [...set].slice(0, 8)
  }, [allProductsQuery.data])

  const isIdle = !debounced
  const results = resultsQuery.data || []

  return (
    <div className="animate-fade-in pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Search</h1>
        <p className="mt-1 text-sm text-muted">Find shops discounting a brand or product.</p>
      </header>

      {/* Search field */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a brand or product"
          aria-label="Search brands and products"
          className="w-full rounded-card border border-line bg-paper pl-11 pr-11 text-base text-ink shadow-card placeholder:text-faint focus:border-accent-600"
          style={{ height: '52px' }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-faint transition hover:bg-line hover:text-ink"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Browse by brand (derived from real data, no hardcoding) */}
      {isIdle && (
        <section aria-label="Browse by brand" className="mb-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Popular brands
          </h2>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setQuery(brand)}
                className="h-9 shrink-0 whitespace-nowrap rounded-full border border-line bg-paper px-3.5 text-sm font-medium text-muted transition hover:border-accent-600 hover:text-accent-700"
              >
                {brand}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Idle state */}
      {isIdle && (
        <EmptyState
          icon={Search}
          title="Start typing to search"
          description="Search by brand (Nike) or product (Galaxy A55)."
        />
      )}

      {/* Loading */}
      {!isIdle && resultsQuery.isLoading && <ShopListSkeleton />}

      {/* Error */}
      {!isIdle && resultsQuery.isError && (
        <ErrorState title="Search failed" onRetry={resultsQuery.refetch} />
      )}

      {/* Results */}
      {!isIdle && !resultsQuery.isLoading && !resultsQuery.isError && results.length === 0 && (
        <EmptyState
          icon={Search}
          title={`No results for “${debounced}”`}
          description="Try a different brand or product name."
        />
      )}

      {!isIdle && !resultsQuery.isLoading && !resultsQuery.isError && results.length > 0 && (
        <>
          <p className="mb-3 text-sm text-muted">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>
          <ul className="space-y-3">
            {results.map((product) => (
              <ResultRow key={product._id} product={product} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
