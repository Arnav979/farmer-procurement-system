import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Container from './Container.jsx'
import Icon from '../ui/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { HELPLINE } from '../../utils/constants.js'

const PRIMARY_NAV = [
  { to: '/dashboard', label: 'Dashboard', hindi: 'मुख्य पृष्ठ' },
  { to: '/crops', label: 'My crops', hindi: 'मेरी फसल' },
  { to: '/centres', label: 'Procurement centres', hindi: 'क्रय केंद्र' },
  { to: '/queue', label: 'Live queue', hindi: 'कतार' },
  { to: '/procurement', label: 'Procurement', hindi: 'खरीद' },
  { to: '/payments', label: 'Payments', hindi: 'भुगतान' },
]

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-3 text-white">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-white/70">
        <Icon name="wheat" className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-bold tracking-tight sm:text-xl">Kisan Kendra</span>
        <span className="block text-[13px] text-white/80">Crop procurement slot booking</span>
      </span>
    </Link>
  )
}

export default function Masthead() {
  const { isAuthenticated, user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="print-hide">
      <div className="bg-brand-900 text-white/85">
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1.5 text-[13px]">
          <p>Department of Agriculture and Farmers' Welfare</p>
          <a href={`tel:${HELPLINE.replace(/-/g, '')}`} className="flex items-center gap-1.5 hover:text-white">
            <Icon name="phone" className="h-3.5 w-3.5" />
            Kisan helpline {HELPLINE}
          </a>
        </Container>
      </div>

      <div className="bg-brand-800">
        <Container className="flex items-center justify-between gap-4 py-3">
          <Wordmark />

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="hidden items-center gap-2 border border-white/30 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 sm:flex"
                >
                  <Icon name="user" className="h-4 w-4" />
                  {user?.name?.split(' ')[0] || 'Profile'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden items-center gap-2 border border-white/30 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 sm:flex"
                >
                  <Icon name="logout" className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 sm:block"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="hidden bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50 sm:block"
                >
                  Register
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center border border-white/30 text-white lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} className="h-6 w-6" />
            </button>
          </div>
        </Container>
      </div>

      {isAuthenticated ? (
        <nav aria-label="Main" className="hidden border-b border-line bg-white lg:block">
          <Container>
            <ul className="flex flex-wrap items-center">
              {PRIMARY_NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `block border-b-[3px] px-4 py-3 text-[15px] font-medium ${
                        isActive
                          ? 'border-brand-600 text-brand-700'
                          : 'border-transparent text-ink hover:border-line hover:text-brand-700'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      ) : null}

      {menuOpen ? (
        <div id="mobile-menu" className="border-b border-line bg-white lg:hidden">
          <Container className="py-2">
            <ul className="divide-y divide-line">
              {(isAuthenticated ? PRIMARY_NAV : []).map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-3 text-[16px] font-medium ${
                        isActive ? 'text-brand-700' : 'text-ink'
                      }`
                    }
                  >
                    <span>
                      {item.label}{' '}
                      <span className="ml-2 text-sm font-normal text-muted">{item.hindi}</span>
                    </span>
                    <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                  </NavLink>
                </li>
              ))}
              {isAuthenticated ? (
                <>
                  <li>
                    <NavLink
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-[16px] font-medium text-ink"
                    >
                      My profile
                      <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                    </NavLink>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between py-3 text-left text-[16px] font-medium text-danger-600"
                    >
                      Log out
                      <Icon name="logout" className="h-5 w-5" />
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-[16px] font-medium text-ink"
                    >
                      Log in
                      <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-[16px] font-medium text-brand-700"
                    >
                      Register as a farmer
                      <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  to="/help"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-3 text-[16px] font-medium text-ink"
                >
                  Help and rules
                  <Icon name="chevron-right" className="h-5 w-5 text-muted" />
                </Link>
              </li>
            </ul>
          </Container>
        </div>
      ) : null}
    </header>
  )
}
