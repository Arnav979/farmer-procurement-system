import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx'
import QueueRail from '../components/farmer/QueueRail.jsx'
import DemoNotice from '../components/farmer/DemoNotice.jsx'
import { bookingApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { BOOKING_STATUS } from '../utils/constants.js'
import { formatDuration, formatSlotRange, formatDateTime, relativeDay } from '../utils/format.js'

const POLL_MS = 10000
const ACTIVE = [BOOKING_STATUS.BOOKED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.SERVING]

function BigStat({ label, hindi, value, tone = 'ink' }) {
  const colour = tone === 'steel' ? 'text-steel-600' : tone === 'brand' ? 'text-brand-700' : 'text-ink'
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-sm text-muted">
        {label}{' '}
        {hindi ? <span className="ml-1.5">{hindi}</span> : null}
      </p>
      <p className={`mt-1 text-3xl font-bold tnum sm:text-4xl ${colour}`}>{value}</p>
    </div>
  )
}

/** Resolves /queue with no id to the farmer's current token. */
function QueuePicker() {
  useDocumentTitle('Live queue')
  const { data: bookings, loading, error, refetch } = useApi(() => bookingApi.list(), [])

  const active = useMemo(() => (bookings || []).find((booking) => ACTIVE.includes(booking.status)), [bookings])

  if (loading && !bookings) return <LoadingState label="Finding your token" />
  if (error && !bookings) return <ErrorState error={error} onRetry={refetch} />

  if (!active) {
    return (
      <>
        <PageHeader title="Live queue" hindiTitle="कतार" />
        <EmptyState
          icon="ticket"
          title="You have no token in the queue"
          description="Book a slot at a procurement centre. Once you check in at the gate, your position in the queue shows here."
          action={
            <Button to="/centres" size="lg">
              Find a procurement centre
            </Button>
          }
        />
      </>
    )
  }

  if (active.status === BOOKING_STATUS.BOOKED) {
    return (
      <>
        <PageHeader title="Live queue" hindiTitle="कतार" />
        <Alert
          tone="info"
          title={`Token #${active.tokenNumber} is booked for ${relativeDay(active.date).toLowerCase()}`}
          action={
            <div className="flex flex-wrap gap-2">
              <Button to={`/check-in/${active.id}`}>Check in at the centre</Button>
              <Button to={`/bookings/${active.id}`} variant="neutral">
                View token slip
              </Button>
            </div>
          }
        >
          The queue starts showing after you check in at {active.centreName}, between{' '}
          {formatSlotRange(active.startTime, active.endTime)}.
        </Alert>
      </>
    )
  }

  return <Navigate to={`/queue/${active.id}`} replace />
}

