import { useQuery } from '@tanstack/react-query';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Grid, Card, Typography, Box, Stack, 
  CircularProgress, Alert, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Chip, Divider, Button, Avatar,
  IconButton, Tooltip, Paper, useTheme
} from '@mui/material';
import { 
  TrendingUp, EventAvailable, 
  AccountBalanceWallet, PendingActions,
  ArrowForward, Visibility, PointOfSale,
  AccessTime, CheckCircle, Person,
  OpenInNew
} from '@mui/icons-material';
import { ownerApi } from '@/api/ownerApi';

const StatCard = ({ title, value, icon, color, subtitle, trend }: any) => (
  <Card sx={{ 
    p: 3, borderRadius: 3, height: '100%', 
    border: '1px solid #F1F5F9', 
    position: 'relative', overflow: 'hidden', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }
  }}>
    <Box sx={{ 
      position: 'absolute', top: -10, right: -10, p: 3, 
      borderRadius: '50%', bgcolor: `${color}10`, color: color 
    }}>
      {icon}
    </Box>
    <Stack spacing={1}>
      <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 800, letterSpacing: 1.5, opacity: 0.8 }}>{title.toUpperCase()}</Typography>
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 950, fontFamily: 'Times New Roman' }}>{value}</Typography>
        {trend && <Typography variant="caption" sx={{ fontWeight: 800, color: '#22C55E' }}>{trend}</Typography>}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{subtitle}</Typography>
    </Stack>
  </Card>
);

