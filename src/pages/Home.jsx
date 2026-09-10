import { Link } from 'react-router-dom'
import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useAuth } from '../context/AuthContext.jsx'
import { CROPS, HELPLINE } from '../utils/constants.js'
import { formatCurrency } from '../utils/format.js'

const STEPS = [
  {
    title: 'Enter your crop details',
    text: 'Crop, variety, quantity in quintal and moisture reading. Takes two minutes.',
  },
  {
    title: 'Choose a procurement centre',
    text: 'Compare distance, how many farmers are waiting and how much capacity is left today.',
  },
  {
    title: 'Pick a date and time slot',
    text: 'Only slots with space left are shown. Booking is free.',
  },
  {
    title: 'Get your token',
    text: 'A token number is issued right away. Show it at the gate on your slot day.',
  },
  {
    title: 'Check in and sell',
    text: 'Check in when you reach the centre and watch the queue move on your phone.',
  },
  {
    title: 'Get paid to your bank',
    text: 'Payment is transferred by DBT to your Aadhaar-seeded account. You can follow every stage.',
  },
]

const KEEP_READY = [
  'Aadhaar card of the person whose name the land record carries',
  'Bank passbook with the account seeded to that Aadhaar',
  'Land record copy (khasra, khatauni or equivalent)',
  'Crop dried to 17% moisture or below, cleaned and bagged',
]

export default function Home() {
  useDocumentTitle('Crop procurement slot booking')
  const { isAuthenticated } = useAuth()

  return (
    <>
      <div className="border-b border-line bg-white">
        <Container className="py-3">
          <Alert tone="warning" title="Kharif paddy procurement is open">
            Slots are open from 1 October to 31 January at all listed centres. Book at least one day before you
            load your trolley.
          </Alert>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <h1 className="max-w-[18ch] text-3xl font-bold leading-tight text-ink sm:text-[40px]">
              Book your slot before you load the trolley
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink/85">
              Get a token for your nearest procurement centre, see how many farmers are ahead of you, and follow
              your payment until it reaches your bank account. No agent, no waiting overnight at the gate.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {isAuthenticated ? (
                <Button to="/dashboard" size="lg">
                  Go to my dashboard
                </Button>
              ) : (
                <>
                  <Button to="/register" size="lg">
                    Register as a farmer
                  </Button>
                  <Button to="/login" variant="secondary" size="lg">
                    Log in with mobile number
                  </Button>
                </>
              )}
            </div>
            <p className="mt-3 text-[15px] text-muted">
              Already booked?{' '}
              <Link to={isAuthenticated ? '/queue' : '/login'} className="font-semibold text-brand-700 underline">
                Check your token and queue position
              </Link>
            </p>

            <h2 className="mt-12 text-xl font-semibold text-ink">How it works</h2>
            <ol className="mt-4 divide-y divide-line border-y border-line">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-brand-600 text-[15px] font-bold text-brand-700 tnum">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{step.title}</p>
                    <p className="mt-0.5 text-[15px] text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Support prices this season"
                subtitle="Rate per quintal for fair average quality"
                icon={<Icon name="rupee" className="h-5 w-5 text-brand-600" />}
              />
              <CardBody className="p-0 sm:p-0">
                <table className="w-full">
                  <caption className="sr-only">Minimum support price by crop</caption>
                  <tbody className="divide-y divide-line">
                    {CROPS.slice(0, 6).map((crop) => (
                      <tr key={crop.code}>
                        <th scope="row" className="px-4 py-2.5 text-left text-[15px] font-medium text-ink">
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
                <p className="border-t border-line px-4 py-2.5 text-sm text-muted">
                  Rates are indicative. The rate printed on your acknowledgement slip is final.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Keep these ready"
                icon={<Icon name="list" className="h-5 w-5 text-brand-600" />}
              />
              <CardBody>
                <ul className="space-y-2.5">
                  {KEEP_READY.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[15px] text-ink/90">
                      <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.4} />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-l-brand-600">
              <CardBody>
                <h2 className="flex items-center gap-2 font-semibold text-ink">
                  <Icon name="phone" className="h-5 w-5 text-brand-600" />
                  Trouble booking?
                </h2>
                <p className="mt-1 text-[15px] text-muted">
                  Call the Kisan helpline and an operator will book the slot for you over the phone.
                </p>
                <a
                  href={`tel:${HELPLINE.replace(/-/g, '')}`}
                  className="mt-3 inline-block text-2xl font-bold text-brand-700 tnum"
                >
                  {HELPLINE}
                </a>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </>
  )
}
