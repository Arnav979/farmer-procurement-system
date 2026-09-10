import { Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import PublicLayout from './components/layout/PublicLayout.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CropDetails from './pages/CropDetails.jsx'
import Centres from './pages/Centres.jsx'
import CentreDetails from './pages/CentreDetails.jsx'
import SlotBooking from './pages/SlotBooking.jsx'
import BookingConfirmation from './pages/BookingConfirmation.jsx'
import CheckIn from './pages/CheckIn.jsx'
import QueueTracker from './pages/QueueTracker.jsx'
import ProcurementStatus from './pages/ProcurementStatus.jsx'
import PaymentStatus from './pages/PaymentStatus.jsx'
import PaymentDetails from './pages/PaymentDetails.jsx'
import Profile from './pages/Profile.jsx'
import Help from './pages/Help.jsx'
import NotFound from './pages/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crops" element={<CropDetails />} />
          <Route path="/centres" element={<Centres />} />
          <Route path="/centres/:centreId" element={<CentreDetails />} />
          <Route path="/book/:centreId" element={<SlotBooking />} />
          <Route path="/bookings/:bookingId" element={<BookingConfirmation />} />
          <Route path="/check-in/:bookingId" element={<CheckIn />} />
          <Route path="/queue" element={<QueueTracker />} />
          <Route path="/queue/:bookingId" element={<QueueTracker />} />
          <Route path="/procurement" element={<ProcurementStatus />} />
          <Route path="/payments" element={<PaymentStatus />} />
          <Route path="/payments/:paymentId" element={<PaymentDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
