import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Toolbar, Typography, 
  Divider, useTheme, useMediaQuery, IconButton,
  Paper, Button, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { 
  Dashboard, SportsTennis, EventNote, Settings, 
  Menu as MenuIcon, Storefront, QrCodeScanner, Assessment,
  Badge, AddBusiness, ErrorOutline, AccountBalanceWallet
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownerApi } from '@/api/ownerApi';
const DRAWER_WIDTH = 280;

const OwnerLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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

  const menuItems = [
    { text: 'Tổng quan', icon: <Dashboard />, path: '/owner/dashboard' },
    { text: 'Lịch đặt sân', icon: <EventNote />, path: '/owner/bookings' },
    { text: 'Danh sách sân', icon: <SportsTennis />, path: '/owner/courts' },
    { text: 'Quản lý Nhân viên', icon: <Badge />, path: '/owner/staffs' },
    { text: 'Quầy Check-in', icon: <QrCodeScanner />, path: '/owner/checkin' },
    { text: 'Báo cáo sự cố', icon: <ErrorOutline />, path: '/owner/incidents' },
    { text: 'Ví tiền & Thanh toán', icon: <AccountBalanceWallet />, path: '/owner/wallet' },
    { text: 'Doanh thu', icon: <Assessment />, path: '/owner/reports' },
    { text: 'Thông tin sân', icon: <Settings />, path: '/owner/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, py: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', display: 'flex', alignItems: 'center', fontFamily: 'Times New Roman' }}>
          🏓 OWNER PANEL
        </Typography>
      </Toolbar>
      
      {/* Venue Switcher (Tier 1 to Tier 2) */}
      <Box sx={{ px: 2, mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Chọn cơ sở quản lý</InputLabel>
          <Select
            value={activeVenueId}
            label="Chọn cơ sở quản lý"
            onChange={(e) => handleVenueChange(e.target.value)}
            sx={{ borderRadius: 1.5, bgcolor: 'white' }}
          >
            {venues.map((v: any) => (
              <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
            ))}
            {venues.length === 0 && <MenuItem disabled>Không có cơ sở nào</MenuItem>}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ px: 2, mb: 1 }}>
        <Button 
          fullWidth 
          variant="outlined" 
          startIcon={<AddBusiness />} 
          component={Link} 
          to="/owner/venues/add"
          sx={{ borderRadius: 1.5, py: 1, borderStyle: 'dashed' }}
        >
          Thêm cơ sở mới
        </Button>
      </Box>

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
                  bgcolor: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(34,197,94,0.12)',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'rgba(34,197,94,0.18)' },
                    '& .MuiListItemIcon-root': { color: 'primary.main' }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.03)',
                    borderRadius: 1.5
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 45, color: isActive ? 'primary.main' : 'inherit' }}>
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
        sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}
      >
        <Paper sx={{ p: 3, mb: 4, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>
              Chào mừng quay lại, Chủ sân! 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý: <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>{venues.find((v: any) => v.id === activeVenueId)?.name || '...'}</Box>
            </Typography>
          </Box>
          <Button component={Link} to="/" startIcon={<Storefront />} variant="outlined" size="small" sx={{ borderRadius: 1 }}>
            Xem Marketplace
          </Button>
        </Paper>

        <Outlet context={{ venueId: activeVenueId }} />
      </Box>
    </Box>
  );
};

export default OwnerLayout;

