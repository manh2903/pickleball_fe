import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { 
  Grid, Card, Typography, Box, Stack, 
  CircularProgress, Alert, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Chip, Divider
} from '@mui/material';
import { 
  TrendingUp, EventAvailable, 
  AccountBalanceWallet, ShoppingBasket
} from '@mui/icons-material';
import { ownerApi } from '@/api/ownerApi';

const StatCard = ({ title, value, icon, color }: any) => (
  <Card sx={{ p: 3, borderRadius: 1.5, height: '100%', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ 
      position: 'absolute', top: -10, right: -10, p: 3, 
      borderRadius: '50%', bgcolor: `${color}10`, color: color 
    }}>
      {icon}
    </Box>
    <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Times New Roman' }}>{value}</Typography>
  </Card>
);

const OwnerDashboard = () => {
  const { venueId }: any = useOutletContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ['owner-stats', venueId],
    queryFn: () => ownerApi.getStats(venueId),
    enabled: !!venueId
  });

  const stats = data?.data;

  if (isLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Không thể tải dữ liệu thống kê.</Alert>;
  if (!venueId) return <Alert severity="info">Vui lòng chọn một sân để xem thống kê.</Alert>;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="TỔNG DOANH THU" 
            value={`${new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ`} 
            icon={<AccountBalanceWallet fontSize="large" />} 
            color="#22C55E" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="TỔNG LƯỢT ĐẶT" 
            value={stats.totalBookings} 
            icon={<ShoppingBasket fontSize="large" />} 
            color="#3B82F6" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="LỊCH HÔM NAY" 
            value={stats.todayBookings} 
            icon={<EventAvailable fontSize="large" />} 
            color="#F59E0B" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="TĂNG TRƯỞNG" 
            value="+12%" 
            icon={<TrendingUp fontSize="large" />} 
            color="#8B5CF6" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left: Recent Bookings */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 4, borderRadius: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Các lượt đặt sân mới nhất</Typography>
            </Box>
            <TableContainer component={Box}>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Khách hàng</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Sân</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Giá</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentBookings?.map((booking: any) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{booking.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{booking.user?.phone}</Typography>
                      </TableCell>
                      <TableCell>{booking.court?.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(booking.slot?.date).toLocaleDateString('vi-VN')}</Typography>
                        <Typography variant="caption" color="text.secondary">{booking.slot?.start_time.slice(0, 5)} - {booking.slot?.end_time.slice(0, 5)}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN').format(booking.total_price)}đ</TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status} 
                          color={booking.status === 'confirmed' ? 'success' : 'default'} 
                          size="small" 
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {stats.recentBookings?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>Chưa có lượt đặt nào.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Right: Revenue Breakdown / Trends Placeholder */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 4, borderRadius: 1.5, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Biểu đồ tăng trưởng</Typography>
            <Stack spacing={3}>
              {stats.revenueByDay?.map((r: any) => (
                <Box key={r.date}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{new Date(r.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' })}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN').format(r.revenue)}đ</Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 8, bgcolor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ width: `${Math.min(100, (r.revenue / 1000000) * 100)}%`, height: '100%', bgcolor: 'primary.main' }} />
                  </Box>
                </Box>
              ))}
              {stats.revenueByDay?.length === 0 && (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Chưa có dữ liệu doanh thu gần đây.</Typography>
                </Box>
              )}
            </Stack>
            <Divider sx={{ my: 4 }} />
            <Typography variant="body2" color="text.secondary">Thống kê tự động cập nhật mỗi 5 phút.</Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerDashboard;
