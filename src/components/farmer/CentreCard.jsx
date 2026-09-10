import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import CapacityBar from '../ui/CapacityBar.jsx'
import { distanceLabel, formatDuration, formatNumber } from '../../utils/format.js'
import { CROPS } from '../../utils/constants.js'

const cropName = (code) => CROPS.find((crop) => crop.code === code)?.name || code

export default function CentreCard({ centre }) {
  const bookable = centre.status !== 'closed' && centre.status !== 'full'

  return (
    <article className="border border-line bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-ink">
            <Link to={`/centres/${centre.id}`} className="hover:underline">
              {centre.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <Icon name="map-pin" className="h-4 w-4" />
              {centre.village}, {centre.district}
            </span>
            <span aria-hidden="true">|</span>
            <span>{distanceLabel(centre.distanceKm)}</span>
            <span aria-hidden="true">|</span>
            <span>{centre.type}</span>
          </p>
        </div>
        <StatusBadge kind="centre" status={centre.status} />
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted">Farmers waiting</p>
              <p className="text-xl font-bold text-ink tnum">{formatNumber(centre.queue.waiting)}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Waiting time now</p>
              <p className="text-xl font-bold text-ink tnum">
                {formatDuration(centre.queue.estimatedWaitMinutes)}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted">
            Token #{centre.queue.nowServing} at the counter. {centre.counters}{' '}
            {centre.counters === 1 ? 'counter' : 'counters'} working.
          </p>
        </div>
        <CapacityBar used={centre.load.usedQuintal} capacity={centre.load.capacityQuintal} compact />
      </div>

      <div className="border-t border-line px-4 py-3">
        <p className="text-sm text-muted">
          Buying: <span className="text-ink">{centre.cropsAccepted.map(cropName).join(', ')}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line bg-paper px-4 py-3">
        <Button to={`/centres/${centre.id}`} variant="neutral" size="sm">
          View centre
        </Button>
        <Button to={`/book/${centre.id}`} size="sm" disabled={!bookable}>
          {bookable ? 'Book a slot' : 'Booking closed'}
        </Button>
      </div>
    </article>
  )
}
