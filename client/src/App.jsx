import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import PlacePickerPage from './pages/PlacePickerPage.jsx'
import PlaceViewPage from './pages/PlaceViewPage.jsx'
import ShopDetailPage from './pages/ShopDetailPage.jsx'
import SearchPage from './pages/SearchPage.jsx'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-line-strong">404</p>
      <h1 className="mt-3 text-xl font-semibold text-ink">Page not found</h1>
      <Link
        to="/"
        className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-neutral-800"
      >
        Back to places
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PlacePickerPage />} />
        <Route path="/places/:id" element={<PlaceViewPage />} />
        <Route path="/shops/:id" element={<ShopDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
