import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx'
import { bookingApi, centreApi, cropApi } from '../api/services.js'
import { useApi, useMutation } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useToast } from '../context/ToastContext.jsx'
import { CROPS } from '../utils/constants.js'
import {
  formatCurrency,
  formatDuration,
  formatQuantity,
  formatShortDate,
  formatSlotRange,
  formatWeekday,
  relativeDay,
} from '../utils/format.js'

const STEPS = ['Choose crop', 'Choose date', 'Choose time', 'Confirm']

export default function SlotBooking() {
  const { centreId } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()

  const centreQuery = useApi(() => centreApi.detail(centreId), [centreId])
  const lotsQuery = useApi(() => cropApi.list(), [])
  const slotsQuery = useApi(() => centreApi.slots(centreId), [centreId])

  const [lotId, setLotId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')

  const createBooking = useMutation((payload) => bookingApi.create(payload))

  const centre = centreQuery.data
  const readyLots = useMemo(
    () => (lotsQuery.data || []).filter((lot) => lot.status === 'ready'),
    [lotsQuery.data],
  )
  const eligibleLots = useMemo(
    () => readyLots.filter((lot) => !centre || centre.cropsAccepted.includes(lot.cropCode)),
    [readyLots, centre],
  )

  const dates = useMemo(() => {
    const unique = [...new Set((slotsQuery.data || []).map((slot) => slot.date))]
    return unique.sort()
  }, [slotsQuery.data])

  const slotsForDate = useMemo(
    () => (slotsQuery.data || []).filter((slot) => slot.date === date),
    [slotsQuery.data, date],
  )

  const selectedLot = eligibleLots.find((lot) => lot.id === lotId)
  const selectedSlot = slotsForDate.find((slot) => slot.startTime === startTime)
  const crop = CROPS.find((item) => item.code === selectedLot?.cropCode)

  const currentStep = !lotId ? 0 : !date ? 1 : !startTime ? 2 : 3

  const loading = centreQuery.loading || lotsQuery.loading || slotsQuery.loading
  const loadError = centreQuery.error || lotsQuery.error || slotsQuery.error

  useDocumentTitle(centre ? `Book a slot at ${centre.name}` : 'Book a slot')

  const submit = async () => {
    const result = await createBooking.mutate({
      centreId,
      lotId,
      date,
      startTime,
      quantityQuintal: selectedLot.quantityQuintal,
    })
    if (result.ok) {
      notify(`Token #${result.data.tokenNumber} issued`, 'success', 6000)
      navigate(`/bookings/${result.data.id}`, { replace: true, state: { justBooked: true } })
    } else if (result.error?.code === 'slot_full') {
      slotsQuery.refetch()
      setStartTime('')
    }
  }

  if (loading && !centre) return <LoadingState label="Loading booking options" />
  if (loadError && !centre) {
    return <ErrorState error={loadError} onRetry={() => { centreQuery.refetch(); slotsQuery.refetch(); lotsQuery.refetch() }} />
  }
  if (!centre) return null

  return (
    <>
      <PageHeader
        back={{ to: `/centres/${centreId}`, label: 'Back to centre' }}
        title="Book a slot"
        hindiTitle="स्लॉट बुक करें"
        description={`${centre.name}, ${centre.village}`}
      />

      <div className="mb-5">
        <Stepper steps={STEPS} current={currentStep} />
      </div>

      {createBooking.error ? (
        <Alert tone="danger" title="Booking not completed" className="mb-5">
          {createBooking.error.message}
        </Alert>
      ) : null}

      {readyLots.length === 0 ? (
        <EmptyState
          icon="wheat"
          title="No crop lot is ready to book"
          description="Add the crop you want to sell first. Lots that already have a slot cannot be booked again."
          action={
            <Button to="/crops" size="lg">
              Enter crop details
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <Card>
              <CardHeader title="1. Which crop lot are you bringing" />
              <CardBody>
                {eligibleLots.length === 0 ? (
                  <Alert tone="warning" title="This centre does not buy your crop">
                    {centre.name} buys only{' '}
                    {centre.cropsAccepted
                      .map((code) => CROPS.find((item) => item.code === code)?.name)
                      .filter(Boolean)
                      .join(', ')}
                    .{' '}
                    <Button to="/centres" variant="ghost" size="sm" className="ml-1 px-1">
                      See other centres
                    </Button>
                  </Alert>
                ) : (
                  <fieldset>
                    <legend className="sr-only">Select a crop lot</legend>
                    <div className="space-y-3">
                      {eligibleLots.map((lot) => (
                        <label
                          key={lot.id}
                          className={`flex cursor-pointer items-start gap-3 border p-3 ${
                            lotId === lot.id ? 'border-brand-600 bg-brand-50' : 'border-line bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="lot"
                            value={lot.id}
                            checked={lotId === lot.id}
                            onChange={() => setLotId(lot.id)}
                            className="mt-1 h-5 w-5 accent-brand-600"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-ink">
                              {lot.cropName}{' '}
                              <span className="ml-2 text-[15px] font-normal text-muted">{lot.variety}</span>
                            </span>
                            <span className="mt-0.5 block text-[15px] text-muted tnum">
                              {formatQuantity(lot.quantityQuintal)} | {lot.bags ?? '—'} bags | moisture{' '}
                              {lot.moisturePercent}% | lot {lot.id}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="2. Which day will you come"
                subtitle="Slots close 30 minutes before they start"
              />
              <CardBody>
                {slotsQuery.loading && !slotsQuery.data ? (
                  <p className="text-[15px] text-muted">Loading available days</p>
                ) : dates.length === 0 ? (
                  <Alert tone="warning" title="No slots are open at this centre right now">
                    Try another centre, or check again tomorrow morning.
                  </Alert>
                ) : (
                  <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                    {dates.map((value) => {
                      const openCount = (slotsQuery.data || []).filter(
                        (slot) => slot.date === value && slot.available,
                      ).length
                      const selected = date === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setDate(value)
                            setStartTime('')
                          }}
                          disabled={openCount === 0}
                          className={`flex min-w-[92px] shrink-0 flex-col items-center border px-3 py-2.5 ${
                            selected
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : openCount === 0
                                ? 'cursor-not-allowed border-line bg-paper text-muted/60'
                                : 'border-line bg-white text-ink hover:border-brand-600'
                          }`}
                          aria-pressed={selected}
                        >
                          <span className="text-sm">{formatWeekday(value)}</span>
                          <span className="text-lg font-bold tnum">{formatShortDate(value)}</span>
                          <span className={`text-xs tnum ${selected ? 'text-white/80' : 'text-muted'}`}>
                            {openCount === 0 ? 'Full' : `${openCount} open`}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="3. Choose a time slot" subtitle={date ? relativeDay(date) : 'Pick a day first'} />
              <CardBody>
                {!date ? (
                  <p className="text-[15px] text-muted">Choose a day above to see the time slots.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {slotsForDate.map((slot) => {
                      const selected = startTime === slot.startTime
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setStartTime(slot.startTime)}
                          aria-pressed={selected}
                          className={`border px-3 py-3 text-left ${
                            selected
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : slot.available
                                ? 'border-line bg-white text-ink hover:border-brand-600'
                                : 'cursor-not-allowed border-line bg-paper text-muted/70'
                          }`}
                        >
                          <span className="block font-semibold tnum">
                            {formatSlotRange(slot.startTime, slot.endTime)}
                          </span>
                          <span className={`mt-0.5 block text-sm tnum ${selected ? 'text-white/85' : 'text-muted'}`}>
                            {slot.available
                              ? `${slot.remaining} of ${slot.capacity} left`
                              : slot.unavailableReason}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardHeader title="Your booking" />
              <CardBody>
                <DetailList
                  columns={1}
                  items={[
                    { label: 'Centre', value: centre.name },
                    {
                      label: 'Crop lot',
                      value: selectedLot
                        ? `${selectedLot.cropName} (${selectedLot.variety}), ${formatQuantity(selectedLot.quantityQuintal)}`
                        : 'Not chosen yet',
                    },
                    { label: 'Day', value: date ? `${relativeDay(date)}, ${formatShortDate(date)}` : 'Not chosen yet' },
                    {
                      label: 'Time',
                      value: selectedSlot
                        ? formatSlotRange(selectedSlot.startTime, selectedSlot.endTime)
                        : 'Not chosen yet',
                    },
                    {
                      label: 'Value at support price',
                      value:
                        crop && selectedLot ? formatCurrency(crop.msp * selectedLot.quantityQuintal) : undefined,
                    },
                  ]}
                />

                <p className="mt-4 text-sm text-muted">
                  Waiting time at this centre right now is about{' '}
                  {formatDuration(centre.queue.estimatedWaitMinutes)}. Booking is free.
                </p>

                <Button
                  size="lg"
                  fullWidth
                  className="mt-4"
                  onClick={submit}
                  disabled={!lotId || !date || !startTime}
                  loading={createBooking.loading}
                >
                  {createBooking.loading ? 'Booking your slot' : 'Confirm and get token'}
                </Button>
                <p className="mt-2 text-sm text-muted">
                  You can cancel up to the start of your slot. One lot can have only one booking.
                </p>
              </CardBody>
            </Card>

            <Alert tone="info" title="Bring these with you">
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>Token number and booking reference</li>
                <li>Aadhaar card and bank passbook</li>
                <li>Land record copy</li>
              </ul>
            </Alert>
          </div>
        </div>
      )}
    </>
  )
}
