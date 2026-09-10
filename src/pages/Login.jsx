import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import { TextInput } from '../components/ui/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useForm } from '../hooks/useForm.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { validateMobile, validateOtp } from '../utils/validation.js'
import { formatMobile } from '../utils/format.js'
import { HELPLINE } from '../utils/constants.js'
import { USE_MOCK_API, DEMO_CREDENTIALS } from '../api/config.js'

export default function Login() {
  useDocumentTitle('Log in')
  const navigate = useNavigate()
  const location = useLocation()
  const { requestOtp, login } = useAuth()
  const { notify } = useToast()
  const [stage, setStage] = useState('mobile')
  const [mobile, setMobile] = useState('')

  const redirectTo = location.state?.from || '/dashboard'

  const mobileForm = useForm({
    initialValues: { mobile: '' },
    validators: { mobile: validateMobile },
    onSubmit: async (values, { setFieldError, setFormError }) => {
      try {
        await requestOtp(values.mobile)
        setMobile(values.mobile)
        setStage('otp')
        notify(`OTP sent to ${formatMobile(values.mobile)}`, 'success')
      } catch (error) {
        if (error.code === 'not_registered') {
          setFieldError('mobile', 'This number is not registered yet')
          setFormError(error.message)
        } else {
          setFormError(error.message)
        }
      }
    },
  })

  const otpForm = useForm({
    initialValues: { otp: '' },
    validators: { otp: validateOtp },
    onSubmit: async (values, { setFieldError }) => {
      try {
        const user = await login(mobile, values.otp)
        notify(`Welcome back, ${user.name.split(' ')[0]}`, 'success')
        navigate(redirectTo, { replace: true })
      } catch (error) {
        setFieldError('otp', error.fieldErrors?.otp || 'Incorrect OTP')
        otpForm.setFormError(error.message)
      }
    },
  })

  const resendOtp = async () => {
    try {
      await requestOtp(mobile)
      notify('OTP sent again', 'info')
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  return (
    <Container className="max-w-xl py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">
        Log in <span className="ml-2 text-lg font-medium text-muted">लॉग इन करें</span>
      </h1>
      <p className="mt-1.5 text-[15px] text-muted">
        Use the mobile number you registered with. We send a one-time password to that number.
      </p>

      <Card className="mt-6">
        <CardHeader
          title={stage === 'mobile' ? 'Enter your mobile number' : 'Enter the OTP'}
          subtitle={stage === 'otp' ? `Sent to ${formatMobile(mobile)}` : undefined}
        />
        <CardBody>
          {stage === 'mobile' ? (
            <form onSubmit={mobileForm.handleSubmit} noValidate>
              {mobileForm.formError ? (
                <Alert tone="danger" className="mb-4">
                  {mobileForm.formError}{' '}
                  {mobileForm.errors.mobile === 'This number is not registered yet' ? (
                    <Link to="/register" className="font-semibold underline">
                      Register now
                    </Link>
                  ) : null}
                </Alert>
              ) : null}

              <TextInput
                label="Mobile number"
                hindiLabel="मोबाइल नंबर"
                name="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                prefix="+91"
                required
                placeholder="10 digit number"
                value={mobileForm.values.mobile}
                onChange={(event) =>
                  mobileForm.setValue('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))
                }
                onBlur={mobileForm.handleBlur}
                error={mobileForm.fieldError('mobile')}
              />

              <Button type="submit" size="lg" fullWidth className="mt-5" loading={mobileForm.submitting}>
                {mobileForm.submitting ? 'Sending OTP' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit} noValidate>
              {otpForm.formError ? (
                <Alert tone="danger" className="mb-4">
                  {otpForm.formError}
                </Alert>
              ) : null}

              <TextInput
                label="One-time password"
                hindiLabel="ओटीपी"
                name="otp"
                type="tel"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                placeholder="6 digits"
                className="[&_input]:text-2xl [&_input]:tracking-[0.4em]"
                value={otpForm.values.otp}
                onChange={(event) => otpForm.setValue('otp', event.target.value.replace(/\D/g, '').slice(0, 6))}
                onBlur={otpForm.handleBlur}
                error={otpForm.fieldError('otp')}
              />

              <Button type="submit" size="lg" fullWidth className="mt-5" loading={otpForm.submitting}>
                {otpForm.submitting ? 'Checking' : 'Log in'}
              </Button>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resendOtp}
                  className="text-[15px] font-semibold text-brand-700 underline"
                >
                  Send the OTP again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStage('mobile')
                    otpForm.reset({ otp: '' })
                  }}
                  className="flex items-center gap-1.5 text-[15px] font-medium text-muted underline"
                >
                  <Icon name="arrow-left" className="h-4 w-4" />
                  Change number
                </button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>

      {USE_MOCK_API ? (
        <Alert tone="info" title="Sample login" className="mt-5">
          This build runs on sample data. Log in with{' '}
          <span className="font-semibold tnum">{DEMO_CREDENTIALS.mobile}</span> and OTP{' '}
          <span className="font-semibold tnum">{DEMO_CREDENTIALS.otp}</span> to see a farmer with an active token, or register
          a new number to start empty.
        </Alert>
      ) : null}

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-[15px] text-ink">
          New to the service?{' '}
          <Link to="/register" className="font-semibold text-brand-700 underline">
            Register as a farmer
          </Link>
        </p>
        <p className="mt-2 text-[15px] text-muted">
          If you cannot receive the OTP, call the Kisan helpline{' '}
          <a href={`tel:${HELPLINE.replace(/-/g, '')}`} className="font-semibold text-brand-700 underline tnum">
            {HELPLINE}
          </a>
          .
        </p>
      </div>
    </Container>
  )
}
