import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Toolbar, Typography, 
  Divider, useTheme, useMediaQuery, IconButton,
  Paper, Button, Avatar, Stack
} from '@mui/material';
import { 
  People, Business, Settings, 
  Menu as MenuIcon, Logout, AccountBalance,
  BarChart, Storefront, ConfirmationNumber
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import HeaderNotificationBell from '@/components/NotificationBell';

const DRAWER_WIDTH = 280;

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { text: 'Tổng quan hệ thống', icon: <BarChart />, path: '/admin/dashboard' },
    { text: 'Phê duyệt Địa điểm', icon: <Business />, path: '/admin/venues' },
    { text: 'Quản lý Tài khoản', icon: <People />, path: '/admin/users' },
    { text: 'Quản lý Khuyến mãi', icon: <ConfirmationNumber />, path: '/admin/coupons' },
    { text: 'Tài chính nền tảng', icon: <AccountBalance />, path: '/admin/finance' },
    { text: 'Cấu hình hệ thống', icon: <Settings />, path: '/admin/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, py: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#DC2626', display: 'flex', alignItems: 'center', fontFamily: 'Times New Roman' }}>
          🛡️ ADMIN CENTRAL
        </Typography>
      </Toolbar>
      <Divider sx={{ mb: 2, mx: 2, opacity: 0.5 }} />
      
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={isActive}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 1.5,
                  py: 1.5,
                  bgcolor: isActive ? 'rgba(220,38,38,0.08)' : 'transparent',
                  color: isActive ? '#DC2626' : 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(220,38,38,0.12)',
                    color: '#DC2626',
                    '&:hover': { bgcolor: 'rgba(220,38,38,0.18)' },
                    '& .MuiListItemIcon-root': { color: '#DC2626' }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.03)',
                    borderRadius: 1.5
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 45, color: isActive ? '#DC2626' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.95rem' }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: 1.5, border: '1px solid', borderColor: '#FCA5A5' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Avatar src={user?.avatar} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">Quản trị viên</Typography>
            </Box>
          </Stack>
          <Button 
            fullWidth 
            variant="outlined" 
            color="error" 
            size="small" 
            startIcon={<Logout />} 
            onClick={logout}
            sx={{ borderRadius: 1 }}
          >
            Đăng xuất
          </Button>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <IconButton
        color="inherit"
        onClick={() => setMobileOpen(true)}
        sx={{ 
          position: 'fixed', bottom: 20, right: 20, 
          bgcolor: '#DC2626', color: 'white', 
          boxShadow: 3, zIndex: 1200,
          display: { md: 'none' },
          '&:hover': { bgcolor: '#B91C1C' }
        }}
      >
        <MenuIcon />
      </IconButton>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid', borderColor: 'divider' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}
      >
        <Paper sx={{ p: 3, mb: 4, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>
              Bảng điều khiển Admin 🖥️
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chào mừng, bạn đang quản trị toàn bộ hệ thống Pickleball Court Marketplace.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <HeaderNotificationBell />
            <Button 
              component={Link} 
              to="/" 
              startIcon={<Storefront />} 
              variant="outlined" 
              size="small" 
              sx={{ borderRadius: 1, color: 'text.secondary' }}
            >
              Về trang chủ
            </Button>
          </Stack>
        </Paper>

        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
