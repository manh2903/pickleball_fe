import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Grid, Card, Typography, Box, Stack, 
  CircularProgress, Alert, Chip, Button
} from '@mui/material';
import { 
  People, 
  Assessment, AccountBalance, 
  ArrowOutward, TrendingUp
} from '@mui/icons-material';
import { adminApi } from '@/api/adminApi';
import { Link } from 'react-router-dom';
import { socketService } from '@/utils/socket';
import { useSnackbar } from 'notistack';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip,
  Legend
} from 'recharts';

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <Card sx={{ p: 3, borderRadius: 0, borderTop: `4px solid`, borderColor: `${color}.main`, height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', mt: 1 }}>{value}</Typography>
        {trend && (
          <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', mt: 1.5, fontWeight: 800 }}>
            <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> {trend} so với tháng trước
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 1.5, bgcolor: `${color}.light`, color: `${color}.main`, borderRadius: 0 }}>
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

  useEffect(() => {
    socketService.connect();
    socketService.joinAdmin();

    socketService.onNewBooking((data) => {
      enqueueSnackbar(`🔔 Đơn đặt mới tại ${data.venue_name}: ${data.booking.booking_code}`, { 
        variant: 'info',
        autoHideDuration: 5000
      });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    });

    return () => {
      socketService.disconnect();
    };
  }, [queryClient, enqueueSnackbar]);

  const stats = statsRes?.data || {};
  const chartData = stats.revenueTrend || [];

  console.log( chartData )

  if (isLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Alert severity="error">Lỗi kết nối dữ liệu thống kê.</Alert></Box>;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', letterSpacing: -1 }}>
                Tổng quan Hệ thống 🏛️
            </Typography>
            <Typography variant="body2" color="text.secondary">Chào mừng Admin, đây là báo cáo vận hành toàn nền tảng Pickleball.</Typography>
        </Box>
        <Chip label="DỮ LIỆU REAL-TIME" color="success" size="small" sx={{ fontWeight: 900, borderRadius: 0, px: 1 }} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Tổng Dòng tiền" value={`${new Intl.NumberFormat('vi-VN').format(stats.totalVolume)}đ`} icon={<AccountBalance />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Lượt Đặt sân" value={stats.totalBookings} icon={<Assessment />} color="success" trend="+12.5%" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Người chơi mới" value={stats.newUsers} icon={<People />} color="info" />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 4, borderRadius: 0, height: '100%', minHeight: 450 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>Xu hướng Dòng tiền (7 ngày qua) 📈</Typography>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pt: 2, minHeight: 350 }}>
                {chartData.length > 0 ? (
                    <AreaChart width={750} height={350} data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 10, fontWeight: 700 }} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700 }} 
                            tickFormatter={(v) => v >= 1000000 ? `${v/1000000}M` : `${v/1000}k`} 
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: 0, border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                        />
                        <Legend verticalAlign="top" align="right" height={36} iconType="rect" />
                        <Area name="Dòng tiền Booking" dataKey="bookingRevenue" stroke="#3B82F6" strokeWidth={3} fill="#3B82F6" fillOpacity={0.1} />
                        <Area name="Doanh thu Gói" dataKey="subscriptionRevenue" stroke="#10B981" strokeWidth={3} fill="#10B981" fillOpacity={0.1} />
                    </AreaChart>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350, width: '100%', bgcolor: '#F8FAFC' }}>
                        <Typography variant="body2" color="text.secondary">Chưa có dữ liệu xu hướng.</Typography>
                    </Box>
                )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
                <Card sx={{ p: 4, borderRadius: 0, backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94A3B8', mb: 2, letterSpacing: 1.5 }}>DOANH THU SAAS 💎</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', color: '#10B981', mb: 2 }}>
                        {new Intl.NumberFormat('vi-VN').format(stats.subscriptionRevenue)}đ
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7, mb: 4 }}>Tổng thu nhập thực tế từ phí đăng ký gói Pro & Ultra của hệ thống.</Typography>
                    <Button 
                        fullWidth 
                        component={Link} to="/admin/finance"
                        variant="contained" 
                        sx={{ bgcolor: '#10B981', color: '#064E3B', fontWeight: 900, borderRadius: 0, py: 1.5, '&:hover': { bgcolor: '#059669' } }}
                        endIcon={<ArrowOutward />}
                    >
                        Quản lý Tài chính
                    </Button>
                </Card>
            </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
