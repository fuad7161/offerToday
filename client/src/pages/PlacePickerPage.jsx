import { useNavigate } from 'react-router-dom'
import { usePlaces } from '../hooks/queries'
import { getLastPlace, setLastPlace } from '../lib/storage'
import PlacePicker from '../components/PlacePicker'

export default function PlacePickerPage() {
  const navigate = useNavigate()
  const placesQuery = usePlaces()
  const lastPlace = getLastPlace()

  const handleSelect = (place) => {
    setLastPlace(place)
    navigate(`/places/${place._id}`)
  }

  return (
    <div className="animate-fade-in pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Offer Today</h1>
        <p className="mt-1 text-sm text-muted">Find the best deals in the mall you're in.</p>
      </header>

      <PlacePicker
        places={placesQuery.data || []}
        lastPlace={lastPlace}
        loading={placesQuery.isLoading}
        error={placesQuery.isError}
        onRetry={placesQuery.refetch}
        onSelect={handleSelect}
      />
    </div>
  )
}
