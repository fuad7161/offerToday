import { Clock } from 'lucide-react'
import { formatPrice, timeLeft } from '../lib/format'

function scopeLabel(offer) {
  if (offer.scope === 'shop') return 'Entire store'
  if (offer.scope === 'brand') return `Brand · ${offer.brand || 'all brands'}`
  return 'Specific product'
}

/** A single active offer with its discount and a live countdown. */
export default function OfferCard({ offer }) {
  const tl = timeLeft(offer.endsAt)
  const isPercent = offer.type === 'percent'
  const discount = isPercent ? `${offer.value}% off` : `${formatPrice(offer.value)} off`

  return (
    <li className="rounded-card border border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug text-ink">{offer.title || discount}</h3>
          <p className="mt-1 text-sm text-faint">{scopeLabel(offer)}</p>
        </div>
        <span className="shrink-0 text-2xl font-bold leading-none tracking-tight text-accent-700">
          {discount}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-sm">
        <Clock size={15} className={tl.expired ? 'text-faint' : 'text-accent-700'} aria-hidden="true" />
        <span className={tl.expired ? 'text-faint' : 'text-muted'}>{tl.text}</span>
      </div>
    </li>
  )
}
