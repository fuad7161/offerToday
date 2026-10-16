import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Building2,
  ChevronRight,
  MapPin,
  Search,
  Store,
  X,
} from 'lucide-react'
import EmptyState from './EmptyState'
import ErrorState from './ErrorState'
import { PlaceListSkeleton } from './Skeleton'

const TYPE_ICON = { mall: Building2, market: Store, area: MapPin }

function SearchField({ value, onChange }) {
  return (
    <div className="relative mb-4">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search malls or markets"
        aria-label="Search places"
        className="w-full rounded-card border border-line bg-paper pl-11 pr-11 text-base text-ink shadow-card placeholder:text-faint focus:border-accent-600"
        style={{ height: '52px' }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-faint transition hover:bg-line hover:text-ink"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

function ContinueCard({ place, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(place)}
      className="mb-3 flex w-full items-center justify-between gap-3 rounded-card border border-accent-600/30 bg-accent-50 p-4 text-left transition hover:bg-accent-100"
    >
      <span className="flex min-w-0 items-center gap-3">
        <MapPin size={18} className="shrink-0 text-accent-700" aria-hidden="true" />
        <span className="min-w-0">
          <span className="block text-xs font-medium uppercase tracking-wide text-accent-800">
            Continue where you left off
          </span>
          <span className="block truncate text-base font-semibold text-accent-800">{place.name}</span>
        </span>
      </span>
      <ArrowRight size={18} className="shrink-0 text-accent-700" aria-hidden="true" />
    </button>
  )
}

function PlaceCard({ place, onSelect }) {
  const Icon = TYPE_ICON[place.type] || MapPin
  return (
    <button
      type="button"
      onClick={() => onSelect(place)}
      className="group flex w-full items-center gap-4 rounded-card border border-line bg-paper p-4 text-left transition hover:shadow-card active:scale-[0.99]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold text-ink">{place.name}</span>
        <span className="mt-0.5 block truncate text-sm capitalize text-faint">
          {[place.type, place.city].filter(Boolean).join(' · ')}
        </span>
      </span>
      <ChevronRight
        size={18}
        className="shrink-0 text-line-strong transition group-hover:translate-x-0.5 group-hover:text-muted"
        aria-hidden="true"
      />
    </button>
  )
}

/**
 * Home screen content: search + a "continue" shortcut + the tappable list of
 * places. Loading / error / empty states are handled here.
 */
export default function PlacePicker({ places, lastPlace, loading, error, onRetry, onSelect }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!q) return places
    return places.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) || (p.city || '').toLowerCase().includes(q),
    )
  }, [places, q])

  const showContinue = Boolean(lastPlace) && !q

  return (
    <div>
      <SearchField value={query} onChange={setQuery} />

      {showContinue && <ContinueCard place={lastPlace} onSelect={onSelect} />}

      {loading && <PlaceListSkeleton />}

      {!loading && error && <ErrorState onRetry={onRetry} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="No places found"
          description="Try a different search term."
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="space-y-3">
          {filtered.map((place) => (
            <li key={place._id}>
              <PlaceCard place={place} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
