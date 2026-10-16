import DiscountBadge from './DiscountBadge'
import { formatPrice, discountedPrice } from '../lib/format'

/** A product line inside shop detail: name, brand, prices, and discount. */
export default function ProductRow({ product }) {
  const discount = Number(product.bestDiscountToday) || 0
  const hasOffer = discount > 0
  const regular = formatPrice(product.regularPrice)
  const sale = hasOffer ? formatPrice(discountedPrice(product.regularPrice, discount)) : null

  return (
    <li className="flex items-center gap-3 rounded-card border border-line bg-paper p-4">
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-semibold text-ink">{product.name}</h4>
        <p className="mt-0.5 truncate text-sm text-faint">
          {[product.brand, product.category].filter(Boolean).join(' · ')}
        </p>

        <div className="mt-2 flex items-baseline gap-2">
          {hasOffer ? (
            <>
              <span className="text-base font-bold text-accent-700">{sale}</span>
              <span className="text-sm text-faint line-through">{regular}</span>
            </>
          ) : (
            <span className="text-base font-semibold text-ink">{regular}</span>
          )}
        </div>
      </div>

      {hasOffer && <DiscountBadge value={discount} size="sm" />}
    </li>
  )
}
