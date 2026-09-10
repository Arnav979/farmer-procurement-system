import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import Alert from '../components/ui/Alert.jsx'
import Badge from '../components/ui/Badge.jsx'
import DetailList from '../components/ui/DetailList.jsx'
import { TextInput, SelectInput, Checkbox } from '../components/ui/Field.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useForm } from '../hooks/useForm.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { STATES, HELPLINE } from '../utils/constants.js'
import { formatDate, formatMobile, maskAccount } from '../utils/format.js'
import {
  required,
  validateAccountNumber,
  validateIfsc,
  validateLandSize,
  validateName,
  validatePincode,
} from '../utils/validation.js'

export default function Profile() {
  useDocumentTitle('My profile')
  const { user, updateProfile, updateBankAccount, logout } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(null)

  const detailsForm = useForm({
    initialValues: {
      name: user?.name || '',
      village: user?.village || '',
      tehsil: user?.tehsil || '',
      district: user?.district || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
      landAcres: user?.landAcres ?? '',
      landRecordId: user?.landRecordId || '',
    },
    validators: {
      name: validateName,
      village: required('Village'),
      district: required('District'),
      state: required('State'),
      pincode: validatePincode,
      landAcres: validateLandSize,
    },
    onSubmit: async (values, { setFormError }) => {
      try {
        await updateProfile(values)
        notify('Your details are updated', 'success')
        setEditing(null)
      } catch (error) {
        setFormError(error.message)
      }
    },
  })

  const bankForm = useForm({
    initialValues: {
      accountNumber: user?.bank?.accountNumber || '',
      ifsc: user?.bank?.ifsc || '',
      bankName: user?.bank?.bankName || '',
      branch: user?.bank?.branch || '',
      aadhaarSeeded: Boolean(user?.bank?.aadhaarSeeded),
    },
    validators: {
      accountNumber: validateAccountNumber,
      ifsc: validateIfsc,
      bankName: required('Bank name'),
    },
    onSubmit: async (values, { setFormError }) => {
      try {
        await updateBankAccount(values)
        notify('Bank account updated', 'success')
        setEditing(null)
      } catch (error) {
        setFormError(error.message)
      }
    },
  })

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  const bind = (form, field) => ({
    name: field,
    value: form.values[field],
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.fieldError(field),
  })

  return (
    <>
      <PageHeader
        title="My profile"
        hindiTitle="मेरी जानकारी"
        description={`Registered on ${formatDate(user.registeredAt)}`}
        actions={
          <Button variant="danger" size="sm" onClick={handleLogout} icon={<Icon name="logout" className="h-4 w-4" />}>
            Log out
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Your details"
              action={
                editing !== 'details' ? (
                  <Button variant="neutral" size="sm" onClick={() => setEditing('details')} icon={<Icon name="edit" className="h-4 w-4" />}>
                    Edit
                  </Button>
                ) : null
              }
            />
            <CardBody>
              {editing === 'details' ? (
                <form onSubmit={detailsForm.handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                  {detailsForm.formError ? (
                    <Alert tone="danger" className="sm:col-span-2">
                      {detailsForm.formError}
                    </Alert>
                  ) : null}
                  <TextInput label="Full name" required {...bind(detailsForm, 'name')} />
                  <TextInput label="Village" required {...bind(detailsForm, 'village')} />
                  <TextInput label="Tehsil or block" {...bind(detailsForm, 'tehsil')} />
                  <TextInput label="District" required {...bind(detailsForm, 'district')} />
                  <SelectInput label="State" required options={STATES} {...bind(detailsForm, 'state')} />
                  <TextInput
                    label="PIN code"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    {...bind(detailsForm, 'pincode')}
                    onChange={(event) =>
                      detailsForm.setValue('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                  />
                  <TextInput
                    label="Land holding"
                    required
                    type="number"
                    step="0.1"
                    hint="In acres"
                    {...bind(detailsForm, 'landAcres')}
                  />
                  <TextInput label="Land record number" {...bind(detailsForm, 'landRecordId')} />
                  <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                    <Button type="submit" loading={detailsForm.submitting}>
                      Save changes
                    </Button>
                    <Button variant="neutral" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <DetailList
                  items={[
                    { label: 'Name', value: user.name },
                    { label: 'Mobile number', value: `+91 ${formatMobile(user.mobile)}` },
                    { label: 'Farmer ID', value: user.farmerId || user.id },
                    { label: 'Aadhaar', value: user.aadhaarLast4 ? `XXXX XXXX ${user.aadhaarLast4}` : 'Not added' },
                    { label: 'Village', value: `${user.village}${user.tehsil ? `, ${user.tehsil}` : ''}` },
                    { label: 'District', value: `${user.district}, ${user.state}` },
                    { label: 'PIN code', value: user.pincode },
                    { label: 'Land holding', value: `${user.landAcres} acres` },
                    { label: 'Land record', value: user.landRecordId || 'Not added' },
                    { label: 'Category', value: user.category },
                  ]}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Bank account for payment"
              subtitle="Payments are credited only to this account"
              action={
                editing !== 'bank' ? (
                  <Button variant="neutral" size="sm" onClick={() => setEditing('bank')} icon={<Icon name="edit" className="h-4 w-4" />}>
                    Edit
                  </Button>
                ) : null
              }
            />
            <CardBody>
              {editing === 'bank' ? (
                <form onSubmit={bankForm.handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                  {bankForm.formError ? (
                    <Alert tone="danger" className="sm:col-span-2">
                      {bankForm.formError}
                    </Alert>
                  ) : null}
                  <TextInput
                    label="Account number"
                    required
                    inputMode="numeric"
                    maxLength={18}
                    {...bind(bankForm, 'accountNumber')}
                    onChange={(event) =>
                      bankForm.setValue('accountNumber', event.target.value.replace(/\D/g, '').slice(0, 18))
                    }
                  />
                  <TextInput
                    label="IFSC code"
                    required
                    maxLength={11}
                    {...bind(bankForm, 'ifsc')}
                    onChange={(event) => bankForm.setValue('ifsc', event.target.value.toUpperCase().slice(0, 11))}
                  />
                  <TextInput label="Bank name" required {...bind(bankForm, 'bankName')} />
                  <TextInput label="Branch" {...bind(bankForm, 'branch')} />
                  <Checkbox
                    className="sm:col-span-2"
                    name="aadhaarSeeded"
                    checked={bankForm.values.aadhaarSeeded}
                    onChange={bankForm.handleChange}
                    label="This account is seeded with my Aadhaar"
                    hint="Ask your bank branch if you are not sure."
                  />
                  <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                    <Button type="submit" loading={bankForm.submitting}>
                      Save bank details
                    </Button>
                    <Button variant="neutral" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <DetailList
                    items={[
                      { label: 'Bank', value: user.bank?.bankName },
                      { label: 'Branch', value: user.bank?.branch || 'Not added' },
                      { label: 'Account number', value: maskAccount(user.bank?.accountNumber) },
                      { label: 'IFSC', value: user.bank?.ifsc },
                    ]}
                  />
                  <div className="mt-4">
                    {user.bank?.aadhaarSeeded ? (
                      <Badge tone="success" dot>
                        Aadhaar seeded
                      </Badge>
                    ) : (
                      <Alert tone="warning" title="Account not marked Aadhaar-seeded">
                        DBT payment can fail. Get the account seeded at your branch, then update it here.
                      </Alert>
                    )}
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Keep your details correct" />
            <CardBody>
              <p className="text-[15px] text-muted">
                The name here must match your land record and your bank account. A mismatch is the most common
                reason a payment fails.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Need help" />
            <CardBody>
              <p className="text-[15px] text-muted">
                Call the Kisan helpline for booking, token or payment problems.
              </p>
              <a
                href={`tel:${HELPLINE.replace(/-/g, '')}`}
                className="mt-2 inline-block text-xl font-bold text-brand-700 tnum"
              >
                {HELPLINE}
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
