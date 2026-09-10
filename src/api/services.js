import httpClient from './client.js'
import ENDPOINTS from './endpoints.js'
import { route } from './apiRouter.js'
import * as mock from './mock/handlers.js'

/**
 * The single surface the UI is allowed to touch.
 *
 * Each function is declared once with its mock implementation and its live
 * Django call side by side, so switching backends is a one-line env change and
 * the request/response contract stays visible in one file.
 */

export const authApi = {
  requestOtp: route(mock.requestOtp, (payload) => httpClient.post(ENDPOINTS.auth.requestOtp, payload)),
  verifyOtp: route(mock.verifyOtp, (payload) => httpClient.post(ENDPOINTS.auth.verifyOtp, payload)),
  register: route(mock.register, (payload) => httpClient.post(ENDPOINTS.auth.register, payload)),
  me: route(mock.getCurrentUser, () => httpClient.get(ENDPOINTS.auth.me)),
  logout: route(mock.logout, () => httpClient.post(ENDPOINTS.auth.logout)),
}

export const profileApi = {
  update: route(mock.updateProfile, (payload) => httpClient.patch(ENDPOINTS.profile.update, payload)),
  updateBankAccount: route(mock.updateBankAccount, (payload) =>
    httpClient.put(ENDPOINTS.profile.bankAccount, payload),
  ),
}

export const cropApi = {
  list: route(mock.listCrops, () => httpClient.get(ENDPOINTS.crops.list)),
  create: route(mock.createCrop, (payload) => httpClient.post(ENDPOINTS.crops.create, payload)),
  update: route(mock.updateCrop, (lotId, payload) => httpClient.patch(ENDPOINTS.crops.update(lotId), payload)),
  remove: route(mock.deleteCrop, (lotId) => httpClient.delete(ENDPOINTS.crops.remove(lotId))),
}

export const centreApi = {
  list: route(mock.listCentres, (params) => httpClient.get(ENDPOINTS.centres.list, { params })),
  detail: route(mock.getCentre, (centreId) => httpClient.get(ENDPOINTS.centres.detail(centreId))),
  slots: route(mock.getCentreSlots, (centreId, params) =>
    httpClient.get(ENDPOINTS.centres.slots(centreId), { params }),
  ),
  queue: route(mock.getCentreQueue, (centreId) => httpClient.get(ENDPOINTS.centres.queue(centreId))),
}

export const bookingApi = {
  list: route(mock.listBookings, () => httpClient.get(ENDPOINTS.bookings.list)),
  detail: route(mock.getBooking, (bookingId) => httpClient.get(ENDPOINTS.bookings.detail(bookingId))),
  create: route(mock.createBooking, (payload) => httpClient.post(ENDPOINTS.bookings.create, payload)),
  cancel: route(mock.cancelBooking, (bookingId, payload) =>
    httpClient.post(ENDPOINTS.bookings.cancel(bookingId), payload),
  ),
  checkIn: route(mock.checkIn, (bookingId) => httpClient.post(ENDPOINTS.bookings.checkIn(bookingId))),
  queuePosition: route(mock.getQueuePosition, (bookingId) =>
    httpClient.get(ENDPOINTS.bookings.queuePosition(bookingId)),
  ),
}

export const procurementApi = {
  list: route(mock.listProcurements, () => httpClient.get(ENDPOINTS.procurement.list)),
  detail: route(mock.getProcurement, (id) => httpClient.get(ENDPOINTS.procurement.detail(id))),
}

export const paymentApi = {
  list: route(mock.listPayments, () => httpClient.get(ENDPOINTS.payments.list)),
  detail: route(mock.getPayment, (id) => httpClient.get(ENDPOINTS.payments.detail(id))),
}

/**
 * The dashboard summary is one call in mock mode. If the Django API does not
 * expose an aggregate endpoint, this is the only place that needs to change:
 * fan out to the individual endpoints here and keep the same return shape.
 */
export const dashboardApi = {
  summary: route(mock.getDashboard, async () => {
    const [profile, bookings, crops, payments, procurements] = await Promise.all([
      httpClient.get(ENDPOINTS.profile.detail),
      httpClient.get(ENDPOINTS.bookings.list),
      httpClient.get(ENDPOINTS.crops.list),
      httpClient.get(ENDPOINTS.payments.list),
      httpClient.get(ENDPOINTS.procurement.list),
    ])
    const active = ['booked', 'checked_in', 'serving']
    const pending = payments.filter((payment) => payment.status !== 'payment_credited')
    return {
      profile,
      activeBooking: bookings.find((booking) => active.includes(booking.status)) || null,
      readyLots: crops.filter((lot) => lot.status === 'ready').length,
      totalLots: crops.length,
      quantityAwaiting: crops
        .filter((lot) => lot.status !== 'procured')
        .reduce((sum, lot) => sum + lot.quantityQuintal, 0),
      pendingPaymentCount: pending.length,
      pendingPaymentAmount: pending.reduce((sum, payment) => sum + payment.amount, 0),
      creditedTotal: payments
        .filter((payment) => payment.status === 'payment_credited')
        .reduce((sum, payment) => sum + payment.amount, 0),
      recentPayment: payments[0] || null,
      procurementCount: procurements.length,
    }
  }),
}
