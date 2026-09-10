// Every server path the frontend knows about, in one place.
// When the Django REST API is ready, only this file (and the base URL in .env)
// should need to change if the route names differ.

export const ENDPOINTS = {
  auth: {
    requestOtp: '/auth/otp/request/',
    verifyOtp: '/auth/otp/verify/',
    register: '/auth/register/',
    refresh: '/auth/token/refresh/',
    logout: '/auth/logout/',
    me: '/auth/me/',
  },
  profile: {
    detail: '/farmers/me/',
    update: '/farmers/me/',
    bankAccount: '/farmers/me/bank-account/',
  },
  crops: {
    list: '/crop-lots/',
    create: '/crop-lots/',
    detail: (lotId) => `/crop-lots/${lotId}/`,
    update: (lotId) => `/crop-lots/${lotId}/`,
    remove: (lotId) => `/crop-lots/${lotId}/`,
    catalogue: '/crops/',
  },
  centres: {
    list: '/procurement-centres/',
    detail: (centreId) => `/procurement-centres/${centreId}/`,
    slots: (centreId) => `/procurement-centres/${centreId}/slots/`,
    queue: (centreId) => `/procurement-centres/${centreId}/queue/`,
  },
  bookings: {
    list: '/bookings/',
    create: '/bookings/',
    detail: (bookingId) => `/bookings/${bookingId}/`,
    cancel: (bookingId) => `/bookings/${bookingId}/cancel/`,
    checkIn: (bookingId) => `/bookings/${bookingId}/check-in/`,
    queuePosition: (bookingId) => `/bookings/${bookingId}/queue-position/`,
  },
  procurement: {
    list: '/procurements/',
    detail: (procurementId) => `/procurements/${procurementId}/`,
  },
  payments: {
    list: '/payments/',
    detail: (paymentId) => `/payments/${paymentId}/`,
  },
}

export default ENDPOINTS
