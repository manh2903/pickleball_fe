import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Toolbar, Typography, 
  Divider, useTheme, useMediaQuery, IconButton,
  Paper, Button, Select, MenuItem, FormControl, InputLabel,
  Stack, Avatar, Menu, Tooltip
} from '@mui/material';
import { 
  Dashboard, SportsTennis, EventNote, Settings, 
  Menu as MenuIcon,
  Badge as BadgeIcon, AddBusiness, ErrorOutline, AccountBalanceWallet,
  Person, Logout, Star, ConfirmationNumber, Verified
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownerApi } from '@/api/ownerApi';
import { useAuthStore } from '@/stores/authStore';
import HeaderNotificationBell from '@/components/NotificationBell';

const DRAWER_WIDTH = 280;

const OwnerLayout = () => {
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

  // Multi-venue support (Tier 1)
  const { data: venuesRes } = useQuery({ queryKey: ['owner-venues'], queryFn: () => ownerApi.getVenues() });
  const venues = venuesRes?.data || [];
  const [activeVenueId, setActiveVenueId] = useState<string | number | ''>('');

  useEffect(() => {
    if (venues.length > 0 && !activeVenueId) {
      const savedVenueId = localStorage.getItem('activeVenueId');
      if (savedVenueId && venues.find((v: any) => v.id.toString() === savedVenueId)) {
        setActiveVenueId(savedVenueId);
      } else {
        setActiveVenueId(venues[0].id);
      }
    }
  }, [venues, activeVenueId]);

  const handleVenueChange = (id: string | number) => {
    setActiveVenueId(id);
    localStorage.setItem('activeVenueId', id.toString());
    window.location.reload(); 
  };

  const menuGroups = [
    {
      title: 'VẬN HÀNH',
      items: [
        { text: 'Tổng quan', icon: <Dashboard />, path: '/owner/dashboard' },
        { text: 'Lịch đặt sân', icon: <EventNote />, path: '/owner/bookings' },
        { text: 'Quản lý sân', icon: <SportsTennis />, path: '/owner/courts' },
        { text: 'Nhân viên', icon: <BadgeIcon />, path: '/owner/staffs' },
      ]
    },
    {
      title: 'TÀI CHÍNH',
      items: [
        { text: 'Ví & Doanh thu', icon: <AccountBalanceWallet />, path: '/owner/wallet' },
        { text: 'Gói dịch vụ', icon: <Verified />, path: '/owner/subscription' },
      ]
    },
    {
      title: 'KHÁCH HÀNG',
      items: [
        { text: 'Khuyến mãi', icon: <ConfirmationNumber />, path: '/owner/coupons' },
        { text: 'Đánh giá', icon: <Star />, path: `/owner/reviews/${activeVenueId}` },
      ]
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { text: 'Báo cáo sự cố', icon: <ErrorOutline />, path: '/owner/incidents' },
        { text: 'Cài đặt cơ sở', icon: <Settings />, path: '/owner/settings' },
        { text: 'Quản lý cơ sở', icon: <AddBusiness />, path: '/owner/venues' },
      ]
    }
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 950, color: 'primary.main', display: 'flex', alignItems: 'center', fontFamily: 'Times New Roman', letterSpacing: -1 }}>
          🏓 PICKLEBALL
        </Typography>
      </Toolbar>
      
      {/* Venue Switcher */}
      <Box sx={{ px: 2, mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontWeight: 600, fontSize: '0.85rem' }}>ĐANG QUẢN LÝ</InputLabel>
          <Select
            value={activeVenueId}
            label="ĐANG QUẢN LÝ"
            onChange={(e) => handleVenueChange(e.target.value)}
            sx={{ borderRadius: 2, bgcolor: '#F8FAFC', fontWeight: 700 }}
          >
            {venues.map((v: any) => (
              <MenuItem key={v.id} value={v.id} sx={{ fontWeight: 600 }}>{v.name}</MenuItem>
            ))}
            {venues.length === 0 && <MenuItem disabled>Không có cơ sở nào</MenuItem>}
          </Select>
        </FormControl>
      </Box>

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
                        bgcolor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'white' : 'text.secondary',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          boxShadow: '0 10px 15px -3px rgba(34,197,94,0.25)',
                          '&:hover': { bgcolor: 'primary.dark' },
                          '& .MuiListItemIcon-root': { color: 'white' }
                        },
                        '&:hover': {
                          bgcolor: isActive ? 'primary.dark' : 'rgba(0,0,0,0.03)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'white' : 'inherit' }}>
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
      
      <Box sx={{ mt: 'auto', p: 3 }}>
        <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
            CẦN HỖ TRỢ?
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>Liên hệ hotline kỹ thuật nếu gặp sự cố vận hành.</Typography>
          <Button fullWidth variant="outlined" size="small" sx={{ borderRadius: 1 }}>
            Hotline: 1900 1234
          </Button>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F1F5F9', minHeight: '100vh' }}>
      <IconButton
        color="inherit"
        onClick={() => setMobileOpen(true)}
        sx={{ 
          position: 'fixed', bottom: 20, right: 20, 
          bgcolor: 'primary.main', color: 'white', 
          boxShadow: 3, zIndex: 1200,
          display: { md: 'none' },
          '&:hover': { bgcolor: 'primary.dark' }
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
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } 
        }}
      >
        {/* TOP BAR - FIXED AT TOP, NO BORDER RADIUS */}
        <Box
          sx={{
            py: 2, px: { xs: 2, md: 4 },
            bgcolor: 'white',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            background: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Times New Roman', color: '#1E293B' }}>
               Chào mừng, {user?.name} - Chủ sân! 👋 
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Button 
              component={Link} to="/" 
              variant="text" 
              size="small" 
              sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'none', display: { xs: 'none', sm: 'block' } }}
            >
              Trang Marketplace
            </Button>
            <HeaderNotificationBell />
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            <Box>
              <Tooltip title="Tài khoản">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5, border: '2px solid', borderColor: 'primary.light' }}>
                  <Avatar alt={user?.name} src={user?.avatar} sx={{ width: 32, height: 32 }} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
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
          <Outlet context={{ venueId: activeVenueId }} />
        </Box>
      </Box>
    </Box>
  );
};

export default OwnerLayout;
