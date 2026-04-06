import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Grid, Card, Typography, Stack, 
  CircularProgress, Alert, Button, Divider,
  Paper, MenuItem, TextField, useTheme
} from '@mui/material';
import { 
  TrendingUp, Download, PieChart as PieChartIcon,
  EventNote, AttachMoney, Info, CalendarMonth,
  QueryStats
} from '@mui/icons-material';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip as ReTooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';
import { ownerApi } from '@/api/ownerApi';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#6366F1', '#EC4899'];

const ReportCard = ({ title, value, icon, subtitle, color }: any) => (
  <Card sx={{ 
    p: 4, borderRadius: 4, position: 'relative', overflow: 'hidden', 
    border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' 
  }}>
    <Box sx={{ 
      position: 'absolute', top: -15, right: -15, p: 4, 
      borderRadius: '50%', bgcolor: `${color}08`, color: color 
    }}>
      {icon}
    </Box>
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1.5 }}>{title.toUpperCase()}</Typography>
      <Typography variant="h3" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', letterSpacing: -1 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{subtitle}</Typography>
    </Stack>
  </Card>
);

const OwnerReports = () => {
  const { venueId }: any = useOutletContext();
  const theme = useTheme();
  const [period, setPeriod] = useState('7days');

  const { data, isLoading, error } = useQuery({
    queryKey: ['owner-reports', venueId, period],
    queryFn: () => ownerApi.getReports(venueId, { period }),
    enabled: !!venueId
  });

  const stats = data?.data || {
    totalRevenue: 0,
    totalBookings: 0,
    avgBookingValue: 0,
    dailyRevenue: [],
    topCourts: []
  };

  if (isLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress thickness={5} size={60} /></Box>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 3 }}>Lỗi đồng bộ dữ liệu đồ thị kinh doanh.</Alert>;

  return (
    <Box sx={{ px: { xs: 1, md: 0 } }}>
      {/* Header & Filter */}
      <Box sx={{ mb: 6, display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', mb: 1, letterSpacing: -1 }}>Tài chính & Hiệu suất 📊</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>Phân tích chuyên sâu về chỉ số tăng trưởng của cơ sở.</Typography>
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' }, alignItems: 'center' }}>
          <TextField
            select
            size="small"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            sx={{ 
               minWidth: 180, 
               '& .MuiOutlinedInput-root': { 
                  borderRadius: 3, 
                  bgcolor: 'white', 
                  fontWeight: 700,
                  height: 48 // Match button height
               }
            }}
            InputProps={{ startAdornment: <CalendarMonth sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} /> }}
          >
            <MenuItem value="today">Hôm nay</MenuItem>
            <MenuItem value="7days">7 ngày qua</MenuItem>
            <MenuItem value="30days">30 ngày qua</MenuItem>
            <MenuItem value="thisMonth">Trong tháng này</MenuItem>
          </TextField>
          
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<Download />}
            sx={{ 
              px: 4, height: 48, borderRadius: 3, fontWeight: 900, fontSize: '0.85rem',
              background: 'linear-gradient(45deg, #059669 30%, #10B981 90%)',
              '&:hover': { background: '#059669' },
              whiteSpace: 'nowrap'
            }}
          >
            XUẤT BÁO CÁO
          </Button>
        </Stack>
      </Box>

      {/* KPI Section */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <ReportCard 
            title="TỔNG DOANH THU" 
            value={`${new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ`} 
            icon={<AttachMoney sx={{ fontSize: 40 }} />} 
            subtitle="Đã khấu trừ thuế và phí sàn"
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ReportCard 
            title="TẦN SUẤT ĐẶT SÂN" 
            value={stats.totalBookings} 
            icon={<EventNote sx={{ fontSize: 40 }} />} 
            subtitle={`${stats.totalBookings} lượt đăng ký thành công`}
            color="#3B82F6"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ReportCard 
            title="GIÁ TRỊ ĐƠN TB" 
            value={`${new Intl.NumberFormat('vi-VN').format(Math.round(stats.avgBookingValue))}đ`} 
            icon={<QueryStats sx={{ fontSize: 40 }} />} 
            subtitle="Giá thực thu bình quân mỗi đơn"
            color="#F59E0B"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={4}>
        {/* Main Revenue Area Chart */}
        <Grid item xs={12} lg={8}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #F1F5F9', boxShadow: 'none' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={6}>
              <Box sx={{ p: 1, bgcolor: '#EEF2FF', borderRadius: 2 }}>
                <TrendingUp color="primary" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Biểu đồ tăng trưởng doanh thu</Typography>
            </Stack>
            
            <Box sx={{ height: 420, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontWeight: 600, fontSize: 11 }} 
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontWeight: 600, fontSize: 11 }}
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <ReTooltip 
                    contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} 
                    formatter={(val: any) => [`${new Intl.NumberFormat('vi-VN').format(val)}đ`, 'DOANH THU']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 5, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Top Courts Pie Chart */}
        <Grid item xs={12} lg={4}>
           <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #F1F5F9', height: '100%' }}>
             <Stack direction="row" spacing={1.5} alignItems="center" mb={6}>
                <Box sx={{ p: 1, bgcolor: '#ECFDF5', borderRadius: 2 }}>
                  <PieChartIcon sx={{ color: '#10B981' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Tỷ trọng khai thác sân</Typography>
             </Stack>
             
             <Box sx={{ height: 320, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.topCourts}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {stats.topCourts.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      wrapperStyle={{ paddingTop: 30, fontWeight: 700, opacity: 0.8 }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
             </Box>
             
             <Divider sx={{ my: 4, borderStyle: 'dashed' }} />
             
             <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, bgcolor: '#F8FAFC', p: 2, borderRadius: 2 }}>
                   <Info sx={{ color: 'primary.main', mt: 0.3 }} fontSize="small" />
                   <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', lineHeight: 1.6 }}>
                      Biểu đồ dựa trên dữ liệu <b>{period === '7days' ? '7 ngày qua' : period === '30days' ? '30 ngày qua' : 'từ đầu tháng'}</b>. Sân có tỷ trọng cao nhất thể hiện nhu cầu lớn từ người dùng.
                   </Typography>
                </Box>
             </Stack>
           </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerReports;
