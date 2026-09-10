import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States.jsx'
import { procurementApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { PROCUREMENT_STATUS } from '../utils/constants.js'
import { formatCurrency, formatDate, formatDateTime, formatQuantity } from '../utils/format.js'

function ProcurementCard({ record }) {
  const done = record.status === PROCUREMENT_STATUS.COMPLETED
  const deductionTotal = (record.deductions || []).reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card>
      <CardHeader
        title={`${record.cropName} at ${record.centreName}`}
        subtitle={`Lot ${record.lotId} | ${formatDate(record.date)}`}
        action={<StatusBadge kind="procurement" status={record.status} />}
      />
      <CardBody>
        <DetailList
          columns={3}
          items={[
            { label: 'Gate entry', value: formatDateTime(record.gateEntryAt) },
            { label: 'Weight recorded', value: formatQuantity(record.weighedQuintal) },
            { label: 'Accepted', value: done ? formatQuantity(record.acceptedQuintal) : 'Waiting for weighment' },
            { label: 'Moisture at centre', value: record.moisturePercent ? `${record.moisturePercent}%` : null },
            { label: 'Grade', value: record.grade },
            { label: 'Rate applied', value: record.mspPerQuintal ? `${formatCurrency(record.mspPerQuintal)} per quintal` : null },
            { label: 'Acknowledgement slip', value: record.ackSlipNumber },
            { label: 'Weighed by', value: record.officer },
            { label: 'Completed at', value: record.completedAt ? formatDateTime(record.completedAt) : null },
          ]}
        />

        {done ? (
          <div className="mt-5 border border-line">
            <table className="w-full text-[15px]">
              <caption className="sr-only">Amount calculation</caption>
              <tbody className="divide-y divide-line">
                <tr>
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">
                    {formatQuantity(record.acceptedQuintal)} at {formatCurrency(record.mspPerQuintal)}
                  </th>
                  <td className="px-4 py-2.5 text-right font-semibold text-ink tnum">
                    {formatCurrency(record.grossAmount)}
                  </td>
                </tr>
                {(record.deductions || []).map((deduction) => (
                  <tr key={deduction.label}>
                    <th scope="row" className="px-4 py-2.5 text-left font-normal text-muted">
                      {deduction.label}
                    </th>
                    <td className="px-4 py-2.5 text-right text-muted tnum">-{formatCurrency(deduction.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-paper">
                  <th scope="row" className="px-4 py-3 text-left font-semibold text-ink">
                    Amount payable to you
                    {deductionTotal ? (
                      <span className="ml-2 text-sm font-normal text-muted">
                        after {formatCurrency(deductionTotal)} deduction
                      </span>
                    ) : null}
                  </th>
                  <td className="px-4 py-3 text-right text-lg font-bold text-ink tnum">
                    {formatCurrency(record.netAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 flex items-start gap-2 border border-grain-200 bg-grain-50 px-4 py-3 text-[15px] text-grain-700">
            <Icon name="scale" className="mt-0.5 h-5 w-5 shrink-0" />
            Your lot is at the counter. The final weight, grade and amount appear here once the centre completes
            the entry.
          </p>
        )}
      </CardBody>
      {done ? (
        <CardFooter>
          <Button to="/payments" variant="secondary" size="sm">
            Track the payment for this lot
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}

export default function ProcurementStatus() {
  useDocumentTitle('Procurement records')
  const { data: records, loading, error, refetch } = useApi(() => procurementApi.list(), [], { pollMs: 20000 })

  return (
    <>
      <PageHeader
        title="Procurement"
        hindiTitle="खरीद"
        description="What the centre weighed, what it accepted and the amount worked out for each lot."
        actions={
          <Button variant="neutral" size="sm" onClick={() => refetch()} icon={<Icon name="refresh" className="h-4 w-4" />}>
            Refresh
          </Button>
        }
      />

      {loading && !records ? <SkeletonRows rows={2} /> : null}
      {error && !records ? <ErrorState error={error} onRetry={refetch} title="Records did not load" /> : null}

      {records ? (
        records.length === 0 ? (
          <EmptyState
            icon="scale"
            title="No procurement yet"
            description="Once your crop is weighed at a centre, the weighment, grade and amount appear here."
            action={
              <Button to="/centres" size="lg">
                Find a procurement centre
              </Button>
            }
          />
        ) : (
          <div className="space-y-5">
            {records.map((record) => (
              <ProcurementCard key={record.id} record={record} />
            ))}
          </div>
        )
      ) : null}
    </>
  )
}
