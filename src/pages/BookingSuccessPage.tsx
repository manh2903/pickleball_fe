import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, Container, Typography, Card, Button, 
  Divider, Stack, CircularProgress, Alert,
  Paper, Chip, Grid, IconButton
} from '@mui/material';
import { 
  CheckCircle, AccessTime, 
  DirectionsRun, Share, ArrowBack,
  Payments, ContentCopy, Verified
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { bookingApi } from '@/api/bookingApi';
import { paymentApi } from '@/api/paymentApi';
import { useSnackbar } from 'notistack';

const BookingSuccessPage = () => {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const { enqueueSnackbar } = useSnackbar();

  const { data: bookingRes, isLoading, error } = useQuery({
    queryKey: ['booking-detail', bookingCode],
    queryFn: () => bookingApi.getBookingById(bookingCode!),
    enabled: !!bookingCode,
  });

  const booking = bookingRes?.data;

  const handlePayment = async () => {
    try {
      const res = await paymentApi.createVNPayUrl(bookingCode!);
      if (res.data) {
        window.location.href = res.data;
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Lỗi khi tạo link thanh toán', { variant: 'error' });
    }
  };

  const copyId = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.booking_code.toString());
    enqueueSnackbar('Đã sao chép mã đặt sân', { variant: 'success' });
  };

  const groupedSlots = useMemo(() => {
    if (!booking?.slots) return [];
    const groups: any = {};
    booking.slots.forEach((s: any) => {
      const cId = s.court_id;
      if (!groups[cId]) groups[cId] = { name: s.court?.name || 'Sân con', slots: [] };
      groups[cId].slots.push(s);
    });
    return Object.values(groups);
  }, [booking]);

  if (isLoading) return <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error || !booking) return <Container sx={{ py: 10 }}><Alert severity="error">Không tìm thấy thông tin lượt đặt.</Alert></Container>;

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)', 
      minHeight: { md: 'calc(100vh - 70px)' }, 
      display: 'flex', 
      alignItems: 'center',
      py: { xs: 4, md: 0 }
    }}>
      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="center">
          
          {/* Left: Success Status & QR */}
          <Grid item xs={12} md={5}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 70 }} />
                <Box sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'white', borderRadius: '50%', p: 0.2, display: 'flex' }}>
                   <Verified color="primary" sx={{ fontSize: 24 }} />
                </Box>
              </Box>
              
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, fontFamily: 'Times New Roman' }}>
                Xác nhận đặt lịch ✨
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                   Mã đặt sân: #{booking.booking_code.toString().padStart(6, '0')}
                </Typography>
                <IconButton size="small" onClick={copyId} sx={{ p: 0.5 }}><ContentCopy fontSize="inherit" /></IconButton>
              </Box>

              <Paper elevation={0} sx={{ 
                p: 2.5, 
                bgcolor: 'white', 
                borderRadius: 4, 
                display: 'inline-block',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                border: '1px solid #E2E8F0'
              }}>
                <QRCodeSVG value={`PB-BOOKING-${booking.booking_code}`} size={160} />
              </Paper>
              
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary', fontWeight: 600 }}>
                Vui lòng đưa mã này cho nhân viên khi check-in.
              </Typography>
            </Box>
          </Grid>

          {/* Right: Booking Details */}
          <Grid item xs={12} md={7}>
            <Card sx={{ 
              borderRadius: 3, 
              p: 3, 
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Chi tiết dịch vụ</Typography>
              
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ p: 1, bgcolor: '#F0F9FF', borderRadius: 2, display: 'flex', color: 'primary.main' }}>
                    <DirectionsRun />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>ĐỊA ĐIỂM</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>
                      {booking.venue?.name || 'Pickleball Center'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{booking.venue?.address || 'Địa chỉ không khả dụng'}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ p: 1, bgcolor: '#F0FDF4', borderRadius: 2, display: 'flex', color: 'success.main' }}>
                    <AccessTime />
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>DANH SÁCH GIỜ CHƠI</Typography>
                    {booking.slots?.length > 0 ? (
                      <>
                        <Typography variant="body1" sx={{ fontWeight: 800, mb: 1 }}>
                           {new Date(booking.slots[0].date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                        
                        {groupedSlots.map((group: any, idx: number) => (
                          <Box key={idx} sx={{ 
                            mb: idx !== groupedSlots.length - 1 ? 2 : 0,
                            p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', borderLeft: '4px solid #0EA5E9'
                          }}>
                             <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>{group.name}</Typography>
                             <Typography variant="body1" sx={{ fontWeight: 800 }}>
                                {group.slots[0].start_time.slice(0, 5)} - {group.slots[group.slots.length - 1].end_time.slice(0, 5)}
                             </Typography>
                          </Box>
                        ))}
                      </>
                    ) : (
                      <Alert severity="info" sx={{ borderRadius: 2, bgcolor: '#F8FAFC', py: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', fontStyle: 'italic' }}>
                           {booking.notes || 'Không tìm thấy thông tin lịch trình (Đơn đã hủy)'}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>TRẠNG THÁI</Typography>
                    <Stack direction="row" spacing={1}>
                       <Chip 
                        label={booking.status === 'cancelled' ? 'Đã hủy đơn' : (booking.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán')} 
                        color={booking.status === 'cancelled' ? 'error' : (booking.payment_status === 'paid' ? 'success' : 'warning')} 
                        size="small" 
                        sx={{ fontWeight: 900, borderRadius: 1 }}
                      />
                      {booking.payment_status === 'refunded' && (
                        <Chip label="Đã hoàn tiền" color="info" size="small" sx={{ fontWeight: 900, borderRadius: 1 }} />
                      )}
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>TỔNG TIỀN</Typography>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 900 }}>
                      {new Intl.NumberFormat('vi-VN').format(booking.total_price || 0)}đ
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={2}>
                {booking.payment_status !== 'paid' && (
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="large" 
                    onClick={handlePayment}
                    startIcon={<Payments />}
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 900, bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
                  >
                    THANH TOÁN QUA VNPAY
                  </Button>
                )}
                <Button variant="outlined" fullWidth size="large" sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }} startIcon={<Share />}>Chia sẻ</Button>
              </Stack>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                 <Button component={Link} to="/" size="small" startIcon={<ArrowBack />} sx={{ fontWeight: 600, color: 'text.secondary' }}>Quay về trang chủ</Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BookingSuccessPage;
