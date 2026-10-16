import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Compass, Heart, Percent, Search } from 'lucide-react'

function navClass({ isActive }) {
  return `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-accent-50 text-accent-800' : 'text-muted hover:text-ink'
  }`
}

export default function Layout() {
  const { pathname } = useLocation()

  // Reset scroll to the top on navigation (SPA route changes don't do this by default).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop header */}
      <header className="sticky top-0 z-20 hidden border-b border-line/80 bg-canvas/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-md md:block">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-700 text-white shadow-sm">
              <Percent size={15} aria-hidden="true" />
            </span>
            Offer Today
          </Link>
          <nav className="flex items-center gap-1" aria-label="Primary">
            <NavLink to="/" end className={navClass}>
              Places
            </NavLink>
            <NavLink to="/search" className={navClass}>
              Search
            </NavLink>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Coming soon"
              className="flex cursor-not-allowed items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-faint opacity-60"
            >
              Watchlist
              <span className="rounded-full bg-line px-1.5 py-0.5 text-[10px] font-semibold uppercase text-faint">
                Soon
              </span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pb-28 md:pb-16">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line/80 bg-paper/95 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Primary"
      >
        <div className="mx-auto grid w-full max-w-2xl grid-cols-3">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
                isActive ? 'text-accent-700' : 'text-faint'
              }`
            }
          >
            <Compass size={20} aria-hidden="true" />
            Places
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
                isActive ? 'text-accent-700' : 'text-faint'
              }`
            }
          >
            <Search size={20} aria-hidden="true" />
            Search
          </NavLink>

          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="flex cursor-not-allowed flex-col items-center gap-1 py-2.5 text-xs font-medium text-faint opacity-60"
          >
            <Heart size={20} aria-hidden="true" />
            Watchlist
          </button>
        </div>
      </nav>
    </div>
  )
}