function QueueView({ bookingId }) {
  const bookingQuery = useApi(() => bookingApi.detail(bookingId), [bookingId], { pollMs: POLL_MS })
  const queueQuery = useApi(() => bookingApi.queuePosition(bookingId), [bookingId], { pollMs: POLL_MS })

  const booking = bookingQuery.data
  const queue = queueQuery.data
  useDocumentTitle(queue ? `Token #${queue.tokenNumber} in queue` : 'Live queue')

  if ((bookingQuery.loading && !booking) || (queueQuery.loading && !queue)) {
    return <LoadingState label="Loading the queue" />
  }
  if (queueQuery.error && !queue) return <ErrorState error={queueQuery.error} onRetry={queueQuery.refetch} />
  if (!booking || !queue) return null

  const done = booking.status === BOOKING_STATUS.COMPLETED
  const yourTurn = queue.peopleAhead === 0
  const almost = queue.peopleAhead > 0 && queue.peopleAhead <= 2

  return (
    <>
      <PageHeader
        back={{ to: `/bookings/${bookingId}`, label: 'Token slip' }}
        title="Live queue"
        hindiTitle="कतार"
        description={`${queue.centreName}, ${queue.centreAddress}`}
        meta={<StatusBadge kind="booking" status={booking.status} />}
        actions={
          <Button
            variant="neutral"
            size="sm"
            onClick={() => {
              queueQuery.refetch()
              bookingQuery.refetch()
            }}
            icon={<Icon name="refresh" className="h-4 w-4" />}
          >
            Refresh
          </Button>
        }
      />

      {done ? (
        <Alert
          tone="success"
          title="Your crop has been taken at the counter"
          className="mb-5"
          action={
            <Button to="/procurement" size="md">
              See weighment and grade
            </Button>
          }
        >
          The centre is recording the weighment. Payment stages will appear once the acknowledgement slip is
          issued.
        </Alert>
      ) : yourTurn ? (
        <div className="mb-5 border-2 border-brand-600 bg-brand-600 px-5 py-6 text-center text-white">
          <p className="text-lg font-semibold">Your turn</p>
          <p className="mt-1 text-2xl font-bold">Take your trolley to the counter now</p>
          <p className="mt-1 text-white/85">आपकी बारी आ गई है, काउंटर पर पहुँचें</p>
        </div>
      ) : almost ? (
        <Alert tone="warning" title="Get ready" className="mb-5">
          Only {queue.peopleAhead} {queue.peopleAhead === 1 ? 'farmer is' : 'farmers are'} ahead of you. Move your
          trolley towards the counter.
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card>
            <CardBody className="p-0 sm:p-0">
              <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
                <div className="bg-brand-800 px-3 py-4 text-center text-white">
                  <p className="text-sm text-white/80">
                    Your token <span className="ml-1.5">आपका टोकन</span>
                  </p>
                  <p className="mt-1 text-3xl font-bold tnum sm:text-4xl">#{queue.tokenNumber}</p>
                </div>
                <BigStat label="Now serving" hindi="चल रहा है" value={`#${queue.nowServing}`} tone="steel" />
                <BigStat label="People ahead" hindi="आगे" value={queue.peopleAhead} />
                <BigStat
                  label="Estimated wait"
                  value={yourTurn ? 'Now' : `~${formatDuration(queue.estimatedWaitMinutes)}`}
                  tone="brand"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="The line ahead of you"
              subtitle={`${queue.counters} ${queue.counters === 1 ? 'counter' : 'counters'} working, about ${queue.avgServiceMinutes} minutes per farmer`}
            />
            <CardBody>
              <QueueRail
                nowServing={queue.nowServing}
                tokenNumber={queue.tokenNumber}
                lastIssuedToken={queue.lastIssuedToken}
              />
            </CardBody>
          </Card>

          <p className="text-sm text-muted">
            Updated {formatDateTime(queue.updatedAt)}. This page refreshes on its own every 10 seconds.
          </p>

          <DemoNotice>
            Queue movement here is simulated so the whole flow can be seen end to end. Once the centre API is
            connected, these numbers come from the counter operator.
          </DemoNotice>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Your lot" />
            <CardBody>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-muted">Crop</dt>
                  <dd className="font-semibold text-ink">
                    {booking.cropName} ({booking.variety})
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Quantity declared</dt>
                  <dd className="font-semibold text-ink tnum">{booking.quantityQuintal} quintal</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Slot</dt>
                  <dd className="font-semibold text-ink tnum">
                    {formatSlotRange(booking.startTime, booking.endTime)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Checked in at</dt>
                  <dd className="font-semibold text-ink">{formatDateTime(booking.checkedInAt)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Problem at the counter?" />
            <CardBody>
              <p className="text-[15px] text-muted">
                Speak to the centre in-charge if your token is skipped or the queue is not moving.
              </p>
              <Button
                href={`tel:${queue.inchargeMobile}`}
                variant="secondary"
                fullWidth
                className="mt-3"
                icon={<Icon name="phone" className="h-4 w-4" />}
              >
                Call the centre
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}

export default function QueueTracker() {
  const { bookingId } = useParams()
  return bookingId ? <QueueView bookingId={bookingId} /> : <QueuePicker />
}
