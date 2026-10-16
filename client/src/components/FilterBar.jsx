import {
  Baby,
  Cpu,
  Dumbbell,
  Footprints,
  HeartPulse,
  Package,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Utensils,
} from 'lucide-react'

const CATEGORY_ICONS = {
  all: Sparkles,
  fashion: Shirt,
  shoes: Footprints,
  footwear: Footprints,
  clothing: Shirt,
  apparel: Shirt,
  electronics: Cpu,
  tech: Cpu,
  sports: Dumbbell,
  fitness: Dumbbell,
  food: Utensils,
  dining: Utensils,
  restaurant: Utensils,
  beauty: Sparkles,
  health: HeartPulse,
  kids: Baby,
  grocery: ShoppingBag,
  supermarket: ShoppingBag,
  misc: Package,
}

function getCategoryIcon(cat) {
  if (!cat) return CATEGORY_ICONS.all
  const key = cat.toLowerCase().trim()
  return CATEGORY_ICONS[key] || ShoppingBag
}

const MIN_OPTIONS = [
  { value: null, label: 'Any' },
  { value: 10, label: '10%+' },
  { value: 20, label: '20%+' },
  { value: 30, label: '30%+' },
]

function Chip({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition active:scale-95 ${
        active
          ? 'border-accent-700 bg-accent-700 text-white shadow-xs'
          : 'border-line/90 bg-paper text-muted hover:border-line-strong hover:text-ink'
      }`}
    >
      {Icon && <Icon size={14} className={active ? 'text-white' : 'text-faint'} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}

/**
 * Sticky filter row for the place view: category chips, an "Offers only"
 * switch, and a minimum-discount segmented control. Horizontal scroll on mobile.
 */
export default function FilterBar({
  categories = [],
  activeCategory,
  minDiscount,
  activeOnly,
  onCategoryChange,
  onMinDiscountChange,
  onActiveOnlyChange,
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur">
      <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-2.5">
        <span className="mr-0.5 hidden shrink-0 items-center gap-1 text-sm font-medium text-faint sm:inline-flex">
          <SlidersHorizontal size={15} aria-hidden="true" />
        </span>
        <Chip active={activeCategory == null} icon={getCategoryIcon('all')} onClick={() => onCategoryChange(null)}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c} active={activeCategory === c} icon={getCategoryIcon(c)} onClick={() => onCategoryChange(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-0.5">
        <button
          type="button"
          role="switch"
          aria-checked={activeOnly}
          onClick={() => onActiveOnlyChange(!activeOnly)}
          className="flex h-11 items-center gap-2.5"
        >
          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${
              activeOnly ? 'bg-accent-700' : 'bg-line-strong'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                activeOnly ? 'translate-x-4' : ''
              }`}
            />
          </span>
          <span className="text-sm font-medium text-muted">Offers only</span>
        </button>

        <div className="flex rounded-full border border-line bg-paper p-0.5" role="group" aria-label="Minimum discount">
          {MIN_OPTIONS.map((opt) => {
            const active = minDiscount === opt.value
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onMinDiscountChange(opt.value)}
                aria-pressed={active}
                className={`h-8 rounded-full px-3 text-sm font-medium transition ${
                  active ? 'bg-accent-700 text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