const OwnerDashboard = () => {
  const { venueId }: any = useOutletContext();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data, isLoading, error } = useQuery({
    queryKey: ['owner-stats', venueId],
    queryFn: () => ownerApi.getStats(venueId),
    enabled: !!venueId,
    refetchInterval: 60000 // Refresh every 1min
  });

  const stats = data?.data;

  if (isLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress thickness={5} size={60} /></Box>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Lỗi hệ thống khi tải báo cáo đồng bộ.</Alert>;
  if (!venueId) return <Alert severity="info" sx={{ borderRadius: 2 }}>Vui lòng chọn cơ sở quản lý từ thanh bên.</Alert>;

  return (
    <Box sx={{ px: { xs: 1, md: 0 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 6, display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', mb: 1, letterSpacing: -1 }}>Tổng quan vận hành 🏢</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>Dữ liệu tổng hợp thời gian thực của cơ sở <b>{stats.venueName || 'hiện tại'}</b>.</Typography>
        </Box>
        <Button 
          variant="contained" 
          disableElevation
          onClick={() => navigate('../reports')}
          endIcon={<ArrowForward />}
          sx={{ 
            px: 4, py: 1.5, borderRadius: 3, fontWeight: 900, fontSize: '0.9rem',
            background: 'linear-gradient(45deg, #0F172A 30%, #1E293B 90%)',
            '&:hover': { background: '#0F172A' }
          }}
        >
          TRUY CẬP PHÂN TÍCH CHUYÊN SÂU
        </Button>
      </Box>

      {/* KPI Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Sẵn sàng hôm nay" 
            value={stats.todayBookings || 0} 
            icon={<EventAvailable sx={{ fontSize: 32 }} />} 
            color="#3B82F6" 
            subtitle="Tổng số lịch đăng ký trong ngày"
            trend="+8.2%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Lợi nhuận gộp" 
            value={`${new Intl.NumberFormat('vi-VN').format(stats.totalRevenue || 0)}đ`} 
            icon={<AccountBalanceWallet sx={{ fontSize: 32 }} />} 
            color="#10B981" 
            subtitle="Tổng tiền quyết toán trên hệ thống"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Đang lưu đơn" 
            value={stats.pendingBookings || 0} 
            icon={<PendingActions sx={{ fontSize: 32 }} />} 
            color="#F59E0B" 
            subtitle="Đơn chưa check-in/chưa thanh toán"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Khách vãng lai" 
            value={stats.walkInCount || 0} 
            icon={<Person sx={{ fontSize: 32 }} />} 
            color="#6366F1" 
            subtitle="Lượt đặt trực tiếp tại quầy"
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Left: Activity Table */}
        <Grid item xs={12} lg={8}>
          <Paper variant="outlined" sx={{ borderRadius: 4, border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: 'none' }}>
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
               <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                 <Visibility color="primary" /> Đơn hàng mới nhất
               </Typography>
               <Button size="small" variant="text" sx={{ fontWeight: 800 }} onClick={() => navigate('../bookings')}>TẤT CẢ ĐƠN HÀNG</Button>
            </Box>
            
            <TableContainer sx={{ p: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #F1F5F9' }}>THÔNG TIN KHÁCH</TableCell>
                    <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #F1F5F9' }}>SÂN & GIỜ</TableCell>
                    <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #F1F5F9' }}>THANH TOÁN</TableCell>
                    <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #F1F5F9' }} align="right">HÀNH ĐỘNG</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentBookings?.map((booking: any) => (
                    <TableRow key={booking.id} hover sx={{ '& td': { borderBottom: '1px solid #F8FAFC' } }}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                           <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main, fontWeight: 900 }}>
                              {booking.user?.name?.charAt(0) || 'K'}
                           </Avatar>
                           <Box>
                              <Typography variant="body2" sx={{ fontWeight: 800 }}>{booking.user?.name || 'Vãng lai'}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{booking.user?.phone}</Typography>
                           </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{booking.court?.name}</Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontWeight: 600 }}>
                           <AccessTime sx={{ fontSize: 14 }} /> 
                           {booking.slots?.[0]?.start_time.slice(0, 5)} - {booking.slots?.[0]?.end_time.slice(0, 5)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.dark' }}>{new Intl.NumberFormat('vi-VN').format(booking.total_price)}đ</Typography>
                        <Chip label={booking.payment_method?.toUpperCase()} size="small" variant="outlined" sx={{ fontSize: 9, height: 16, fontWeight: 800, borderColor: '#CBD5E1' }} />
                      </TableCell>
                      <TableCell align="right">
                         <IconButton size="small" sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }} onClick={() => navigate(`../bookings?id=${booking.id}`)}>
                            <OpenInNew sx={{ fontSize: 18 }} />
                         </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!stats.recentBookings || stats.recentBookings.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                         <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>Chưa phát sinh hoạt động mới.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
           <Stack spacing={4}>
              {/* Modern Quick Actions */}
              <Card sx={{ p: 4, borderRadius: 4, background: '#0F172A', color: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                 <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                    <PointOfSale sx={{ color: '#10B981', fontSize: 28 }} />
                    <Box>
                       <Typography variant="h6" sx={{ fontWeight: 900 }}>Quầy vận hành ⚡</Typography>
                       <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Thao tác nhanh cho nhân viên</Typography>
                    </Box>
                 </Stack>
                 <Stack spacing={2}>
                    <Button 
                       fullWidth
                       variant="contained" 
                       startIcon={<CheckCircle />}
                       sx={{ 
                          py: 1.8, borderRadius: 3, fontWeight: 900, fontSize: '0.85rem',
                          bgcolor: 'white', color: '#0F172A', '&:hover': { bgcolor: '#F1F5F9' }
                       }}
                    >
                       CHECK-IN KHÁCH HÀNG (QR)
                    </Button>
                    <Button 
                       fullWidth
                       variant="outlined" 
                       startIcon={<Person />}
                       sx={{ 
                          py: 1.8, borderRadius: 3, fontWeight: 900, fontSize: '0.85rem',
                          borderColor: 'rgba(255,255,255,0.2)', color: 'white',
                          '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                       }}
                    >
                       TẠO ĐƠN ĐẶT TRỰC TIẾP
                    </Button>
                 </Stack>
              </Card>

              {/* Mini Trend Summary */}
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #F1F5F9' }}>
                 <Typography variant="subtitle2" sx={{ fontWeight: 950, color: '#64748B', letterSpacing: 1, mb: 4 }}>BIẾN ĐỘNG DOANH THU 7 NGÀY</Typography>
                 <Stack spacing={3}>
                    {stats.revenueByDay?.slice(0, 3).map((r: any) => (
                      <Box key={r.date}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                           <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Date(r.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' })}</Typography>
                           <Typography variant="body2" sx={{ fontWeight: 950, color: 'primary.main' }}>{new Intl.NumberFormat('vi-VN').format(r.revenue)}đ</Typography>
                        </Box>
                        <Box sx={{ height: 10, bgcolor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' }}>
                           <Box sx={{ width: `${Math.min(100, (r.revenue / 2000000) * 100)}%`, height: '100%', bgcolor: '#10B981', borderRadius: 5 }} />
                        </Box>
                      </Box>
                    ))}
                    {(!stats.revenueByDay || stats.revenueByDay.length === 0) && (
                       <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Đang chờ dữ liệu biểu đồ...</Typography>
                    )}
                 </Stack>
              </Paper>
           </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerDashboard;
