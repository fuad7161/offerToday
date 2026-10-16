import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, Sparkles } from 'lucide-react'
import DiscountBadge from './DiscountBadge'

/**
 * A ranked shop row. The discount badge is the hero; the shop name and
 * floor/unit are secondary. Zero-discount shops render muted with a label.
 */
export default function ShopCard({ shop, rank, isTop = false }) {
  const discount = Number(shop.bestDiscountToday) || 0
  const hasOffer = discount > 0
  const meta = [shop.floorUnit, shop.category].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/shops/${shop._id}`}
      className={`group relative flex min-h-[72px] items-center gap-3 rounded-card border bg-paper p-4 transition-all duration-150 hover:shadow-card active:scale-[0.99] ${
        isTop ? 'border-highlight-border bg-highlight' : 'border-line'
      } ${hasOffer ? '' : 'opacity-75'}`}
    >
      <span className="w-5 shrink-0 text-right text-sm font-semibold tabular-nums text-faint">
        {rank}
      </span>

      <div className="min-w-0 flex-1">
        {isTop && (
          <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
            <Sparkles size={13} aria-hidden="true" />
            Best today
          </span>
        )}
        <h3 className="truncate text-base font-semibold text-ink">{shop.name}</h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-faint">
          <MapPin size={14} className="shrink-0" aria-hidden="true" />
          {meta || '—'}
        </p>
      </div>

      {hasOffer ? (
        <DiscountBadge value={shop.bestDiscountToday} size="md" />
      ) : (
        <span className="shrink-0 text-xs font-medium text-faint">No offers today</span>
      )}

      <ChevronRight
        size={18}
        className="shrink-0 text-line-strong transition group-hover:text-muted"
        aria-hidden="true"
      />
    </Link>
  )
}
