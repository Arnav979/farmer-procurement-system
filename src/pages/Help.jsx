import Container from '../components/layout/Container.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { HELPLINE, MAX_MOISTURE_PERCENT } from '../utils/constants.js'

const RULES = [
  {
    question: 'Do I have to book a slot?',
    answer:
      'Yes. Centres issue tokens only against booked slots so that farmers are not made to wait overnight at the gate. Booking is free and takes a few minutes.',
  },
  {
    question: 'What if I reach after my slot time?',
    answer:
      'Reach within your slot. If you are late on the same day, report at the gate and the centre will fit you in after the booked tokens, if capacity is left.',
  },
  {
    question: 'How dry should the crop be?',
    answer: `Foodgrain is accepted up to ${MAX_MOISTURE_PERCENT}% moisture. Above that the centre can refuse the lot, so dry and clean the grain before loading.`,
  },
  {
    question: 'Can somebody else bring my crop?',
    answer:
      'The person named on the land record must be present with an Aadhaar card. Payment is made only to the Aadhaar-seeded bank account of that person.',
  },
  {
    question: 'When will I get the money?',
    answer:
      'Payment normally reaches your account within three working days of procurement. You can follow all four stages on the payment page.',
  },
  {
    question: 'My token is not moving in the queue',
    answer:
      'Speak to the centre in-charge first; the number is on the centre page. If it is still not resolved, call the Kisan helpline.',
  },
]

export default function Help() {
  useDocumentTitle('Help and rules')

  return (
    <Container className="max-w-3xl py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">
        Help and rules <span className="ml-2 text-lg font-medium text-muted">सहायता</span>
      </h1>
      <p className="mt-1.5 text-[15px] text-muted">
        Common questions about booking a slot and selling your crop at a procurement centre.
      </p>

      <div className="mt-6 space-y-4">
        {RULES.map((rule) => (
          <Card key={rule.question}>
            <CardHeader title={rule.question} />
            <CardBody>
              <p className="text-[15px] text-ink/90">{rule.answer}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-l-4 border-l-brand-600">
        <CardBody>
          <h2 className="text-lg font-semibold text-ink">Still stuck?</h2>
          <p className="mt-1 text-[15px] text-muted">
            The Kisan helpline is open 6:00 AM to 10:00 PM, every day. An operator can also book a slot for you
            over the phone.
          </p>
          <Button href={`tel:${HELPLINE.replace(/-/g, '')}`} className="mt-4" size="lg">
            Call {HELPLINE}
          </Button>
        </CardBody>
      </Card>
    </Container>
  )
}
