import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import { Checkbox } from '../components/ui/Field.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { ErrorState, LoadingState } from '../components/ui/States.jsx'
import TokenPlate from '../components/farmer/TokenPlate.jsx'
import { bookingApi } from '../api/services.js'
import { useApi, useMutation } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useToast } from '../context/ToastContext.jsx'
import { BOOKING_STATUS } from '../utils/constants.js'
import { formatDate, formatQuantity, formatSlotRange, isToday } from '../utils/format.js'

export default function CheckIn() {
  useDocumentTitle('Check in')
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [atGate, setAtGate] = useState(false)
  const [error, setError] = useState('')

  const { data: booking, loading, error: loadError, refetch } = useApi(
    () => bookingApi.detail(bookingId),
    [bookingId],
  )
  const checkIn = useMutation(() => bookingApi.checkIn(bookingId))

  if (loading && !booking) return <LoadingState label="Loading your booking" />
  if (loadError && !booking) return <ErrorState error={loadError} onRetry={refetch} />
  if (!booking) return null

  const today = isToday(booking.date)
  const alreadyIn = [BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.SERVING].includes(booking.status)

  const submit = async () => {
    if (!atGate) {
      setError('Confirm that you have reached the centre before checking in.')
      return
    }
    setError('')
    const result = await checkIn.mutate()
    if (result.ok) {
      notify(`Checked in. Token #${result.data.tokenNumber} is in the queue.`, 'success', 6000)
      navigate(`/queue/${bookingId}`, { replace: true })
    }
  }

  return (
    <>
      <PageHeader
        back={{ to: `/bookings/${bookingId}`, label: 'Back to token' }}
        title="Check in at the centre"
        hindiTitle="केंद्र पर पहुँचकर चेक-इन करें"
        description="Check in only after you reach the centre gate. Your place in the queue starts from check-in."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader title="Booking being checked in" subtitle={booking.centreName} />
          <CardBody className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
            <TokenPlate tokenNumber={booking.tokenNumber} size="sm" />
            <DetailList
              items={[
                { label: 'Date', value: formatDate(booking.date) },
                { label: 'Slot', value: formatSlotRange(booking.startTime, booking.endTime) },
                { label: 'Crop', value: `${booking.cropName} (${booking.variety})` },
                { label: 'Quantity', value: formatQuantity(booking.quantityQuintal) },
                { label: 'Reference', value: booking.reference },
              ]}
            />
          </CardBody>
        </Card>

        <div className="space-y-4">
          {alreadyIn ? (
            <Alert tone="success" title="You are already checked in" action={
              <Button to={`/queue/${bookingId}`} size="md">
                Watch the live queue
              </Button>
            }>
              Your token is in the queue. Watch your position and stay near the counter.
            </Alert>
          ) : booking.status === BOOKING_STATUS.CANCELLED ? (
            <Alert tone="danger" title="This booking was cancelled">
              Book a fresh slot to bring this lot.
            </Alert>
          ) : !today ? (
            <Alert tone="warning" title={`Check-in opens on ${formatDate(booking.date)}`}>
              Come to the centre on your slot day. Checking in early does not move you up the queue.
            </Alert>
          ) : (
            <Card>
              <CardHeader title="Confirm your arrival" />
              <CardBody className="space-y-4">
                <Checkbox
                  name="atGate"
                  checked={atGate}
                  onChange={(event) => {
                    setAtGate(event.target.checked)
                    setError('')
                  }}
                  label="I have reached the centre with my crop"
                  hint="Checking in without arriving can cost you your token."
                />
                {error ? <p className="text-sm font-medium text-danger-600">{error}</p> : null}
                {checkIn.error ? <Alert tone="danger">{checkIn.error.message}</Alert> : null}
                <Button size="lg" fullWidth onClick={submit} loading={checkIn.loading} disabled={!atGate}>
                  Check in now
                </Button>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="At the gate" />
            <CardBody>
              <ul className="space-y-2.5 text-[15px] text-ink/90">
                <li className="flex gap-2.5">
                  <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.4} />
                  Park the trolley in the line marked for booked tokens.
                </li>
                <li className="flex gap-2.5">
                  <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.4} />
                  Keep your token number ready. The gate staff will note it.
                </li>
                <li className="flex gap-2.5">
                  <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.4} />
                  Do not leave the centre once you have checked in. Missing your call means a fresh token.
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
