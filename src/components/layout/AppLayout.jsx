import { Outlet } from 'react-router-dom'
import Masthead from './Masthead.jsx'
import SiteFooter from './SiteFooter.jsx'
import BottomNav from './BottomNav.jsx'
import Container from './Container.jsx'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Masthead />
      <main id="main" className="flex-1 pb-24 pt-5 sm:pt-6 lg:pb-8">
        <Container>
          <Outlet />
        </Container>
      </main>
      <SiteFooter />
      <BottomNav />
    </div>
  )
}
