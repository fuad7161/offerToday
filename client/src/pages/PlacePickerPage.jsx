import { Flame, MapPin, Sparkles, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAllProducts, usePlaceBestDeals, usePlaces } from '../hooks/queries'
import { getLastPlace, setLastPlace } from '../lib/storage'
import PlacePicker from '../components/PlacePicker'
import HotDealsBanner from '../components/HotDealsBanner'

export default function PlacePickerPage() {
  const navigate = useNavigate()
  const placesQuery = usePlaces()
  const allProductsQuery = useAllProducts()
  const bestDealsQuery = usePlaceBestDeals(placesQuery.data || [])
  const lastPlace = getLastPlace()

  const places = placesQuery.data || []
  const products = allProductsQuery.data || []
  const activeDealCount = products.filter((p) => Number(p.bestDiscountToday) > 0).length

  const handleSelect = (place) => {
    setLastPlace(place)
    navigate(`/places/${place._id}`)
  }

  return (
    <div className="animate-fade-in pt-4">
      {/* Hero section */}
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-accent-600/20 bg-gradient-to-br from-accent-700 via-accent-800 to-accent-900 p-6 text-white shadow-lift">
        {/* Soft decorative background circles */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-accent-600/25 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-10 right-20 h-36 w-36 rounded-full bg-white/5 blur-xl"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles size={13} className="text-accent-100" aria-hidden="true" />
            <span>Today's Verified Discounts</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Never miss an in-mall offer again.
          </h1>

          <p className="mt-1.5 max-w-md text-sm text-accent-100/90 leading-relaxed">
            Locate active sales, clearance discounts, and exclusive shop promotions right where you're shopping.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-white/90">
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/20 px-2.5 py-1 backdrop-blur-xs">
              <MapPin size={13} className="text-accent-100" aria-hidden="true" />
              <strong>{places.length || '—'}</strong> Shopping Malls
            </span>
            {activeDealCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/20 px-2.5 py-1 backdrop-blur-xs">
                <Flame size={13} className="text-amber-300" aria-hidden="true" />
                <strong>{activeDealCount}</strong> Live Deals Today
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/20 px-2.5 py-1 backdrop-blur-xs">
              <TrendingUp size={13} className="text-emerald-300" aria-hidden="true" />
              Live Pricing
            </span>
          </div>
        </div>
      </section>

      <HotDealsBanner products={allProductsQuery.data || []} />

      <PlacePicker
        places={placesQuery.data || []}
        bestDeals={bestDealsQuery.data || {}}
        lastPlace={lastPlace}
        loading={placesQuery.isLoading}
        error={placesQuery.isError}
        onRetry={placesQuery.refetch}
        onSelect={handleSelect}
      />
    </div>
  )
}
