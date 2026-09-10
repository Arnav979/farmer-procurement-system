import { NavLink } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'

const TABS = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/centres', label: 'Centres', icon: 'map-pin' },
  { to: '/queue', label: 'Queue', icon: 'ticket' },
  { to: '/payments', label: 'Payments', icon: 'rupee' },
  { to: '/profile', label: 'Profile', icon: 'user' },
]

/** Thumb-reachable navigation for the five things a farmer opens most. */
export default function BottomNav() {
  return (
    <nav
      aria-label="Quick navigation"
      className="print-hide fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `flex min-h-[58px] flex-col items-center justify-center gap-0.5 border-t-[3px] px-1 py-1.5 text-xs font-medium ${
                  isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-muted'
                }`
              }
            >
              <Icon name={tab.icon} className="h-6 w-6" />
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
