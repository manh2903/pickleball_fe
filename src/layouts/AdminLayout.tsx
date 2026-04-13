import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Toolbar, Typography, 
  Divider, useTheme, useMediaQuery, IconButton,
  Paper, Stack, Avatar, Menu, Tooltip, MenuItem
} from '@mui/material';
import { 
  BarChart, Business, People, ConfirmationNumber, 
  AccountBalance, Settings, Menu as MenuIcon,
  Person, Logout,
  HistoryEdu, ReportProblem
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import HeaderNotificationBell from '@/components/NotificationBell';
import { socketService } from '@/utils/socket';
import { useEffect } from 'react';

const DRAWER_WIDTH = 280;

const AdminLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
  };

  // Centralized socket room joining for admins
  useEffect(() => {
    if (user?.role === 'admin') {
      console.log('🛡️ AdminLayout: Joining admin room');
      socketService.joinAdmin();
      socketService.joinUser(user.id);
    }
  }, [user?.id]);

  const menuGroups = [
    {
      title: 'HỆ THỐNG',
      items: [
        { text: 'Tổng quan', icon: <BarChart />, path: '/admin/dashboard' },
        { text: 'Tài chính nền tảng', icon: <AccountBalance />, path: '/admin/finance' },
        { text: 'Cấu hình hệ thống', icon: <Settings />, path: '/admin/settings' },
      ]
    },
    {
      title: 'QUẢN LÝ ĐƠN VỊ',
      items: [
        { text: 'Duyệt Địa điểm', icon: <Business />, path: '/admin/venues' },
        { text: 'Quản lý Tài khoản', icon: <People />, path: '/admin/users' },
      ]
    },
    {
      title: 'VẬN HÀNH',
      items: [
        { text: 'Theo dõi Đặt sân', icon: <HistoryEdu />, path: '/admin/bookings' },
        { text: 'Xử lý Sự cố', icon: <ReportProblem />, path: '/admin/incidents' },
        { text: 'Mã khuyến mãi', icon: <ConfirmationNumber />, path: '/admin/coupons' },
      ]
    }
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 950, color: '#DC2626', display: 'flex', alignItems: 'center', fontFamily: 'Times New Roman', letterSpacing: -1 }}>
          🛡️ ADMIN CENTRAL
        </Typography>
      </Toolbar>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, pb: 4 }}>
        {menuGroups.map((group) => (
          <Box key={group.title} sx={{ mb: 3 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                px: 2, mb: 1, display: 'block', fontWeight: 900, 
                color: 'text.disabled', letterSpacing: 1.5 
              }}
            >
              {group.title}
            </Typography>
            <List disablePadding>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton 
                      component={Link} 
                      to={item.path}
                      selected={isActive}
                      onClick={() => isMobile && setMobileOpen(false)}
                      sx={{
                        borderRadius: 2,
                        py: 1.2,
                        bgcolor: isActive ? 'rgba(220,38,38,0.08)' : 'transparent',
                        color: isActive ? '#DC2626' : 'text.secondary',
                        '&.Mui-selected': {
                          bgcolor: 'rgba(220,38,38,0.1)',
                          color: '#DC2626',
                          boxShadow: 'none',
                          '&:hover': { bgcolor: 'rgba(220,38,38,0.15)' },
                          '& .MuiListItemIcon-root': { color: '#DC2626' }
                        },
                        '&:hover': {
                          bgcolor: isActive ? 'rgba(220,38,38,0.15)' : 'rgba(0,0,0,0.03)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#DC2626' : 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ fontWeight: isActive ? 900 : 600, fontSize: '0.88rem' }} 
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
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

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
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

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        {/* Header matching OwnerLayout style */}
        <Box sx={{ 
          py: 2, px: { xs: 2, md: 4 }, 
          bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          position: 'sticky', top: 0, zIndex: 100, 
          backdropFilter: 'blur(12px)', background: 'rgba(255, 255, 255, 0.9)' 
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Times New Roman', color: '#1E293B' }}>
               Bảng quản trị hệ thống 🖥️
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* <Button component={Link} to="/" variant="text" size="small" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'none', display: { xs: 'none', sm: 'block' } }}>
              Trang Marketplace
            </Button> */}
            <HeaderNotificationBell />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Box>
              <Tooltip title="Tài khoản Admin">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5, border: '2px solid', borderColor: 'error.light' }}>
                  <Avatar alt={user?.name} src={user?.avatar} sx={{ width: 32, height: 32 }} />
                </IconButton>
              </Tooltip>
              <Menu sx={{ mt: '45px' }} anchorEl={anchorEl} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }} open={Boolean(anchorEl)} onClose={handleCloseUserMenu}>
                <MenuItem disabled sx={{ opacity: '1 !important' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Quản trị viên toàn năng</Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                  <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Hồ sơ cá nhân" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                  <ListItemText primary="Đăng xuất" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
