import { Link } from 'react-router-dom'
import Container from './Container.jsx'
import { HELPLINE } from '../../utils/constants.js'

export default function SiteFooter() {
  return (
    <footer className="print-hide mt-12 border-t border-line bg-white">
      <Container className="grid gap-6 py-8 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-ink">Kisan Kendra</p>
          <p className="mt-1 text-sm text-muted">
            Slot booking and token service for minimum support price procurement centres.
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink">Need help</p>
          <ul className="mt-1 space-y-1 text-sm text-muted">
            <li>
              Kisan helpline{' '}
              <a href={`tel:${HELPLINE.replace(/-/g, '')}`} className="font-medium text-brand-700 underline">
                {HELPLINE}
              </a>
            </li>
            <li>Open 6:00 AM to 10:00 PM, all days</li>
            <li>
              <Link to="/help" className="font-medium text-brand-700 underline">
                Rules for bringing your crop
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-ink">About this service</p>
          <p className="mt-1 text-sm text-muted">
            Booking a slot is free. No agent or middleman can book on your behalf. Payment reaches only your
            Aadhaar-seeded bank account.
          </p>
        </div>
      </Container>
      <div className="border-t border-line bg-paper py-3">
        <Container>
          <p className="text-sm text-muted">
            Content owned by the Department of Agriculture and Farmers' Welfare. Last updated 10 September 2026.
          </p>
        </Container>
      </div>
    </footer>
  )
}
