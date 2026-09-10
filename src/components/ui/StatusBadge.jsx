import Badge from './Badge.jsx'
import {
  BOOKING_STATUS_LABEL,
  PROCUREMENT_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
} from '../../utils/constants.js'

const BOOKING_TONES = {
  booked: 'info',
  checked_in: 'warning',
  serving: 'warning',
  completed: 'success',
  cancelled: 'neutral',
  missed: 'danger',
}

const PROCUREMENT_TONES = {
  awaiting: 'neutral',
  weighing: 'warning',
  quality_check: 'warning',
  completed: 'success',
  rejected: 'danger',
}

const PAYMENT_TONES = {
  procurement_completed: 'neutral',
  payment_initiated: 'info',
  dbt_processing: 'warning',
  payment_credited: 'success',
  failed: 'danger',
}

const CENTRE = {
  open: { tone: 'success', label: 'Open for booking' },
  busy: { tone: 'warning', label: 'Filling fast' },
  full: { tone: 'danger', label: "Today's capacity full" },
  closed: { tone: 'neutral', label: 'Closed today' },
}

const LOT = {
  ready: { tone: 'neutral', label: 'Ready to sell' },
  booked: { tone: 'info', label: 'Slot booked' },
  procured: { tone: 'success', label: 'Sold' },
}

const MAPS = {
  booking: { labels: BOOKING_STATUS_LABEL, tones: BOOKING_TONES },
  procurement: { labels: PROCUREMENT_STATUS_LABEL, tones: PROCUREMENT_TONES },
  payment: { labels: PAYMENT_STATUS_LABEL, tones: PAYMENT_TONES },
}

export default function StatusBadge({ kind = 'booking', status, className = '' }) {
  if (kind === 'centre') {
    const entry = CENTRE[status] || CENTRE.open
    return (
      <Badge tone={entry.tone} dot pulse={status === 'open'} className={className}>
        {entry.label}
      </Badge>
    )
  }
  if (kind === 'lot') {
    const entry = LOT[status] || LOT.ready
    return (
      <Badge tone={entry.tone} className={className}>
        {entry.label}
      </Badge>
    )
  }

  const map = MAPS[kind] || MAPS.booking
  const label = map.labels[status] || status
  const tone = map.tones[status] || 'neutral'
  const isLive = status === 'serving' || status === 'weighing' || status === 'dbt_processing'
  return (
    <Badge tone={tone} dot pulse={isLive} className={className}>
      {label}
    </Badge>
  )
}
