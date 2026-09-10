import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import Modal from '../components/ui/Modal.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { ErrorState, LoadingState } from '../components/ui/States.jsx'
import TokenPlate from '../components/farmer/TokenPlate.jsx'
import { bookingApi } from '../api/services.js'
import { useApi, useMutation } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { BOOKING_STATUS } from '../utils/constants.js'
import { formatDate, formatQuantity, formatSlotRange, isToday, relativeDay } from '../utils/format.js'

const BRING_ALONG = [
  'Aadhaar card of the land record holder',
  'Bank passbook of the Aadhaar-seeded account',
  'Land record copy (khasra or khatauni)',
  'Crop dried and cleaned, in sound bags',
]

export default function BookingConfirmation() {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { user } = useAuth()
  const [confirmCancel, setConfirmCancel] = useState(false)

  const { data: booking, loading, error, refetch } = useApi(() => bookingApi.detail(bookingId), [bookingId])
  const cancel = useMutation(() => bookingApi.cancel(bookingId, { reason: 'Cancelled by farmer' }))

  useDocumentTitle(booking ? `Token #${booking.tokenNumber}` : 'Your token')

  if (loading && !booking) return <LoadingState label="Loading your token" />
  if (error && !booking) return <ErrorState error={error} onRetry={refetch} title="Token details did not load" />
  if (!booking) return null

  const today = isToday(booking.date)
  const isActive = [BOOKING_STATUS.BOOKED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.SERVING].includes(
    booking.status,
  )
  const canCheckIn = booking.status === BOOKING_STATUS.BOOKED && today
  const inQueue = booking.status === BOOKING_STATUS.CHECKED_IN || booking.status === BOOKING_STATUS.SERVING

  const doCancel = async () => {
    const result = await cancel.mutate()
    setConfirmCancel(false)
    if (result.ok) {
      notify('Booking cancelled. The slot is free for another farmer.', 'success')
      navigate('/dashboard')
    } else if (result.error) {
      notify(result.error.message, 'error')
    }
  }

  return (
    <>
      <PageHeader
        back={{ to: '/dashboard', label: 'Dashboard' }}
        title="Your token"
        hindiTitle="आपका टोकन"
        description={`Booked on ${formatDate(booking.createdAt)}`}
        meta={<StatusBadge kind="booking" status={booking.status} />}
        actions={
          <Button
            variant="neutral"
            size="sm"
            onClick={() => window.print()}
            icon={<Icon name="print" className="h-4 w-4" />}
          >
            Print slip
          </Button>
        }
      />

      {location.state?.justBooked ? (
        <Alert tone="success" title="Slot booked" className="mb-5">
          Show this token at the gate on {relativeDay(booking.date).toLowerCase()},{' '}
          {formatSlotRange(booking.startTime, booking.endTime)}. Keep your phone with you for queue updates.
        </Alert>
      ) : null}

      {booking.status === BOOKING_STATUS.MISSED ? (
        <Alert tone="danger" title="This slot was missed" className="mb-5">
          You did not check in on the day of the slot. Book a new slot to bring this lot.
        </Alert>
      ) : null}
      {booking.status === BOOKING_STATUS.CANCELLED ? (
        <Alert tone="warning" title="This booking was cancelled" className="mb-5">
          The lot is free again. You can book a fresh slot at any centre.
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="print-slip">
          <CardHeader
            title="Procurement token slip"
            subtitle={`${booking.centreName}, ${booking.centreAddress}`}
          />
          <CardBody>
            <div className="grid gap-5 sm:grid-cols-[200px_minmax(0,1fr)]">
              <div>
                <TokenPlate tokenNumber={booking.tokenNumber} />
                <p className="mt-2 text-center text-sm text-muted">
                  Reference <span className="font-semibold text-ink">{booking.reference}</span>
                </p>
              </div>
              <DetailList
                items={[
                  { label: 'Farmer', value: user?.name },
                  { label: 'Farmer ID', value: user?.farmerId || user?.id },
                  { label: 'Date', value: `${relativeDay(booking.date)}, ${formatDate(booking.date)}`, emphasis: true },
                  {
                    label: 'Reporting time',
                    value: formatSlotRange(booking.startTime, booking.endTime),
                    emphasis: true,
                  },
                  { label: 'Crop', value: `${booking.cropName} (${booking.variety})` },
                  { label: 'Quantity declared', value: formatQuantity(booking.quantityQuintal) },
                  { label: 'Lot number', value: booking.lotId },
                  { label: 'Booking number', value: booking.id },
                ]}
              />
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-sm text-muted">
                This slip is issued by the procurement centre through Kisan Kendra. It is not a receipt of sale.
                An acknowledgement slip is issued after weighing.
              </p>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="What to do next" />
            <CardBody className="space-y-3">
              {inQueue ? (
                <>
                  <p className="text-[15px] text-ink/90">You have checked in. Watch the queue and stay nearby.</p>
                  <Button to={`/queue/${booking.id}`} size="lg" fullWidth>
                    Watch the live queue
                  </Button>
                </>
              ) : canCheckIn ? (
                <>
                  <p className="text-[15px] text-ink/90">
                    Your slot is today. Check in when you reach the centre gate so the centre knows you have
                    arrived.
                  </p>
                  <Button to={`/check-in/${booking.id}`} size="lg" fullWidth>
                    Check in at the centre
                  </Button>
                </>
              ) : isActive ? (
                <p className="text-[15px] text-ink/90">
                  Check-in opens on {formatDate(booking.date)}. Reach the centre a little before{' '}
                  {formatSlotRange(booking.startTime, booking.endTime).split(' to ')[0]} and check in from your
                  phone.
                </p>
              ) : (
                <Button to="/centres" size="lg" fullWidth>
                  Book another slot
                </Button>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Bring these with you" />
            <CardBody>
              <ul className="space-y-2">
                {BRING_ALONG.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[15px] text-ink/90">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.4} />
                    {item}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {isActive ? (
            <Button variant="danger" fullWidth onClick={() => setConfirmCancel(true)} className="print-hide">
              Cancel this booking
            </Button>
          ) : null}
        </div>
      </div>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this booking?"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button variant="solidDanger" onClick={doCancel} loading={cancel.loading}>
              Yes, cancel the booking
            </Button>
            <Button variant="neutral" onClick={() => setConfirmCancel(false)}>
              Keep my token
            </Button>
          </div>
        }
      >
        <p>
          Token #{booking.tokenNumber} at {booking.centreName} will be released for another farmer. You will need
          to book again, and the next free slot may be on a later day.
        </p>
      </Modal>
    </>
  )
}
