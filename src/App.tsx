import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Public/User pages
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterOwnerPage from './pages/RegisterOwnerPage';
import MarketplacePage from './pages/MarketplacePage';
import VenueDetailPage from './pages/VenueDetailPage';
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';

// Owner Sidebar & Dashboards
import OwnerLayout from './layouts/OwnerLayout';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerBookings from './pages/OwnerBookings';
import OwnerBookingDetail from './pages/OwnerBookingDetail';
import OwnerCourts from './pages/OwnerCourts';
import OwnerVenues from './pages/OwnerVenues';
import OwnerStaffs from './pages/OwnerStaffs';
import OwnerVenueAdd from './pages/OwnerVenueAdd';
import OwnerIncidents from './pages/OwnerIncidents';
import OwnerWallet from '@/pages/OwnerWallet';
import OwnerSettings from './pages/OwnerSettings';
import OwnerReports from './pages/OwnerReports';
import OwnerReviewsPage from './pages/owner/OwnerReviewsPage';
import OwnerCoupons from './pages/OwnerCoupons';

// Admin Sidebar & Dashboards
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminVenues from './pages/AdminVenues';
import AdminUsers from './pages/AdminUsers';
import AdminWithdrawals from '@/pages/AdminWithdrawals';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCoupons from './pages/AdminCoupons';
import { useAuthStore } from './stores/authStore';

// Guard for routes
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hide standard AppBar on Owner/Admin routes or specific layouts */}
      {!location.pathname.startsWith('/owner') && !location.pathname.startsWith('/admin') && <Header />}

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-owner" element={<RegisterOwnerPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/venues/:slug" element={<VenueDetailPage />} />
          <Route path="/booking/:venueSlug" element={<BookingPage />} />
          <Route path="/bookings/:bookingCode" element={<BookingSuccessPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Owner Dashboard Routes */}
          <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/owner/dashboard" />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="bookings" element={<OwnerBookings />} />
            <Route path="bookings/:bookingCode" element={<OwnerBookingDetail />} />
            <Route path="courts" element={<OwnerCourts />} />
            <Route path="staffs" element={<OwnerStaffs />} />
            <Route path="venues" element={<OwnerVenues />} />
            <Route path="venues/add" element={<OwnerVenueAdd />} />
            <Route path="incidents" element={<OwnerIncidents />} />
            <Route path="wallet" element={<OwnerWallet />} />
            <Route path="settings" element={<OwnerSettings />} />
            <Route path="reports" element={<OwnerReports />} />
            <Route path="coupons" element={<OwnerCoupons />} />
            <Route path="reviews/:venueId" element={<OwnerReviewsPage />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="venues" element={<AdminVenues />} />
            <Route path="owners" element={<Box sx={{ py: 10, textAlign: 'center' }}>Owners Management Placeholder</Box>} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="finance" element={<AdminWithdrawals />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>

      {/* Hide footer on Owner/Admin routes */}
      {!location.pathname.startsWith('/owner') && !location.pathname.startsWith('/admin') && <Footer />}
      
      {/* Global Scroll To Top Button */}
      <ScrollToTop />
    </Box>
  );
}

export default App;
