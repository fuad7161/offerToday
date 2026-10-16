import { Flame, Store, Tag } from 'lucide-react'

/**
 * Summary stats bar for a place — shows at a glance how many deals are
 * active, the hottest discount, and how many categories are covered.
 */
export default function DealStats({ offerCount = 0, maxDiscount = 0, categoryCount = 0 }) {
  if (offerCount === 0 && maxDiscount === 0) return null

  const stats = [
    {
      icon: Store,
      value: offerCount,
      label: offerCount === 1 ? 'shop with offers' : 'shops with offers',
      color: 'text-accent-700',
    },
    {
      icon: Flame,
      value: `${maxDiscount}%`,
      label: 'highest discount',
      color: 'text-red-500',
    },
    {
      icon: Tag,
      value: categoryCount,
      label: categoryCount === 1 ? 'category' : 'categories',
      color: 'text-amber-600',
    },
  ]

  return (
    <div className="mb-4 grid grid-cols-3 gap-2">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex flex-col items-center rounded-card border border-line bg-paper px-2 py-3 text-center"
        >
          <stat.icon size={18} className={`mb-1 ${stat.color}`} aria-hidden="true" />
          <span className="text-lg font-bold text-ink">{stat.value}</span>
          <span className="text-[11px] leading-tight text-faint">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
