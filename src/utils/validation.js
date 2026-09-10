import { MAX_MOISTURE_PERCENT } from './constants.js'

export const required = (label) => (value) =>
  value === undefined || value === null || String(value).trim() === '' ? `${label} is required` : ''

export function validateMobile(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return 'Enter your mobile number'
  if (digits.length !== 10) return 'Mobile number must be 10 digits'
  if (!/^[6-9]/.test(digits)) return 'Mobile number must start with 6, 7, 8 or 9'
  return ''
}

export function validateOtp(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return 'Enter the 6-digit OTP'
  if (digits.length !== 6) return 'OTP must be 6 digits'
  return ''
}

export function validateName(value) {
  const name = String(value || '').trim()
  if (!name) return 'Enter your full name'
  if (name.length < 3) return 'Name must be at least 3 letters'
  if (!/^[A-Za-z\u0900-\u097F .'-]+$/.test(name)) return 'Name can only contain letters'
  return ''
}

export function validateAadhaar(value, { optional = false } = {}) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return optional ? '' : 'Enter your 12-digit Aadhaar number'
  if (digits.length !== 12) return 'Aadhaar number must be 12 digits'
  return ''
}

export function validateAccountNumber(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return 'Enter your bank account number'
  if (digits.length < 9 || digits.length > 18) return 'Account number must be 9 to 18 digits'
  return ''
}

export function validateIfsc(value) {
  const code = String(value || '').trim().toUpperCase()
  if (!code) return 'Enter the IFSC code of your branch'
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code)) return 'IFSC looks incorrect. Example: SBIN0001234'
  return ''
}

export function validatePincode(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return 'Enter your PIN code'
  if (digits.length !== 6) return 'PIN code must be 6 digits'
  return ''
}

export function validateQuantity(value, { max = 2000 } = {}) {
  if (value === '' || value === null || value === undefined) return 'Enter the quantity you want to sell'
  const quantity = Number(value)
  if (Number.isNaN(quantity)) return 'Quantity must be a number'
  if (quantity <= 0) return 'Quantity must be more than 0'
  if (quantity > max) return `Quantity cannot be more than ${max} quintal in one lot`
  return ''
}

export function validateMoisture(value) {
  if (value === '' || value === null || value === undefined) return 'Enter the moisture reading'
  const moisture = Number(value)
  if (Number.isNaN(moisture)) return 'Moisture must be a number'
  if (moisture < 5 || moisture > 40) return 'Moisture must be between 5% and 40%'
  return ''
}

export function moistureWarning(value) {
  const moisture = Number(value)
  if (Number.isNaN(moisture) || value === '') return ''
  return moisture > MAX_MOISTURE_PERCENT
    ? `Above ${MAX_MOISTURE_PERCENT}% moisture the centre can refuse the lot. Dry the crop before you come.`
    : ''
}

export function validateLandSize(value) {
  if (value === '' || value === null || value === undefined) return 'Enter your land holding'
  const acres = Number(value)
  if (Number.isNaN(acres)) return 'Land holding must be a number'
  if (acres <= 0) return 'Land holding must be more than 0'
  if (acres > 500) return 'Land holding cannot be more than 500 acres'
  return ''
}

/** Runs a { field: validatorFn } map and returns { field: message }. */
export function runValidators(values, validators) {
  const errors = {}
  Object.entries(validators).forEach(([field, validator]) => {
    const message = validator(values[field], values)
    if (message) errors[field] = message
  })
  return errors
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean)
