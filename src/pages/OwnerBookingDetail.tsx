import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Card, Typography, Grid, Divider, 
  Button, Chip, Stack, Alert, CircularProgress,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Avatar
} from '@mui/material';
import { 
  ArrowBack, Print, CheckCircle, 
  Cancel, AccountBalanceWallet, Phone, 
  Email, AccessTime, CalendarToday
} from '@mui/icons-material';
import { bookingApi } from '@/api/bookingApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const OwnerBookingDetail = () => {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: res, isLoading, error } = useQuery({
    queryKey: ['booking-detail', bookingCode],
    queryFn: () => bookingApi.getBookingById(bookingCode!),
    enabled: !!bookingCode,
  });

  const booking = res?.data;

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => bookingApi.cancelBooking(bookingCode!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-detail', bookingCode] });
    }
  });

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  if (error || !booking) return (
    <Alert severity="error" sx={{ mt: 4 }}>Không tìm thấy thông tin đơn đặt sân hoặc có lỗi xảy ra.</Alert>
  );

  const STATUS_CONFIG: any = {
    pending: { label: 'CHỜ THANH TOÁN', color: 'warning', icon: <AccessTime /> },
    confirmed: { label: 'ĐÃ XÁC NHẬN', color: 'success', icon: <CheckCircle /> },
    completed: { label: 'HOÀN THÀNH', color: 'info', icon: <CheckCircle /> },
    cancelled: { label: 'ĐÃ HỦY', color: 'error', icon: <Cancel /> },
    checked_in: { label: 'ĐÃ CHECK-IN', color: 'secondary', icon: <CheckCircle /> },
  };

  const status = STATUS_CONFIG[booking.status] || { label: booking.status, color: 'default' };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Actions */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          Quay lại
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="In đơn hàng">
          <IconButton sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }} onClick={() => window.print()}>
            <Print />
          </IconButton>
        </Tooltip>
        {booking.status === 'confirmed' && (
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<Cancel />}
            onClick={() => {
                if(window.confirm('Bạn có chắc chắn muốn hủy đơn này?')) {
                    cancelMutation.mutate('Chủ sân hủy');
                }
            }}
            disabled={cancelMutation.isPending}
            sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
          >
            Hủy đơn
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        {/* Left Column: General Info & Slots */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 4, borderRadius: 4, mb: 3, border: '1px solid #F1F5F9', boxShadow: 'none' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
              <Box>
                <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 1.5 }}>
                  CHI TIẾT ĐƠN HÀNG
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 950, mt: 0.5 }}>#{booking.booking_code}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ngày đặt: {format(new Date(booking.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                </Typography>
              </Box>
              <Chip 
                icon={status.icon} 
                label={status.label} 
                color={status.color} 
                sx={{ fontWeight: 800, px: 1, height: 32 }} 
              />
            </Stack>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ mr: 1, fontSize: 20 }} /> Khung giờ đã đặt
            </Typography>
            
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
              <Table size="medium">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Ngày</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Sân</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#64748B' }} align="right">Giá</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {booking.slots?.map((slot: any, idx: number) => (
                    <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{format(new Date(slot.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{slot.court?.name}</TableCell>
                      <TableCell>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {parseInt(slot.price).toLocaleString()}đ
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {booking.notes && (
              <Box sx={{ mt: 4, p: 2, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px solid #FEF3C7' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', mb: 0.5 }}>Ghi chú từ khách hàng:</Typography>
                <Typography variant="body2" color="#92400E">{booking.notes}</Typography>
              </Box>
            )}
          </Card>

          {/* QR Code Section */}
          <Card sx={{ p: 4, borderRadius: 4, border: '1px solid #F1F5F9', boxShadow: 'none', textAlign: 'center' }}>
             <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Mã QR Check-in</Typography>
             <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box 
                    component="img" 
                    src={booking.qr_code} 
                    sx={{ width: 220, height: 220, border: '4px solid #F1F5F9', borderRadius: 3 }} 
                />
             </Box>
             <Typography variant="caption" color="text.secondary">
                Dùng mã này để quét tại quầy lễ tân khi khách đến
             </Typography>
          </Card>
        </Grid>

        {/* Right Column: Customer & Payment */}
        <Grid item xs={12} md={4}>
          {/* Customer Info */}
          <Card sx={{ p: 4, borderRadius: 4, mb: 3, border: '1px solid #F1F5F9', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Thông tin khách hàng</Typography>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800 }}>{booking.customer_name?.[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{booking.customer_name}</Typography>
                  <Typography variant="caption" color="text.secondary">Khách {booking.booking_type === 'walkin' ? 'Vãng lai' : 'Thành viên'}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{booking.customer_phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{booking.customer_email || 'N/A'}</Typography>
              </Box>
            </Stack>
          </Card>

          {/* Payment Info */}
          <Card sx={{ p: 4, borderRadius: 4, border: '1px solid #F1F5F9', boxShadow: 'none', bgcolor: '#F8FAFC' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center' }}>
               <AccountBalanceWallet sx={{ mr: 1, fontSize: 20 }} /> Thanh toán
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Giá trị đơn</Typography>
                <Typography sx={{ fontWeight: 700 }}>{parseInt(booking.total_price).toLocaleString()}đ</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Giảm giá</Typography>
                <Typography sx={{ fontWeight: 700, color: 'error.main' }}>-{parseInt(booking.discount_amount || 0).toLocaleString()}đ</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Tổng cộng</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: 'primary.main' }}>
                  {parseInt(booking.total_price).toLocaleString()}đ
                </Typography>
              </Box>
            </Stack>
            
            <Box sx={{ mt: 4, p: 2, bgcolor: booking.payment_status === 'paid' ? '#F0FDF4' : '#FFF1F2', borderRadius: 2, textAlign: 'center' }}>
               <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 700, opacity: 0.7 }}>
                  PHƯƠNG THỨC: {booking.payment_method?.toUpperCase()}
               </Typography>
               <Typography variant="subtitle2" sx={{ 
                  fontWeight: 900, 
                  color: booking.payment_status === 'paid' ? '#16A34A' : '#E11D48' 
               }}>
                  {booking.payment_status === 'paid' ? 'ĐÃ QUYẾT TOÁN' : 'CHƯA THANH TOÁN'}
               </Typography>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#EFF6FF', borderRadius: 2 }}>
               <Typography variant="caption" color="primary.main" sx={{ fontWeight: 800, display: 'block', mb: 1 }}>
                  DOANH THU THỰC NHẬN (OWNER)
               </Typography>
               <Typography variant="h5" sx={{ fontWeight: 950, color: 'primary.dark' }}>
                  {parseInt(booking.owner_revenue).toLocaleString()}đ
               </Typography>
               <Typography variant="caption" color="text.secondary">
                  Đã trừ {booking.commission_rate}% phí sàn ({parseInt(booking.commission_amount).toLocaleString()}đ)
               </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerBookingDetail;
