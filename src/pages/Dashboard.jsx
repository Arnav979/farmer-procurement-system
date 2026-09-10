import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx'
import TokenPlate from '../components/farmer/TokenPlate.jsx'
import DemoNotice from '../components/farmer/DemoNotice.jsx'
import { dashboardApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useAuth } from '../context/AuthContext.jsx'
import { BOOKING_STATUS } from '../utils/constants.js'
import {
  formatCurrency,
  formatQuantity,
  formatSlotRange,
  formatDate,
  relativeDay,
  isToday,
} from '../utils/format.js'

const QUICK_ACTIONS = [
  { to: '/crops', label: 'Enter crop details', hindi: 'फसल का विवरण', icon: 'wheat' },
  { to: '/centres', label: 'Find a centre', hindi: 'क्रय केंद्र खोजें', icon: 'map-pin' },
  { to: '/queue', label: 'Live queue', hindi: 'कतार देखें', icon: 'ticket' },
  { to: '/payments', label: 'Payment status', hindi: 'भुगतान', icon: 'rupee' },
]

function StatTile({ label, value, sub, to }) {
  const content = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink tnum">{value}</p>
      {sub ? <p className="mt-0.5 text-sm text-muted">{sub}</p> : null}
    </>
  )
  if (to) {
    return (
      <Link to={to} className="block border border-line bg-white px-4 py-3 hover:border-brand-600">
        {content}
      </Link>
    )
  }
  return <div className="border border-line bg-white px-4 py-3">{content}</div>
}

function ActiveBooking({ booking }) {
  const today = isToday(booking.date)
  const canCheckIn = booking.status === BOOKING_STATUS.BOOKED && today
  const inQueue = booking.status === BOOKING_STATUS.CHECKED_IN || booking.status === BOOKING_STATUS.SERVING

  return (
    <Card className="border-l-4 border-l-brand-600">
      <CardHeader
        title="Your next slot"
        subtitle={`${relativeDay(booking.date)}, ${formatSlotRange(booking.startTime, booking.endTime)}`}
        action={<StatusBadge kind="booking" status={booking.status} />}
      />
      <CardBody className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)]">
        <TokenPlate tokenNumber={booking.tokenNumber} size="sm" />
        <DetailList
          items={[
            { label: 'Centre', value: booking.centreName, wide: true },
            { label: 'Crop', value: `${booking.cropName} (${booking.variety})` },
            { label: 'Quantity', value: formatQuantity(booking.quantityQuintal) },
            { label: 'Date', value: formatDate(booking.date) },
            { label: 'Booking reference', value: booking.reference },
          ]}
        />
      </CardBody>
      <CardFooter className="flex flex-wrap gap-2">
        {inQueue ? (
          <Button to={`/queue/${booking.id}`} size="md" icon={<Icon name="ticket" className="h-4 w-4" />}>
            Watch the queue
          </Button>
        ) : canCheckIn ? (
          <Button to={`/check-in/${booking.id}`} size="md">
            Check in at the centre
          </Button>
        ) : null}
        <Button to={`/bookings/${booking.id}`} variant="neutral" size="md">
          View token slip
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function Dashboard() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const { data, loading, error, refetch } = useApi(() => dashboardApi.summary(), [], { pollMs: 30000 })

  const firstName = (data?.profile?.name || user?.name || 'Kisan').split(' ')[0]

  return (
    <>
      <PageHeader
        title={`Namaste, ${firstName}`}
        description={
          data?.profile
            ? `${data.profile.village}, ${data.profile.district} | Farmer ID ${data.profile.farmerId || data.profile.id}`
            : 'Your procurement summary'
        }
        actions={
          <Button variant="neutral" size="sm" onClick={() => refetch()} icon={<Icon name="refresh" className="h-4 w-4" />}>
            Refresh
          </Button>
        }
      />

      {loading && !data ? <LoadingState label="Loading your dashboard" /> : null}
      {error && !data ? <ErrorState error={error} onRetry={refetch} title="Dashboard did not load" /> : null}

      {data ? (
        <div className="space-y-6">
          {data.activeBooking ? (
            <ActiveBooking booking={data.activeBooking} />
          ) : (
            <EmptyState
              icon="ticket"
              title="You have no slot booked"
              description={
                data.readyLots > 0
                  ? `You have ${data.readyLots} crop ${data.readyLots === 1 ? 'lot' : 'lots'} ready to sell. Pick a centre and book a time slot.`
                  : 'Start by entering the crop you want to sell. Then choose a centre and book a time slot.'
              }
              action={
                data.readyLots > 0 ? (
                  <Button to="/centres" size="lg">
                    Find a procurement centre
                  </Button>
                ) : (
                  <Button to="/crops" size="lg">
                    Enter crop details
                  </Button>
                )
              }
            />
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Crop lots ready"
              value={data.readyLots}
              sub={`${data.totalLots} entered in total`}
              to="/crops"
            />
            <StatTile label="Quantity to sell" value={formatQuantity(data.quantityAwaiting)} sub="Not yet procured" />
            <StatTile
              label="Payment pending"
              value={formatCurrency(data.pendingPaymentAmount)}
              sub={`${data.pendingPaymentCount} payment${data.pendingPaymentCount === 1 ? '' : 's'} in process`}
              to="/payments"
            />
            <StatTile
              label="Received this season"
              value={formatCurrency(data.creditedTotal)}
              sub={`${data.procurementCount} lot${data.procurementCount === 1 ? '' : 's'} procured`}
              to="/procurement"
            />
          </div>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">What do you want to do</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex min-h-[104px] flex-col justify-between border border-line bg-white p-4 hover:border-brand-600"
                >
                  <Icon name={action.icon} className="h-7 w-7 text-brand-600" />
                  <span>
                    <span className="block font-semibold text-ink">{action.label}</span>
                    <span className="block text-sm text-muted">{action.hindi}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {data.recentPayment ? (
            <Card>
              <CardHeader
                title="Latest payment"
                subtitle={`${data.recentPayment.cropName}, ${formatQuantity(data.recentPayment.quantityQuintal)}`}
                action={<StatusBadge kind="payment" status={data.recentPayment.status} />}
              />
              <CardBody className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">Amount</p>
                  <p className="text-2xl font-bold text-ink tnum">{formatCurrency(data.recentPayment.amount)}</p>
                </div>
                <Button to={`/payments/${data.recentPayment.id}`} variant="secondary" size="sm">
                  See all four stages
                </Button>
              </CardBody>
            </Card>
          ) : null}

          {data.profile && !data.profile.bank?.aadhaarSeeded ? (
            <Alert tone="warning" title="Your bank account is not marked Aadhaar-seeded">
              Payment through DBT can fail without seeding. Visit your branch, then update the account in{' '}
              <Link to="/profile" className="font-semibold underline">
                your profile
              </Link>
              .
            </Alert>
          ) : null}

          <DemoNotice />
        </div>
      ) : null}
    </>
  )
}
