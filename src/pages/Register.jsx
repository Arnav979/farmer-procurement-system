import { Link, useNavigate } from 'react-router-dom'
import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import { TextInput, SelectInput, Checkbox } from '../components/ui/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useForm } from '../hooks/useForm.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { STATES } from '../utils/constants.js'
import {
  validateAadhaar,
  validateAccountNumber,
  validateIfsc,
  validateLandSize,
  validateMobile,
  validateName,
  validatePincode,
  required,
} from '../utils/validation.js'

const initialValues = {
  name: '',
  mobile: '',
  aadhaar: '',
  farmerId: '',
  village: '',
  tehsil: '',
  district: '',
  state: '',
  pincode: '',
  landAcres: '',
  landRecordId: '',
  accountNumber: '',
  ifsc: '',
  bankName: '',
  branch: '',
  aadhaarSeeded: false,
  consent: false,
}

const validators = {
  name: validateName,
  mobile: validateMobile,
  aadhaar: (value) => validateAadhaar(value),
  village: required('Village'),
  district: required('District'),
  state: required('State'),
  pincode: validatePincode,
  landAcres: validateLandSize,
  accountNumber: validateAccountNumber,
  ifsc: validateIfsc,
  bankName: required('Bank name'),
  consent: (value) => (value ? '' : 'Please confirm the declaration before registering'),
}

export default function Register() {
  useDocumentTitle('Register as a farmer')
  const navigate = useNavigate()
  const { register } = useAuth()
  const { notify } = useToast()

  const form = useForm({
    initialValues,
    validators,
    onSubmit: async (values, { setFieldError, setFormError }) => {
      try {
        const user = await register(values)
        notify(`Registration complete. Farmer ID ${user.id}`, 'success', 7000)
        navigate('/crops', { replace: true, state: { firstVisit: true } })
      } catch (error) {
        if (error.fieldErrors) {
          Object.entries(error.fieldErrors).forEach(([field, message]) => setFieldError(field, message))
        }
        setFormError(error.message)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
  })

  const digitsOnly = (field, length) => (event) =>
    form.setValue(field, event.target.value.replace(/\D/g, '').slice(0, length))

  const bind = (field) => ({
    name: field,
    value: form.values[field],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.fieldError(field),
  })

  return (
    <Container className="max-w-3xl py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">
        Register as a farmer <span className="ml-2 text-lg font-medium text-muted">किसान पंजीकरण</span>
      </h1>
      <p className="mt-1.5 max-w-[60ch] text-[15px] text-muted">
        Register once. After that you only need your mobile number to book a slot for any crop, at any listed
        centre.
      </p>

      {form.formError ? (
        <Alert tone="danger" title="Registration could not be completed" className="mt-5">
          {form.formError}
        </Alert>
      ) : null}

      <form onSubmit={form.handleSubmit} noValidate className="mt-6 space-y-6">
        <Card>
          <CardHeader title="Your details" subtitle="Enter the name exactly as it appears on your land record" />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <TextInput
              label="Full name"
              hindiLabel="पूरा नाम"
              required
              autoComplete="name"
              placeholder="Ramesh Kumar"
              {...bind('name')}
            />
            <TextInput
              label="Mobile number"
              hindiLabel="मोबाइल नंबर"
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              prefix="+91"
              autoComplete="tel-national"
              hint="Your token and payment messages come to this number"
              {...bind('mobile')}
              onChange={digitsOnly('mobile', 10)}
            />
            <TextInput
              label="Aadhaar number"
              hindiLabel="आधार नंबर"
              required
              type="tel"
              inputMode="numeric"
              maxLength={12}
              hint="Needed for direct benefit transfer of your payment"
              {...bind('aadhaar')}
              onChange={digitsOnly('aadhaar', 12)}
            />
            <TextInput
              label="Farmer registration ID"
              hint="If your state has already issued you one"
              {...bind('farmerId')}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Village and land" subtitle="Used to show the procurement centres closest to you" />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <TextInput label="Village" hindiLabel="गाँव" required {...bind('village')} />
            <TextInput label="Tehsil or block" {...bind('tehsil')} />
            <TextInput label="District" hindiLabel="ज़िला" required {...bind('district')} />
            <SelectInput label="State" hindiLabel="राज्य" required options={STATES} placeholder="Select your state" {...bind('state')} />
            <TextInput
              label="PIN code"
              required
              type="tel"
              inputMode="numeric"
              maxLength={6}
              {...bind('pincode')}
              onChange={digitsOnly('pincode', 6)}
            />
            <TextInput
              label="Land holding"
              required
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              hint="In acres, as written on your land record"
              {...bind('landAcres')}
            />
            <TextInput
              label="Land record number"
              hint="Khasra, khatauni or survey number"
              className="sm:col-span-2"
              {...bind('landRecordId')}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Bank account for payment"
            subtitle="Payment is credited only to an account seeded with your Aadhaar"
          />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <TextInput
              label="Account number"
              required
              type="tel"
              inputMode="numeric"
              maxLength={18}
              {...bind('accountNumber')}
              onChange={digitsOnly('accountNumber', 18)}
            />
            <TextInput
              label="IFSC code"
              required
              placeholder="SBIN0001234"
              maxLength={11}
              {...bind('ifsc')}
              onChange={(event) => form.setValue('ifsc', event.target.value.toUpperCase().slice(0, 11))}
            />
            <TextInput label="Bank name" required placeholder="State Bank of India" {...bind('bankName')} />
            <TextInput label="Branch" {...bind('branch')} />
            <Checkbox
              className="sm:col-span-2"
              name="aadhaarSeeded"
              checked={form.values.aadhaarSeeded}
              onChange={form.handleChange}
              label="This account is seeded with my Aadhaar"
              hint="If you are not sure, ask your bank branch. Payment can fail without seeding."
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Checkbox
              name="consent"
              checked={form.values.consent}
              onChange={form.handleChange}
              label="I declare that the details above are correct"
              hint="The crop I bring will be my own produce. I understand that wrong details can cancel my token."
            />
            {form.fieldError('consent') ? (
              <p className="mt-2 text-sm font-medium text-danger-600">{form.fieldError('consent')}</p>
            ) : null}

            <Button type="submit" size="lg" fullWidth className="mt-5" loading={form.submitting}>
              {form.submitting ? 'Registering' : 'Complete registration'}
            </Button>
            <p className="mt-3 text-[15px] text-muted">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-brand-700 underline">
                Log in with your mobile number
              </Link>
            </p>
          </CardBody>
        </Card>
      </form>
    </Container>
  )
}
