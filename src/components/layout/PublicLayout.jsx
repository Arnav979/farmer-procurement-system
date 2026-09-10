import { Outlet } from 'react-router-dom'
import Masthead from './Masthead.jsx'
import SiteFooter from './SiteFooter.jsx'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Masthead />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
