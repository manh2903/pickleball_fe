import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Container, Avatar, Menu, MenuItem, IconButton, Tooltip, Divider } from '@mui/material';
import { useState } from 'react';
import { useAuthStore } from './stores/authStore';

// Public/User pages
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
import OwnerCheckin from './pages/OwnerCheckin';
import OwnerCourts from './pages/OwnerCourts';
import OwnerStaffs from './pages/OwnerStaffs';
import OwnerVenueAdd from './pages/OwnerVenueAdd';
import OwnerIncidents from './pages/OwnerIncidents';
import OwnerWallet from '@/pages/OwnerWallet';
import OwnerSettings from './pages/OwnerSettings';
import OwnerReports from './pages/OwnerReports';

// Admin Sidebar & Dashboards
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminVenues from './pages/AdminVenues';
import AdminUsers from './pages/AdminUsers';
import AdminWithdrawals from '@/pages/AdminWithdrawals';
import AdminSettings from './pages/admin/AdminSettings';

// Guard for routes
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseMenu();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hide standard AppBar on Owner routes */}
      {!location.pathname.startsWith('/owner') && (
        <AppBar position="sticky" color="default" elevation={0} sx={{ 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 1100
        }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component={Link} to="/" sx={{ 
              fontWeight: 800, 
              color: 'primary.main', 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none'
            }}>
              <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>🏓</Box> Pickleball Hub
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
              <Button color="inherit" component={Link} to="/">Trang chủ</Button>
              <Button color="inherit" component={Link} to="/marketplace">Khám phá</Button>
              
              {isAuthenticated ? (
                <Box sx={{ ml: 2 }}>
                  <Tooltip title="Tài khoản">
                    <IconButton onClick={handleOpenMenu} sx={{ p: 0.5, border: '2px solid', borderColor: 'primary.light' }}>
                      <Avatar alt={user?.name} src={user?.avatar} sx={{ width: 32, height: 32 }} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem disabled><Typography variant="caption" sx={{ fontWeight: 700 }}>{user?.name}</Typography></MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { handleCloseMenu(); navigate('/profile'); }}>Hồ sơ</MenuItem>
                    <MenuItem onClick={() => { handleCloseMenu(); navigate('/my-bookings'); }}>Lịch đặt của tôi</MenuItem>
                    {user?.role === 'owner' && (
                      <MenuItem onClick={() => { handleCloseMenu(); navigate('/owner/dashboard'); }} sx={{ color: 'primary.main', fontWeight: 600 }}>Quản trị Sân</MenuItem>
                    )}
                    {user?.role === 'admin' && (
                      <MenuItem onClick={() => { handleCloseMenu(); navigate('/admin/dashboard'); }} sx={{ color: 'error.main', fontWeight: 600 }}>Admin Panel</MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button color="primary" variant="contained" sx={{ ml: 2, borderRadius: 1, px: 3 }} component={Link} to="/login">
                  Đăng nhập
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      )}

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-owner" element={<RegisterOwnerPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/venues/:slug" element={<VenueDetailPage />} />
          <Route path="/booking/:venueId" element={<BookingPage />} />
          <Route path="/bookings/:id" element={<BookingSuccessPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Owner Dashboard Routes */}
          <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/owner/dashboard" />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="bookings" element={<OwnerBookings />} />
            <Route path="checkin" element={<OwnerCheckin />} />
            <Route path="courts" element={<OwnerCourts />} />
            <Route path="staffs" element={<OwnerStaffs />} />
            <Route path="venues/add" element={<OwnerVenueAdd />} />
            <Route path="incidents" element={<OwnerIncidents />} />
            <Route path="wallet" element={<OwnerWallet />} />
            <Route path="settings" element={<OwnerSettings />} />
            <Route path="reports" element={<OwnerReports />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="venues" element={<AdminVenues />} />
            <Route path="owners" element={<Box sx={{ py: 10, textAlign: 'center' }}>Owners Management Placeholder</Box>} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="finance" element={<AdminWithdrawals />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>

      {/* Hide footer on Owner routes */}
      {!location.pathname.startsWith('/owner') && (
        <Box component="footer" sx={{ p: 6, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 800 }}>🏓 Pickleball Hub</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nền tảng đặt sân hàng đầu dành cho cộng đồng Pickleball Việt Nam.
          </Typography>
          <Typography variant="caption" color="text.disabled">
            © 2024 Pickleball Hub. Designed for Winners.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default App;
