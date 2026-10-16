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

// Approximate coordinates for common malls/markets to enable "Near Me" sorting
const KNOWN_COORDS = {
  'bashundhara city': { lat: 23.7508, lng: 90.3916 },
  'jamuna future park': { lat: 23.8135, lng: 90.4243 },
  'shimanto square': { lat: 23.7383, lng: 90.3752 },
  'police plaza': { lat: 23.7784, lng: 90.4173 },
  'raowa': { lat: 23.7915, lng: 90.3995 },
  'dhaka': { lat: 23.8103, lng: 90.4125 },
}

function getPlaceCoords(place) {
  if (place.latitude && place.longitude) {
    return { lat: Number(place.latitude), lng: Number(place.longitude) }
  }
  const nameKey = (place.name || '').toLowerCase().trim()
  for (const [key, coords] of Object.entries(KNOWN_COORDS)) {
    if (nameKey.includes(key)) return coords
  }
  const cityKey = (place.city || '').toLowerCase().trim()
  if (cityKey && KNOWN_COORDS[cityKey]) return KNOWN_COORDS[cityKey]
  return null
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function PlaceCard({ place, bestDeal = 0, distanceKm, onSelect }) {
  const Icon = TYPE_ICON[place.type] || MapPin
  return (
    <button
      type="button"
      onClick={() => onSelect(place)}
      className="group flex w-full items-center gap-4 rounded-card border border-line/80 bg-paper p-4 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift active:scale-[0.99]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold text-ink">{place.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 truncate text-sm capitalize text-faint">
          <span>{[place.type, place.city].filter(Boolean).join(' · ')}</span>
          {distanceKm != null && (
            <span className="inline-flex items-center rounded-full bg-line/60 px-2 py-0.2 text-xs font-semibold text-ink/75">
              {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}
            </span>
          )}
        </span>
      </span>
      {bestDeal > 0 && (
        <span className="shrink-0 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-bold text-accent-800">
          Up to {Math.round(bestDeal)}% OFF
        </span>
      )}
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
export default function PlacePicker({ places, bestDeals = {}, lastPlace, loading, error, onRetry, onSelect }) {
  const [query, setQuery] = useState('')
  const [nearMeActive, setNearMeActive] = useState(false)
  const [geoCoords, setGeoCoords] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState(null)
  const q = query.trim().toLowerCase()

  const handleToggleNearMe = () => {
    if (nearMeActive) {
      setNearMeActive(false)
      return
    }

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }

    setGeoLoading(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setNearMeActive(true)
        setGeoLoading(false)
      },
      (err) => {
        setGeoLoading(false)
        setGeoError(err.message || 'Unable to access your location')
      },
      { timeout: 8000 },
    )
  }

  const filtered = useMemo(() => {
    let list = places
    if (q) {
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) || (p.city || '').toLowerCase().includes(q),
      )
    }

    if (nearMeActive && geoCoords) {
      return [...list].sort((a, b) => {
        const coordA = getPlaceCoords(a)
        const coordB = getPlaceCoords(b)
        if (!coordA && !coordB) return 0
        if (!coordA) return 1
        if (!coordB) return -1
        const distA = getDistanceKm(geoCoords.lat, geoCoords.lng, coordA.lat, coordA.lng)
        const distB = getDistanceKm(geoCoords.lat, geoCoords.lng, coordB.lat, coordB.lng)
        return distA - distB
      })
    }

    return list
  }, [places, q, nearMeActive, geoCoords])

  const showContinue = Boolean(lastPlace) && !q

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchField value={query} onChange={setQuery} />
        </div>
        <button
          type="button"
          onClick={handleToggleNearMe}
          disabled={geoLoading}
          aria-pressed={nearMeActive}
          className={`mb-4 flex h-[52px] items-center justify-center gap-2 rounded-card border px-4 text-sm font-semibold transition active:scale-95 ${
            nearMeActive
              ? 'border-accent-600 bg-accent-700 text-white shadow-lift'
              : 'border-line bg-paper text-ink shadow-card hover:border-line-strong hover:bg-canvas'
          }`}
        >
          <MapPin size={16} className={nearMeActive ? 'text-white' : 'text-accent-700'} aria-hidden="true" />
          <span>{geoLoading ? 'Locating…' : nearMeActive ? 'Near Me (Active)' : 'Near Me'}</span>
        </button>
      </div>

      {geoError && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {geoError}
        </div>
      )}

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
          {filtered.map((place) => {
            let dist = null
            if (nearMeActive && geoCoords) {
              const coords = getPlaceCoords(place)
              if (coords) {
                dist = getDistanceKm(geoCoords.lat, geoCoords.lng, coords.lat, coords.lng)
              }
            }
            return (
              <li key={place._id}>
                <PlaceCard
                  place={place}
                  bestDeal={bestDeals[place._id] || 0}
                  distanceKm={dist}
                  onSelect={onSelect}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
