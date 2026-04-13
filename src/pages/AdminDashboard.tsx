import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Grid, Card, Typography, Box, Stack, 
  CircularProgress, Alert, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Button
} from '@mui/material';
import { 
  TrendingUp, People, Business, 
  Visibility, Assessment, AccountBalance, 
  ArrowOutward
} from '@mui/icons-material';
import { adminApi } from '@/api/adminApi';
import { Link } from 'react-router-dom';
import { socketService } from '@/utils/socket';
import { useSnackbar } from 'notistack';

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <Card sx={{ p: 3, borderRadius: 1.5, height: '100%' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Times New Roman' }}>{value}</Typography>
        {trend && (
          <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', mt: 1, fontWeight: 700 }}>
            <TrendingUp sx={{ fontSize: 14, mr: 0.5 }} /> {trend} so với tháng trước
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: `${color}.light`, color: `${color}.main` }}>
        {icon}
      </Box>
    </Stack>
  </Card>
);

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: statsRes, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats()
  });

  // Real-time notifications for Admin
  useEffect(() => {
    socketService.connect();
    socketService.joinAdmin();

    socketService.onNewBooking((data) => {
      enqueueSnackbar(`🔔 Đơn đặt mới tại ${data.venue_name || 'hệ thống'}: ${data.booking.booking_code}`, { 
        variant: 'info',
        autoHideDuration: 8000
      });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    });

    socketService.onBookingStatusUpdated((data) => {
      console.log('Admin: Booking status updated', data);
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    });

    return () => {
      socketService.disconnect();
    };
  }, [queryClient, enqueueSnackbar]);

  const stats = statsRes?.data || {
    totalVolume: 0,
    subscriptionRevenue: 0,
    totalBookings: 0,
    activeVenues: 0,
    newUsers: 0,
    recentVenues: []
  };

  if (isLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Không thể tải dữ liệu thống kê hệ thống.</Alert>;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="TỔNG DÒNG TIỀN (BOOKING)" 
            value={`${new Intl.NumberFormat('vi-VN').format(stats.totalVolume)}đ`} 
            icon={<AccountBalance />} 
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="LƯỢT ĐẶT SÂN" 
            value={stats.totalBookings} 
            icon={<Assessment />} 
            color="success"
            trend="+8.2%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="CƠ SỞ HOẠT ĐỘNG" 
            value={stats.activeVenues} 
            icon={<Business />} 
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="NGƯỜI DÙNG MỚI" 
            value={stats.newUsers} 
            icon={<People />} 
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 4, borderRadius: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Yêu cầu phê duyệt cơ sở 🏢</Typography>
              <Button component={Link} to="/admin/venues" endIcon={<ArrowOutward />} size="small">Xem tất cả</Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Địa điểm</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Chủ sở hữu</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentVenues?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                        Cơ sở dữ liệu đang đồng bộ hoặc không có địa điểm mới.
                      </TableCell>
                    </TableRow>
                  ) : stats.recentVenues.map((venue: any) => (
                    <TableRow key={venue.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{venue.name}</TableCell>
                      <TableCell>{venue.owner?.name}</TableCell>
                      <TableCell><Chip label="Chờ duyệt" color="warning" size="small" /></TableCell>
                      <TableCell align="right">
                        <IconButton component={Link} to="/admin/venues" color="primary">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 4, borderRadius: 1.5, background: 'linear-gradient(135deg,#0F172A,#1E293B)', color: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Doanh thu Gói dịch vụ 💎</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 4 }}>Lợi nhuận thực tế thu được từ việc bán các gói Subscription cho chủ sân.</Typography>
            
            <Typography variant="h3" sx={{ fontWeight: 950, mb: 2, fontFamily: 'Times New Roman', color: '#4ADE80' }}>
              {new Intl.NumberFormat('vi-VN').format(stats.subscriptionRevenue)}đ
            </Typography>
            
            <Stack spacing={2} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                <Typography variant="body2">Nguồn doanh thu:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Gói thành viên</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                <Typography variant="body2">Chu kỳ thanh toán:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Tức thì</Typography>
              </Box>
            </Stack>

            <Button 
              fullWidth 
              component={Link}
              to="/admin/finance"
              variant="contained" 
              sx={{ bgcolor: '#4ADE80', color: '#064E3B', fontWeight: 900, '&:hover': { bgcolor: '#3BBF74' } }}
            >
              Chi tiết giao dịch 🚀
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
