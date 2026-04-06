import { useState, useMemo, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Card, Button, Stack, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, CircularProgress, Alert, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem
} from '@mui/material';
import { 
  Search, FilterList, AccessTime, CheckCircle, 
  Cancel, Payments, Contacts, Info, ReceiptLong, Visibility, AccountBalanceWallet
} from '@mui/icons-material';
import { ownerApi } from '@/api/ownerApi';
import { useSnackbar } from 'notistack';
import { socketService } from '@/utils/socket';
import { useAuthStore } from '@/stores/authStore';

const OwnerBookings = () => {
  const { venueId }: any = useOutletContext();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  console.log('Current Owner:', user?.name); // Use user to clear lint

  const { data, isLoading, error } = useQuery({
    queryKey: ['owner-bookings', venueId, status, search],
    queryFn: () => ownerApi.getBookings({ venue_id: venueId, status, search }),
    enabled: !!venueId
  });

  // Real-time notifications
  useEffect(() => {
    if (venueId) {
      socketService.connect();
      socketService.joinVenue(venueId);

      socketService.onNewBooking((data) => {
        enqueueSnackbar(`🆕 Đơn đặt sân mới: ${data.booking.booking_code}!`, { 
          variant: 'info',
          autoHideDuration: 10000 
        });
        queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      });

      socketService.onBookingStatusUpdated((data) => {
        console.log('Booking status updated:', data);
        queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [venueId, queryClient, enqueueSnackbar]);

  const confirmMutation = useMutation({
    mutationFn: (id: number) => ownerApi.confirmBookingPayment(id),
    onSuccess: () => {
      enqueueSnackbar('Đã xác nhận thanh toán thành công!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi khi xác nhận', { variant: 'error' })
  });

  const bookings = data?.data?.bookings || [];

  if (isLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Không thể tải danh sách đặt sân.</Alert>;

  return (
    <Box>
      <Card sx={{ p: 4, borderRadius: 1.5, mb: 4, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, fontFamily: 'Times New Roman' }}>🎯 Quản lý Lịch đặt sân</Typography>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
          <TextField
            placeholder="Tìm theo mã đơn, khách hàng..."
            size="small"
            sx={{ flexGrow: 1 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.disabled' }} /> }}
          />
          <TextField
            select
            label="Bộ lọc Trạng thái"
            size="small"
            sx={{ minWidth: 200 }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="">Tất cả lượt đặt</MenuItem>
            <MenuItem value="confirmed">Đã xác nhận</MenuItem>
            <MenuItem value="checked_in">Đã check-in</MenuItem>
            <MenuItem value="completed">Đã hoàn thành</MenuItem>
            <MenuItem value="cancelled">Đã hủy</MenuItem>
          </TextField>
        </Stack>

        <TableContainer sx={{ borderRadius: 1, border: '1px solid #F1F5F9' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Mã đơn</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Khách hàng</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Sân & Khung giờ</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Thanh toán / Phương thức</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Tổng tiền</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking: any) => (
                <TableRow key={booking.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                     <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        #{booking.booking_code || booking.id}
                     </Typography>
                     <Chip label={booking.status} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.6rem', height: 18, mt: 0.5 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{booking.user?.name || booking.customer_name || 'Khách vãng lai'}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{booking.user?.phone || booking.customer_phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{booking.court?.name}</Typography>
                    {booking.slots?.map((s: any, idx: number) => (
                      <Typography key={idx} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        • {new Date(s.date).toLocaleDateString('vi-VN')} | {s.start_time.slice(0, 5)}-{s.end_time.slice(0, 5)}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                       <Chip 
                        label={booking.payment_status === 'paid' ? 'Đã thu tiền' : 'Chưa thu tiền'} 
                        size="small" 
                        color={booking.payment_status === 'paid' ? 'success' : 'warning'} 
                        sx={{ fontWeight: 800, width: 'fit-content' }}
                      />
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                         {booking.payment_method === 'cash' ? <AccountBalanceWallet sx={{ fontSize: '0.9rem' }} /> : <Payments sx={{ fontSize: '0.9rem' }} />}
                         {booking.payment_method === 'vnpay' ? 'VNPay' : 'Tiền mặt'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                     <Typography variant="body1" sx={{ fontWeight: 900, color: 'primary.dark' }}>
                        {new Intl.NumberFormat('vi-VN').format(booking.total_price)}đ
                     </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                       <Tooltip title="Xem chi tiết">
                        <IconButton size="small" color="primary" sx={{ border: '1px solid #E2E8F0' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                       </Tooltip>
                       
                       {booking.payment_status !== 'paid' && booking.status !== 'cancelled' && (
                         <Tooltip title="Xác nhận đã nhận tiền mặt">
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success" 
                              startIcon={<CheckCircle />}
                              onClick={() => {
                                if(window.confirm('Xác nhận khách đã thanh toán tiền mặt cho đơn này?')) {
                                  confirmMutation.mutate(booking.id);
                                }
                              }}
                              sx={{ fontWeight: 700, borderRadius: 1 }}
                            >
                              XÁC NHẬN CẦM TIỀN
                            </Button>
                         </Tooltip>
                       )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                     <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Chưa có lượt đặt nào phù hợp với bộ lọc.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default OwnerBookings;
