import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Button, IconButton, Slider,
  CircularProgress, Alert, Stack, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Tooltip,
  Paper, Divider, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { 
  ArrowBack, CheckCircle, Payments, AccountBalanceWallet,
  CalendarMonth, Info
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { venueApi } from '@/api/venueApi';
import { bookingApi } from '@/api/bookingApi';
import { useAuthStore } from '@/stores/authStore';
import { socketService } from '@/utils/socket';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 to 22:00

const BookingPage = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [zoom, setZoom] = useState(100);
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'cash'>('vnpay');

  // 1. Fetch Venue
  const { data: venueRes, isLoading: isLoadingVenue } = useQuery({
    queryKey: ['venue-booking', venueId],
    queryFn: () => venueApi.getVenueById(venueId!),
  });
  const venue = venueRes?.data;

  // 2. Fetch All Court Availability
  const { data: slotsRes, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['venue-slots', venueId, selectedDate.format('YYYY-MM-DD')],
    queryFn: () => bookingApi.getAvailability({ venue_id: venueId, date: selectedDate.format('YYYY-MM-DD') }),
    enabled: !!venueId,
  });
  const slots = slotsRes?.data?.slots || [];

  // 3. Real-time updates via Socket.io
  useEffect(() => {
    socketService.connect();
    
    // Join all court rooms for this venue to receive updates
    if (venue?.courts) {
      venue.courts.forEach((court: any) => {
        socketService.joinCourt(court.id);
      });
    }

    socketService.onSlotsUpdated((data) => {
      console.log('📢 Real-time update:', data);
      
      // Notify if conflict with selected slots
      const conflict = selectedSlotIds.filter(id => data.ids.includes(id));
      if (conflict.length > 0 && data.status === 'booked') {
        enqueueSnackbar('Một số giờ bạn chọn vừa được người khác đặt!', { variant: 'warning' });
        setSelectedSlotIds(prev => prev.filter(id => !data.ids.includes(id)));
      }

      // Refresh availability data
      queryClient.invalidateQueries({ queryKey: ['venue-slots', venueId] });
    });

    return () => {
      socketService.disconnect();
    };
  }, [venue?.courts, selectedSlotIds, venueId, queryClient, enqueueSnackbar]);

  // Group slots by court and start_time
  const gridData = useMemo(() => {
    const data: any = {};
    slots.forEach((slot: any) => {
      const startTime = parseInt(slot.start_time.split(':')[0]);
      if (!data[slot.court_id]) data[slot.court_id] = {};
      data[slot.court_id][startTime] = slot;
    });
    return data;
  }, [slots]);

  const selectedSlots = useMemo(() => {
    return slots.filter((s: any) => selectedSlotIds.includes(s.id));
  }, [slots, selectedSlotIds]);

  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum: number, s: any) => sum + parseFloat(s.price), 0);
  }, [selectedSlots]);

  const createMutation = useMutation({
    mutationFn: bookingApi.createBooking,
    onSuccess: (res: any) => {
      enqueueSnackbar('Đặt sân thành công! 🎉', { variant: 'success' });
      navigate(`/bookings/${res.data.booking_code}`);
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Đặt sân thất bại', { variant: 'error' })
  });

  const handleToggleSlot = (id: number) => {
    setSelectedSlotIds(prev => {
      if (prev.includes(id)) return prev.filter(sid => sid !== id);
      return [...prev, id];
    });
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      enqueueSnackbar('Vui lòng đăng nhập để đặt sân', { variant: 'info', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
      navigate('/login');
      return;
    }
    createMutation.mutate({ 
      slot_ids: selectedSlotIds, 
      notes, 
      payment_method: paymentMethod 
    });
  };

  if (isLoadingVenue) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!venue) return <Box sx={{ p: 4 }}><Alert severity="error">Địa điểm không tồn tại.</Alert></Box>;

  const cellWidth = (zoom / 100) * 100;
  const isToday = selectedDate.isSame(dayjs(), 'day');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
        
        {/* Dark Green Header */}
        <Box sx={{ bgcolor: '#064E3B', color: 'white', py: 1.5, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.2rem', fontFamily: 'Times New Roman' }}>
                {venue.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700 }}>Đặt lịch ngày trực quan</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DatePicker 
              value={selectedDate}
              onChange={(v) => {
                v && setSelectedDate(v);
                setSelectedSlotIds([]); // Clear selection on date change
              }}
              minDate={dayjs()}
              slotProps={{ 
                textField: { 
                  size: 'small', 
                  sx: { bgcolor: 'white', borderRadius: 1.5, width: 160 } 
                } 
              }}
            />
          </Box>
        </Box>

        {/* Legend & Notice Bar */}
        <Stack direction="row" sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0', px: 2, py: 1.5 }} spacing={3} alignItems="center" flexWrap="wrap">
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Box sx={{ width: 14, height: 14, bgcolor: '#0EA5E9', borderRadius: '3px' }} />
             <Typography variant="caption" sx={{ fontWeight: 800 }}>Đang chọn</Typography>
           </Box>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Box sx={{ width: 14, height: 14, bgcolor: 'white', border: '1px solid #CBD5E1', borderRadius: '3px' }} />
             <Typography variant="caption" sx={{ fontWeight: 800 }}>Sẵn sàng</Typography>
           </Box>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Box sx={{ width: 14, height: 14, bgcolor: '#EF4444', borderRadius: '3px' }} />
             <Typography variant="caption" sx={{ fontWeight: 800 }}>Đã đặt</Typography>
           </Box>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Box sx={{ width: 14, height: 14, bgcolor: '#94A3B8', borderRadius: '3px' }} />
             <Typography variant="caption" sx={{ fontWeight: 800 }}>Hết hạn / Khóa</Typography>
           </Box>
           <Divider orientation="vertical" flexItem />
           <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap:1 }}>
             <Info fontSize="small" color="primary" /> Hotline hỗ trợ: {venue.phone || '0987654321'}
           </Typography>
        </Stack>

        {/* Visual Grid Container */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1, position: 'relative' }}>
          <Paper elevation={0} sx={{ 
            minWidth: (cellWidth * HOURS.length) + 120, 
            borderRadius: 1.5, 
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            {/* Hour Header */}
            <Box sx={{ display: 'flex', bgcolor: '#F1F5F9', borderBottom: '1px solid #CBD5E1', position: 'sticky', top: 0, zIndex: 10 }}>
              <Box sx={{ width: 120, minWidth: 120, bgcolor: '#F1F5F9', borderRight: '1px solid #94A3B8' }} />
              {HOURS.map(hour => (
                <Box key={hour} sx={{ 
                  width: cellWidth, minWidth: cellWidth, 
                  textAlign: 'center', py: 1, borderRight: '1px solid #CBD5E1'
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569' }}>{hour}:00</Typography>
                </Box>
              ))}
            </Box>

            {/* Grid Body */}
            {isLoadingSlots ? (
              <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
            ) : (
              venue.courts?.map((court: any) => (
                <Box key={court.id} sx={{ display: 'flex', borderBottom: '1px solid #F1F5F9' }}>
                  {/* Court Label */}
                  <Box sx={{ 
                    width: 120, minWidth: 120, bgcolor: 'white', 
                    display: 'flex', alignItems: 'center', px: 2,
                    borderRight: '1px solid #94A3B8', position: 'sticky', left: 0, zIndex: 5
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 900 }}>{court.name}</Typography>
                  </Box>
                  
                  {/* Slots Cells */}
                  {HOURS.map(hour => {
                    const slot = gridData[court.id]?.[hour];
                    const isBooked = slot?.status === 'booked';
                    const isMaintenance = slot?.status === 'maintenance';
                    const isSelected = selectedSlotIds.includes(slot?.id);
                    const isPast = isToday && hour <= dayjs().hour();
                    const isAvailable = slot?.status === 'available' && !isPast;
                    
                    let bgcolor = 'white';
                    if (isMaintenance) bgcolor = '#F472B6';
                    if (isPast) bgcolor = '#E2E8F0';
                    if (isBooked) bgcolor = '#EF4444'; // Red takes priority
                    if (isSelected) bgcolor = '#0EA5E9'; // Blue takes priority over red
                    
                    return (
                      <Tooltip key={`${court.id}-${hour}`} title={slot ? `${slot.start_time} - ${slot.end_time} | ${new Intl.NumberFormat('vi-VN').format(slot.price)}đ` : ''}>
                        <Box 
                          onClick={() => isAvailable && handleToggleSlot(slot.id)}
                          sx={{ 
                            width: cellWidth, minWidth: cellWidth, height: 60,
                            borderRight: '1px solid #CBD5E1',
                            bgcolor,
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            '&:hover': isAvailable ? { bgcolor: '#E0F2FE', opacity: 0.8 } : {},
                            transition: 'all 0.1s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isSelected ? 'white' : 'inherit'
                          }}
                        >
                           {isSelected && <CheckCircle sx={{ fontSize: '1.2rem' }} />}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              ))
            )}
          </Paper>
        </Box>

        {/* Floating Selection Bar */}
        {selectedSlotIds.length > 0 && (
          <Paper elevation={10} sx={{ 
            position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', 
            zIndex: 1000, p: 2, borderRadius: 2.5, width: '90%', maxWidth: 700,
            border: '2px solid #0EA5E9',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
             <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0EA5E9' }}>
                   ĐÃ CHỌN {selectedSlotIds.length} KHUNG GIỜ
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                   {new Intl.NumberFormat('vi-VN').format(totalPrice)}đ
                </Typography>
             </Stack>
             <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="text" onClick={() => setSelectedSlotIds([])} sx={{ fontWeight: 700, color: 'text.secondary' }}>Xóa hết</Button>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => setIsConfirmOpen(true)}
                  sx={{ py: 1.5, px: 4, borderRadius: 1.5, fontWeight: 900, boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.39)' }}
                >
                  TIẾP TỤC
                </Button>
             </Stack>
          </Paper>
        )}

        {/* Zoom Slider */}
        <Box sx={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 100, height: 200, bgcolor: 'white', py: 2, px: 1, borderRadius: 5, boxShadow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <Typography variant="caption" sx={{ fontWeight: 900, mb: 1 }}>SIZE</Typography>
           <Slider
            orientation="vertical"
            value={zoom}
            onChange={(_: Event, val: number | number[]) => setZoom(val as number)}
            min={80}
            max={200}
            size="small"
          />
        </Box>

        {/* Booking Confirm Dialog */}
        <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
          <DialogTitle sx={{ fontWeight: 900, fontFamily: 'Times New Roman', py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
             <CalendarMonth color="primary" /> Bước cuối: Xác nhận đặt sân
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ py: 2 }}>
              <Box sx={{ bgcolor: '#F0F9FF', p: 2.5, borderRadius: 1.5, border: '1px solid #BAE6FD' }}>
                <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 800, textTransform: 'uppercase' }}>Danh sách khung giờ</Typography>
                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  {selectedSlots.map((s: any) => (
                    <Box key={s.id} sx={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #E2E8F0'
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {s.court?.name || 'Sân ' + s.court_id}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>
                        {new Intl.NumberFormat('vi-VN').format(s.price)}đ
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1, borderColor: '#BAE6FD', borderStyle: 'dashed' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 900 }}>Tổng tiền:</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      {new Intl.NumberFormat('vi-VN').format(totalPrice)}đ
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Chọn phương thức thanh toán:</Typography>
                <RadioGroup 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}
                >
                   <Paper variant="outlined" sx={{ 
                     p: 2, borderRadius: 1.5, 
                     border: paymentMethod === 'vnpay' ? '2px solid #0EA5E9' : '1px solid #E2E8F0',
                     cursor: 'pointer',
                     bgcolor: paymentMethod === 'vnpay' ? '#F0F9FF' : 'white'
                   }} onClick={() => setPaymentMethod('vnpay')}>
                      <FormControlLabel value="vnpay" control={<Radio sx={{ display: 'none' }} />} label={
                        <Stack direction="row" spacing={1} alignItems="center">
                           <Payments color="primary" />
                           <Box>
                             <Typography variant="body2" sx={{ fontWeight: 800 }}>VNPay Online</Typography>
                             <Typography variant="caption" color="text.secondary">Visa, Mastercard, QR</Typography>
                           </Box>
                        </Stack>
                      } />
                   </Paper>
                   
                   <Paper variant="outlined" sx={{ 
                     p: 2, borderRadius: 1.5, 
                     border: paymentMethod === 'cash' ? '2px solid #0EA5E9' : '1px solid #E2E8F0',
                     cursor: 'pointer',
                     bgcolor: paymentMethod === 'cash' ? '#F0F9FF' : 'white'
                   }} onClick={() => setPaymentMethod('cash')}>
                      <FormControlLabel value="cash" control={<Radio sx={{ display: 'none' }} />} label={
                        <Stack direction="row" spacing={1} alignItems="center">
                           <AccountBalanceWallet color="primary" />
                           <Box>
                             <Typography variant="body2" sx={{ fontWeight: 800 }}>Tiền mặt / CK</Typography>
                             <Typography variant="caption" color="text.secondary">Thanh toán tại quầy</Typography>
                           </Box>
                        </Stack>
                      } />
                   </Paper>
                </RadioGroup>
              </Box>

              <TextField 
                label="Ghi chú thêm" 
                fullWidth multiline rows={2} 
                value={notes}
                placeholder="Ví dụ: Cần mượn thêm vợt, nước..."
                onChange={(e) => setNotes(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button onClick={() => setIsConfirmOpen(false)} sx={{ fontWeight: 700 }}>Quay lại</Button>
            <Button 
              variant="contained" 
              onClick={handleBooking}
              disabled={createMutation.isPending}
              startIcon={createMutation.isPending ? <CircularProgress size={20} /> : <CheckCircle />}
              sx={{ borderRadius: 1.5, py: 1.2, px: 4, fontWeight: 900 }}
            >
              {paymentMethod === 'vnpay' ? 'THANH TOÁN NGAY' : 'XÁC NHẬN ĐẶT'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default BookingPage;
