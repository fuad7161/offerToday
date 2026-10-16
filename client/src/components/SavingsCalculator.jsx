import { TrendingDown } from 'lucide-react'
import { formatPrice, discountedPrice } from '../lib/format'

/**
 * Calculates and displays total potential savings across all discounted
 * products in a shop. The big number makes the value feel real.
 */
export default function SavingsCalculator({ products = [] }) {
  const discountedProducts = products.filter((p) => Number(p.bestDiscountToday) > 0)
  if (discountedProducts.length === 0) return null

  const totalRegular = discountedProducts.reduce(
    (sum, p) => sum + (Number(p.regularPrice) || 0),
    0,
  )
  const totalSale = discountedProducts.reduce((sum, p) => {
    const disc = Number(p.bestDiscountToday) || 0
    return sum + (discountedPrice(p.regularPrice, disc) || 0)
  }, 0)
  const totalSaved = totalRegular - totalSale

  if (totalSaved <= 0) return null

  return (
    <div className="mb-6 rounded-card border border-accent-600/20 bg-gradient-to-r from-accent-50 to-highlight p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-700 text-white">
          <TrendingDown size={16} aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-800">
          Potential savings
        </h3>
      </div>
      <p className="text-2xl font-bold text-accent-700">{formatPrice(totalSaved)}</p>
      <p className="mt-1 text-sm text-muted">
        across {discountedProducts.length}{' '}
        {discountedProducts.length === 1 ? 'product' : 'products'} on sale
      </p>
    </div>
  )
}
