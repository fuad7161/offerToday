import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

/** Top-level places (malls, markets, areas). */
export function usePlaces() {
  return useQuery({
    queryKey: ['places'],
    queryFn: async () => (await api.get('/places')).data,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Shops in a place (and its floors), ranked by today's discount.
 * `filters` maps 1:1 to the query params the backend accepts.
 */
export function usePlaceShops(placeId, filters = {}) {
  return useQuery({
    queryKey: ['places', placeId, 'shops', filters],
    queryFn: async () =>
      (await api.get(`/places/${placeId}/shops`, { params: filters })).data,
    enabled: !!placeId,
    staleTime: 30 * 1000,
  })
}

/** Shop detail with its products and currently-active offers. */
export function useShop(shopId) {
  return useQuery({
    queryKey: ['shops', shopId],
    queryFn: async () => (await api.get(`/shops/${shopId}`)).data,
    enabled: !!shopId,
    staleTime: 60 * 1000,
  })
}

/** Products across shops, ranked by discount. Pass `{ brand }` or `{ q }`. */
export function useProducts(params = {}) {
  const hasQuery = Boolean(params.brand || params.q)
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => (await api.get('/products', { params })).data,
    enabled: hasQuery,
    staleTime: 60 * 1000,
  })
}

/** All products — used only to derive the "browse by brand" suggestions. */
export function useAllProducts() {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => (await api.get('/products')).data,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Lightweight metadata for a place: the distinct shop categories (for filter
 * chips) and the number of shops that actually have an offer today.
 */
export function usePlaceStats(placeId) {
  return useQuery({
    queryKey: ['places', placeId, 'stats'],
    queryFn: async () => {
      const shops = (await api.get(`/places/${placeId}/shops`)).data
      const categories = [...new Set(shops.map((s) => s.category).filter(Boolean))]
      const offerCount = shops.filter((s) => Number(s.bestDiscountToday) > 0).length
      const maxDiscount = shops.reduce(
        (max, s) => Math.max(max, Number(s.bestDiscountToday) || 0),
        0,
      )
      return { categories, offerCount, shopCount: shops.length, maxDiscount }
    },
    enabled: !!placeId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Best discount per place — fetches shops (active offers only) for each place
 * in parallel and returns a map of { placeId: bestDiscount }.
 * Powers the "Up to X% OFF" peek on the home page place cards.
 */
export function usePlaceBestDeals(places = []) {
  const placeIds = places.map((p) => p._id)
  return useQuery({
    queryKey: ['places', 'bestDeals', placeIds],
    queryFn: async () => {
      const results = {}
      await Promise.all(
        placeIds.map(async (id) => {
          try {
            const shops = (
              await api.get(`/places/${id}/shops`, { params: { activeOnly: 'true' } })
            ).data
            results[id] = shops.reduce(
              (max, s) => Math.max(max, Number(s.bestDiscountToday) || 0),
              0,
            )
          } catch {
            results[id] = 0
          }
        }),
      )
      return results
    },
    enabled: placeIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
