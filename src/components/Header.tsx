import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, Tooltip, Divider, IconButton, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
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
    <AppBar position="sticky" color="default" elevation={0} sx={{ 
      borderBottom: '1px solid', 
      borderColor: 'divider',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 1100
    }}>
      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component={Link} to="/" sx={{ 
            fontWeight: 800, 
            color: 'primary.main', 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none'
          }}>
            <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>🏓</Box> Pickleball Court Marketplace
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/">Trang chủ</Button>
            <Button color="inherit" component={Link} to="/marketplace">Khám phá</Button>
            
            {isAuthenticated ? (
              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                {/* <HeaderNotificationBell /> */}
                <Tooltip title="Tài khoản">
                  <IconButton onClick={handleOpenMenu} sx={{ p: 0.5, border: '2px solid', borderColor: 'primary.light', ml: 1 }}>
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
      </Container>
    </AppBar>
  );
};

export default Header;
