import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Container, Typography, Card, Grid, 
  Tabs, Tab, Chip, Button, Stack,
  CircularProgress, Alert, Paper, IconButton, Tooltip,
  Avatar
} from '@mui/material';
import { 
  AccessTime, LocationOn, QrCodeScanner, 
  CancelOutlined, Payments,
  CheckCircle, History, Info, ChevronRight,
  ReceiptLong, ConfirmationNumber, CalendarMonth
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { bookingApi } from '@/api/bookingApi';

const StatusChip = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string, color: any, icon: any }> = {
    pending: { label: 'Chờ xử lý', color: 'warning', icon: <History sx={{ fontSize: '1rem' }} /> },
    confirmed: { label: 'Đã xác nhận', color: 'success', icon: <CheckCircle sx={{ fontSize: '1rem' }} /> },
    checked_in: { label: 'Đã check-in', color: 'info', icon: <QrCodeScanner sx={{ fontSize: '1rem' }} /> },
    completed: { label: 'Hoàn thành', color: 'primary', icon: <CheckCircle sx={{ fontSize: '1rem' }} /> },
    cancelled: { label: 'Đã hủy', color: 'error', icon: <CancelOutlined sx={{ fontSize: '1rem' }} /> },
  };
  const config = configs[status] || { label: status, color: 'default', icon: <Info sx={{ fontSize: '1rem' }} /> };
  return (
    <Chip 
      label={config.label} 
      color={config.color} 
      size="small" 
      icon={config.icon}
      sx={{ fontWeight: 800, borderRadius: 1, px: 0.5 }} 
    />
  );
};

const PaymentInfo = ({ status, method, type }: { status: string, method?: string, type: string }) => {
  const methodLabels: Record<string, string> = {
    vnpay: 'VNPay Online',
    cash: 'Tiền mặt tại quầy',
    transfer: 'Chuyển khoản',
    wallet: 'Số dư ví'
  };
  
  const statusLabels: Record<string, string> = {
    unpaid: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    partial: 'Thanh toán một phần',
    refunded: 'Đã hoàn tiền'
  };

  const isPaid = status === 'paid';
  const displayMethod = method || (type === 'online' ? 'vnpay' : 'cash');

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
       <Box sx={{ 
         display: 'flex', alignItems: 'center', gap: 1, 
         px: 1.5, py: 0.5, bgcolor: isPaid ? '#F0FDF4' : '#F8FAFC', 
         borderRadius: 1, border: '1px solid', borderColor: isPaid ? '#DCFCE7' : '#E2E8F0'
       }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isPaid ? 'success.main' : 'warning.main' }} />
          <Typography variant="caption" sx={{ fontWeight: 800, color: isPaid ? 'success.dark' : 'text.secondary' }}>
             {statusLabels[status] || status}
          </Typography>
       </Box>
       <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Payments sx={{ fontSize: '0.9rem' }} /> {methodLabels[displayMethod] || displayMethod}
       </Typography>
    </Stack>
  );
};

const BookingItem = ({ booking, onCancel }: { booking: any, onCancel: (id: number) => void }) => {
  const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending';
  
  return (
    <Card sx={{ 
      borderRadius: 1.5, 
      mb: 3, 
      boxShadow: 'none',
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': { 
        borderColor: 'primary.main',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
      }
    }}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Section 1: Venue & Court */}
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar sx={{ 
                width: 56, height: 56, 
                bgcolor: '#F0F9FF', color: 'primary.main',
                borderRadius: 1.5, border: '1px solid #E0F2FE'
              }}>
                <ConfirmationNumber />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" noWrap sx={{ fontWeight: 900, fontFamily: 'Times New Roman', fontSize: '1.25rem', mb: 0.5 }}>
                  {booking.slots?.[0]?.court?.venue?.name || 'Pickleball Center'}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                   {Array.from(new Set(booking.slots?.map((s: any) => s.court?.name))).filter(Boolean).map((name: any) => (
                      <Chip key={name} label={name} size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem', mb: 0.5 }} />
                   ))}
                   <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
                      #{booking.booking_code}
                   </Typography>
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* Section 2: Time & Location */}
          <Grid item xs={12} md={4}>
             <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <CalendarMonth sx={{ color: 'primary.main', fontSize: '1.2rem', mt: 0.2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {booking.slots?.[0]?.date ? new Date(booking.slots[0].date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 900 }}>
                       {booking.slots?.[0]?.start_time?.slice(0, 5)} — {booking.slots?.[booking.slots.length - 1]?.end_time?.slice(0, 5)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn sx={{ color: '#64748B', fontSize: '1.2rem' }} />
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 600, maxWidth: 200 }}>
                    {booking.slots?.[0]?.court?.venue?.address}
                  </Typography>
                </Box>
             </Stack>
          </Grid>

          {/* Section 3: Status & Actions */}
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2} justifyContent={{ md: 'flex-end' }} alignItems="center">
               <Box sx={{ textAlign: { md: 'right' }, mr: { md: 2 } }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                     {new Intl.NumberFormat('vi-VN').format(booking.total_price)}đ
                  </Typography>
                  <StatusChip status={booking.status} />
               </Box>

               <Button 
                component={Link} 
                to={`/bookings/${booking.booking_code}`}
                variant="outlined" 
                color="primary"
                endIcon={<ChevronRight />}
                sx={{ 
                  borderRadius: 1, 
                  py: 1, px: 2, 
                  fontWeight: 800, 
                  borderWidth: 2, 
                  '&:hover': { borderWidth: 2 } 
                }}
              >
                Chi tiết
              </Button>
            </Stack>
          </Grid>

          {/* Bottom Bar: Payment Info & Quick Actions */}
          <Grid item xs={12}>
             <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
             <Stack direction="row" justifyContent="space-between" alignItems="center">
                <PaymentInfo 
                  status={booking.payment_status} 
                  method={booking.payments?.[0]?.method} 
                  type={booking.booking_type} 
                />
                
                {isUpcoming && (
                  <Button 
                    variant="text" 
                    color="error" 
                    size="small" 
                    onClick={() => onCancel(booking.id)}
                    startIcon={<CancelOutlined />}
                    sx={{ fontWeight: 700, borderRadius: 1 }}
                  >
                    Hủy đặt sân
                  </Button>
                )}
             </Stack>
          </Grid>

        </Grid>
      </Box>
    </Card>
  );
};

