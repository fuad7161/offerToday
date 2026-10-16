import { formatDiscount } from '../lib/format'

// Discount badge tiers (the spec): 40%+ solid, 20-39% tinted, <20% outline, 0% hidden.
const TIERS = {
  strong: 'bg-accent-700 text-white',
  tinted: 'bg-accent-50 text-accent-800',
  outline: 'border border-accent-600/60 text-accent-700',
}

const SIZES = {
  sm: { box: 'px-2 py-0.5', num: 'text-sm', label: 'text-[8px]' },
  md: { box: 'px-2.5 py-1', num: 'text-lg', label: 'text-[9px]' },
  lg: { box: 'px-3.5 py-1.5', num: 'text-2xl', label: 'text-[11px]' },
}

function tierOf(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 'none'
  if (n >= 40) return 'strong'
  if (n >= 20) return 'tinted'
  return 'outline'
}

/**
 * The discount number is the hero of every list item. This renders "50% OFF"
 * with a strength-appropriate treatment. Returns null when there is no discount.
 */
export default function DiscountBadge({ value, size = 'md', className = '' }) {
  const tier = tierOf(value)
  if (tier === 'none') return null

  const s = SIZES[size] || SIZES.md

  return (
    <span
      className={`inline-flex shrink-0 items-baseline gap-0.5 rounded-full font-bold leading-none ${TIERS[tier]} ${s.box} ${className}`}
      aria-label={`${formatDiscount(value)} off`}
    >
      <span className={s.num}>{formatDiscount(value)}</span>
      <span className={`font-semibold uppercase tracking-wide ${s.label}`}>OFF</span>
    </span>
  )
}
