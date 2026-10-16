import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { formatPrice, discountedPrice } from '../lib/format'

export default function HotDealsBanner({ products = [] }) {
  const [current, setCurrent] = useState(0)

  // Top deals across all places, ranked by discount
  const topDeals = products
    .filter((p) => Number(p.bestDiscountToday) > 0 && p.regularPrice)
    .sort((a, b) => Number(b.bestDiscountToday) - Number(a.bestDiscountToday))
    .slice(0, 5)

  useEffect(() => {
    if (topDeals.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % topDeals.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [topDeals.length])

  if (topDeals.length === 0) return null

  const deal = topDeals[current]
  const discount = Number(deal.bestDiscountToday)
  const shop = deal.shop || {}
  const savedAmount = Math.round(deal.regularPrice * discount / 100)

  return (
    <section className="mb-5 overflow-hidden rounded-card border border-accent-600/20 bg-paper" aria-label="Hot deals">
      {/* Header strip */}
      <div className="flex items-center gap-2 bg-accent-700 px-4 py-2">
        <Flame size={16} className="text-white" aria-hidden="true" />
        <span className="text-sm font-bold text-white">Hot Deals Right Now</span>
        <span className="ml-auto text-xs text-accent-100">
          {current + 1} / {topDeals.length}
        </span>
      </div>

      {/* Deal card */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-ink">{deal.name}</h3>
            <p className="mt-0.5 truncate text-sm text-muted">
              {[deal.brand, shop.name, shop.floorUnit].filter(Boolean).join(' · ')}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-xl font-bold text-accent-700">
                {formatPrice(discountedPrice(deal.regularPrice, discount))}
              </span>
              <span className="text-sm text-faint line-through">
                {formatPrice(deal.regularPrice)}
              </span>
              {savedAmount > 0 && (
                <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-800">
                  Save {formatPrice(savedAmount)}
                </span>
              )}
            </div>
          </div>
          <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-accent-700 text-white">
            <span className="text-2xl font-bold leading-none">{Math.round(discount)}</span>
            <span className="text-[10px] font-semibold uppercase">% OFF</span>
          </span>
        </div>

        {/* Dot indicators */}
        {topDeals.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {topDeals.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-6 bg-accent-700' : 'w-1.5 bg-line-strong'
                }`}
                aria-label={`View deal ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