const Divider = ({ sx }: { sx?: any }) => <Box sx={{ borderBottom: '1px solid #E2E8F0', ...sx }} />;

const MyBookingsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-bookings', tabValue],
    queryFn: () => {
      let status = '';
      if (tabValue === 1) status = 'confirmed';
      if (tabValue === 2) status = 'completed';
      if (tabValue === 3) status = 'cancelled';
      return bookingApi.getMyBookings({ status });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingApi.cancelBooking(id, 'Người dùng yêu cầu hủy'),
    onSuccess: () => {
      enqueueSnackbar('Hủy đặt sân thành công', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Không thể hủy lúc này', { variant: 'error' })
  });

  const handleCancelClick = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lượt đặt này?')) {
      cancelMutation.mutate(id);
    }
  };

  const bookings = data?.data?.bookings || [];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-end' }, gap: 3 }}>
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
               <ReceiptLong color="primary" sx={{ fontSize: '2.5rem' }} />
               <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: 'Times New Roman' }}>
                  Lịch sử Đặt sân
               </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Quản lý và theo dõi trạng thái các lượt đặt sân chuẩn quốc tế của bạn.
            </Typography>
          </Box>
          
          <Paper elevation={0} sx={{ p: 0.5, bgcolor: '#F1F5F9', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
            <Tabs 
              value={tabValue} 
              onChange={(_, val) => setTabValue(val)}
              sx={{ 
                minHeight: 40,
                '& .MuiTab-root': { py: 1, minHeight: 40, fontWeight: 800, borderRadius: 1, color: '#64748B' },
                '& .Mui-selected': { bgcolor: 'white', color: 'primary.main', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
              }}
              TabIndicatorProps={{ sx: { display: 'none' } }}
            >
              <Tab label="Tất cả" />
              <Tab label="Sắp diễn ra" />
              <Tab label="Hoàn thành" />
              <Tab label="Đã hủy" />
            </Tabs>
          </Paper>
        </Box>

        {/* Bookings List */}
        {isLoading ? (
          <Box sx={{ py: 15, textAlign: 'center' }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" variant="outlined" sx={{ borderRadius: 1.5, bgcolor: 'white' }}>
             Đã xảy ra lỗi khi đồng bộ dữ liệu. Vui lòng thử lại sau.
          </Alert>
        ) : bookings.length > 0 ? (
          <Stack spacing={0}>
            {bookings.map((booking: any) => (
              <BookingItem 
                key={booking.id} 
                booking={booking} 
                onCancel={handleCancelClick} 
              />
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center', py: 15, bgcolor: 'white', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
             <ConfirmationNumber sx={{ fontSize: 80, color: '#E2E8F0', mb: 2 }} />
             <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.secondary', mb: 1 }}>Bạn chưa có lượt đặt nào</Typography>
             <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Bắt đầu trải nghiệm ngay bằng cách chọn sân phù hợp với bạn.</Typography>
             <Button component={Link} to="/marketplace" variant="contained" size="large" sx={{ py: 1.5, px: 6, borderRadius: 1.5, fontWeight: 900 }}>
               ĐẶT SÂN NGAY
             </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MyBookingsPage;
