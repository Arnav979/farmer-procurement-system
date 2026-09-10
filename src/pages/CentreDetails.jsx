import { useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import CapacityBar from '../components/ui/CapacityBar.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { ErrorState, LoadingState } from '../components/ui/States.jsx'
import { centreApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { CROPS } from '../utils/constants.js'
import { distanceLabel, formatCurrency, formatDuration, formatNumber, formatTime } from '../utils/format.js'

export default function CentreDetails() {
  const { centreId } = useParams()
  const { data: centre, loading, error, refetch } = useApi(() => centreApi.detail(centreId), [centreId], {
    pollMs: 30000,
  })
  useDocumentTitle(centre?.name || 'Centre details')

  if (loading && !centre) return <LoadingState label="Loading centre details" />
  if (error && !centre) return <ErrorState error={error} onRetry={refetch} title="Centre details did not load" />
  if (!centre) return null

  const bookable = centre.status !== 'closed' && centre.status !== 'full'
  const acceptedCrops = CROPS.filter((crop) => centre.cropsAccepted.includes(crop.code))

  return (
    <>
      <PageHeader
        back={{ to: '/centres', label: 'All centres' }}
        title={centre.name}
        description={`${centre.address} - ${centre.pincode}`}
        meta={
          <>
            <StatusBadge kind="centre" status={centre.status} />
            <span className="text-[15px] text-muted">{centre.type}</span>
            <span className="text-[15px] text-muted">{distanceLabel(centre.distanceKm)}</span>
          </>
        }
        actions={
          <Button to={`/book/${centre.id}`} disabled={!bookable} size="md">
            {bookable ? 'Book a slot' : 'Booking closed'}
          </Button>
        }
      />

      {centre.status === 'closed' ? (
        <Alert tone="warning" title="This centre is not accepting crops today" className="mb-5">
          {centre.closedReason}
        </Alert>
      ) : null}
      {centre.status === 'full' ? (
        <Alert tone="warning" title="Today's capacity is full" className="mb-5">
          The centre has taken as much as it can store today. Slots for tomorrow onwards are still open.
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Queue right now"
              subtitle={`${centre.counters} ${centre.counters === 1 ? 'counter' : 'counters'} working, about ${centre.avgServiceMinutes} minutes per farmer`}
              icon={<Icon name="users" className="h-5 w-5 text-brand-600" />}
            />
            <CardBody>
              <div className="grid grid-cols-3 divide-x divide-line border border-line">
                <div className="px-3 py-4 text-center">
                  <p className="text-sm text-muted">Now serving</p>
                  <p className="mt-1 text-3xl font-bold text-steel-600 tnum">#{centre.queue.nowServing}</p>
                </div>
                <div className="px-3 py-4 text-center">
                  <p className="text-sm text-muted">Farmers waiting</p>
                  <p className="mt-1 text-3xl font-bold text-ink tnum">{formatNumber(centre.queue.waiting)}</p>
                </div>
                <div className="px-3 py-4 text-center">
                  <p className="text-sm text-muted">Waiting time</p>
                  <p className="mt-1 text-3xl font-bold text-ink tnum">
                    {formatDuration(centre.queue.estimatedWaitMinutes)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[15px] text-muted">
                Tokens issued today up to #{centre.queue.lastIssuedToken}. If you book now, your token will come
                after this number.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Capacity today" icon={<Icon name="scale" className="h-5 w-5 text-brand-600" />} />
            <CardBody>
              <CapacityBar used={centre.load.usedQuintal} capacity={centre.load.capacityQuintal} />
              <p className="mt-3 text-[15px] text-muted">
                Once the day's capacity is used, the centre stops issuing tokens for the day even if time slots
                look open.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Crops bought here" />
            <CardBody className="p-0 sm:p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-paper text-left text-sm text-muted">
                    <th scope="col" className="px-4 py-2 font-medium">
                      Crop
                    </th>
                    <th scope="col" className="px-4 py-2 text-right font-medium">
                      Support price per quintal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {acceptedCrops.map((crop) => (
                    <tr key={crop.code}>
                      <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">
                        {crop.name}{' '}
                        <span className="ml-2 font-normal text-muted">{crop.hindi}</span>
                      </th>
                      <td className="px-4 py-2.5 text-right font-semibold text-ink tnum">
                        {formatCurrency(crop.msp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Centre information" />
            <CardBody>
              <DetailList
                columns={1}
                items={[
                  { label: 'Open hours', value: `${formatTime(centre.openTime)} to ${formatTime(centre.closeTime)}` },
                  { label: 'Address', value: centre.address },
                  { label: 'Centre in-charge', value: centre.inchargeName },
                  {
                    label: 'Contact',
                    value: (
                      <a href={`tel:${centre.inchargeMobile}`} className="text-brand-700 underline tnum">
                        {centre.inchargeMobile}
                      </a>
                    ),
                  },
                  { label: 'Centre code', value: centre.id },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Facilities at the centre" />
            <CardBody>
              <ul className="space-y-2">
                {centre.facilities.map((facility) => (
                  <li key={facility} className="flex items-start gap-2 text-[15px] text-ink/90">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.4} />
                    {facility}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <div className="hidden lg:block">
            <Button to={`/book/${centre.id}`} disabled={!bookable} size="lg" fullWidth>
              {bookable ? 'Book a slot at this centre' : 'Booking closed'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
