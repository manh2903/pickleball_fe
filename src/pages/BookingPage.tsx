import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Button, IconButton, Slider,
  CircularProgress, Alert, Stack, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Tooltip,
  Paper, Divider
} from '@mui/material';
import { 
  ArrowBack, CheckCircle, Payments,
  CalendarMonth, Info, Person, Phone, Email,
  AccountBalanceWallet, Lock, ConfirmationNumber
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { venueApi } from '@/api/venueApi';
import { bookingApi } from '@/api/bookingApi';
import { couponApi } from '@/api/couponApi';
import { useAuthStore } from '@/stores/authStore';
import { socketService } from '@/utils/socket';

const BookingPage = () => {
  const { venueSlug } = useParams<{ venueSlug: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  // Auto scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [zoom, setZoom] = useState(100);
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'wallet'>('vnpay');

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    setCouponError('');
    setIsValidatingCoupon(true);
    try {
      const res = await couponApi.validateCoupon({
        code: couponCode.trim(),
        venue_id: venue.id,
        total_amount: totalPrice
      });
      if (res.data) {
        setAppliedCoupon(res.data);
        enqueueSnackbar('Áp dụng mã giảm giá thành công!', { variant: 'success' });
      } else {
        setCouponError('Mã giảm giá không hợp lệ');
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || err.message || 'Mã giảm giá không hợp lệ');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    handleRemoveCoupon();
  };

  // Reset coupon if selected slot IDs change
  useEffect(() => {
    handleRemoveCoupon();
  }, [selectedSlotIds]);

  // Customer info state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Pre-fill if logged in + default wallet if sufficient
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [isAuthenticated, user]);

  // 1. Fetch Venue
  const { data: venueRes, isLoading: isLoadingVenue } = useQuery({
    queryKey: ['venue-booking', venueSlug],
    queryFn: () => venueApi.getVenueById(venueSlug!),
  });
  const venue = venueRes?.data;

  // 2. Fetch All Court Availability
  const { data: slotsRes, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['venue-slots', venueSlug, selectedDate.format('YYYY-MM-DD')],
    queryFn: () => bookingApi.getAvailability({ venue_id: venueSlug, date: selectedDate.format('YYYY-MM-DD') }),
    enabled: !!venueSlug,
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

    socketService.onSlotsUpdated((data: { ids: number[], status: string, userId?: number }) => {
      console.log('📢 Real-time update:', data);
      
      // Ignore own update
      if (data.userId === user?.id) return;
      
      // Notify if conflict with selected slots
      const conflict = selectedSlotIds.filter(id => data.ids.includes(id));
      if (conflict.length > 0 && data.status === 'booked') {
        enqueueSnackbar('Một số giờ bạn chọn vừa được người khác đặt!', { variant: 'warning' });
        setSelectedSlotIds(prev => prev.filter(id => !data.ids.includes(id)));
      }

      // Refresh availability data
      queryClient.invalidateQueries({ queryKey: ['venue-slots', venueSlug] });
    });

    return () => {
      socketService.disconnect();
    };
  }, [venue?.courts, selectedSlotIds, venueSlug, queryClient, enqueueSnackbar, user?.id]);

  // Group slots by court and start_time
  const gridData = useMemo(() => {
    const data: any = {};
    slots.forEach((slot: any) => {
      if (!data[slot.court_id]) data[slot.court_id] = {};
      const h = parseInt(slot.start_time.split(':')[0]);
      data[slot.court_id][h] = slot;
    });
    return data;
  }, [slots]);

  // Dynamically calculate hours from slots
  const dynamicHours = useMemo(() => {
    const hoursSet = new Set<number>();
    slots.forEach((slot: any) => {
      const h = parseInt(slot.start_time.split(':')[0]);
      hoursSet.add(h);
    });
    return Array.from(hoursSet).sort((a, b) => a - b);
  }, [slots]);

  const selectedSlots = useMemo(() => {
    return slots.filter((s: any) => selectedSlotIds.includes(s.id));
  }, [slots, selectedSlotIds]);

  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum: number, s: any) => sum + parseFloat(s.price), 0);
  }, [selectedSlots]);

  const createMutation = useMutation({
    mutationFn: (payload: any) => bookingApi.createBooking(payload),
    onSuccess: (res: any) => {
      enqueueSnackbar('Đặt sân thành công! 🎉', { variant: 'success' });
      setIsConfirmOpen(false);
      handleRemoveCoupon();
      if (res.data?.paymentUrl || res.paymentUrl) {
        window.location.href = res.data?.paymentUrl || res.paymentUrl;
      } else {
        navigate(`/my-bookings`);
      }
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.message || err.message || 'Đặt sân thất bại', { variant: 'error' })
  });

  const handleToggleSlot = (id: number) => {
    setSelectedSlotIds(prev => {
      if (prev.includes(id)) return prev.filter(sid => sid !== id);
      return [...prev, id];
    });
  };

  const handleBooking = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      enqueueSnackbar('Vui lòng điền đầy đủ thông tin khách hàng', { variant: 'error' });
      return;
    }

    const { name, phone, email } = customerInfo;

    createMutation.mutate({ 
      slot_ids: selectedSlotIds, 
      notes, 
      payment_method: paymentMethod,
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      coupon_code: appliedCoupon ? appliedCoupon.code : undefined
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
             <Box sx={{ width: 14, height: 14, bgcolor: '#F472B6', borderRadius: '3px' }} />
             <Typography variant="caption" sx={{ fontWeight: 800 }}>Bảo trì</Typography>
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
            minWidth: (cellWidth * dynamicHours.length) + 120, 
            borderRadius: 1.5, 
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            {/* Hour Header */}
            <Box sx={{ display: 'flex', bgcolor: '#F1F5F9', borderBottom: '1px solid #CBD5E1', position: 'sticky', top: 0, zIndex: 10 }}>
              <Box sx={{ width: 120, minWidth: 120, bgcolor: '#F1F5F9', borderRight: '1px solid #94A3B8' }} />
              {dynamicHours.map(hour => (
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
                    <Typography variant="caption" sx={{ fontWeight: 900 }}>{court.name} <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary', display: 'block' }}>{court.type}</Typography></Typography>
                  </Box>
                  
                  {/* Slots Cells */}
                  {dynamicHours.map(hour => {
                    const slot = gridData[court.id]?.[hour];
                    const isBooked = slot?.status === 'booked';
                    const isMaintenance = slot?.status === 'maintenance';
                    const isSelected = selectedSlotIds.includes(slot?.id);
                    const isPast = isToday && hour <= dayjs().hour();
                    const isAvailable = slot?.status === 'available' && !isPast;
                    
                    let bgcolor = 'white';
                    if (isMaintenance) bgcolor = '#F472B6';
                    else if (isPast) bgcolor = '#E2E8F0';
                    else if (isBooked) bgcolor = '#EF4444'; // Red takes priority
                    
                    if (isSelected) bgcolor = '#0EA5E9'; // Blue takes priority over red
                    
                    return (
                      <Tooltip key={`${court.id}-${hour}`} title={slot ? `${slot.start_time} - ${slot.end_time} | ${new Intl.NumberFormat('vi-VN').format(slot.price)}đ` : ''}>
                        <Box 
                          onClick={() => (isAvailable && !isMaintenance) && slot && handleToggleSlot(slot.id)}
                          sx={{ 
                            width: cellWidth, minWidth: cellWidth, height: 60,
                            borderRight: '1px solid #CBD5E1',
                            bgcolor,
                            cursor: (isAvailable && !isMaintenance) ? 'pointer' : 'not-allowed',
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
                  sx={{ py: 1.5, px: 4, borderRadius: 1.5, fontWeight: 900 }}
                >
                   ĐẶT LỊCH NGAY
                </Button>
             </Stack>
          </Paper>
        )}

        <Box sx={{ position: 'fixed', bottom: 40, right: 40, zIndex: 100 }}>
           <Paper sx={{ p: 1, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, ml: 1 }}>Thu phóng:</Typography>
              <Slider 
                value={zoom} min={50} max={200} step={10} 
                onChange={(_, v) => setZoom(v as number)}
                sx={{ width: 100, mx: 1 }} 
              />
           </Paper>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog 
          open={isConfirmOpen} onClose={handleCloseConfirm} 
          maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ bgcolor: '#0EA5E9', color: 'white', py: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
               <Payments />
               <Typography variant="h6" sx={{ fontWeight: 900 }}>XÁC NHẬN ĐẶT LỊCH</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={3} sx={{ mt: 2 }}>
               <Box sx={{ p: 2.5, bgcolor: '#F0F9FF', borderRadius: 2.5, border: '1px solid #BAE6FD' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 1 }}>
                   <CalendarMonth fontSize="small" /> CHI TIẾT LỊCH CHƠI
                </Typography>
                <Stack spacing={1}>
                  {selectedSlots.map((s: any) => (
                    <Box key={s.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.court?.name} ({s.start_time.slice(0,5)} - {s.end_time.slice(0,5)})</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Intl.NumberFormat('vi-VN').format(s.price)}đ</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1, borderColor: '#BAE6FD', borderStyle: 'dashed' }} />
                  
                  {appliedCoupon && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tạm tính:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          {new Intl.NumberFormat('vi-VN').format(totalPrice)}đ
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>Khuyến mãi ({appliedCoupon.code}):</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                          -{new Intl.NumberFormat('vi-VN').format(appliedCoupon.discount_amount)}đ
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 900 }}>Tổng thanh toán:</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      {new Intl.NumberFormat('vi-VN').format(appliedCoupon ? appliedCoupon.final_amount : totalPrice)}đ
                    </Typography>
                  </Box>
                </Stack>
               </Box>

               <Box>
                 <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                   <Person fontSize="small" color="primary" /> THÔNG TIN NGƯỜI ĐẶT <Typography variant="caption" color="error" sx={{ fontWeight: 900 }}>(BẮT BUỘC)</Typography>
                 </Typography>
                 <Stack spacing={2}>
                    <TextField 
                      label="Họ và tên" placeholder="Nhập tên người chơi..."
                      fullWidth value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      InputProps={{ startAdornment: <Person sx={{ color: 'action.active', mr: 1 }} />, sx: { borderRadius: 1.5 } }}
                    />
                    <Stack direction="row" spacing={2}>
                      <TextField 
                        label="Số điện thoại" placeholder="0xxx..."
                        fullWidth value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        InputProps={{ startAdornment: <Phone sx={{ color: 'action.active', mr: 1 }} />, sx: { borderRadius: 1.5 } }}
                      />
                      <TextField 
                        label="Email" placeholder="example@gmail.com"
                        fullWidth value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        InputProps={{ startAdornment: <Email sx={{ color: 'action.active', mr: 1 }} />, sx: { borderRadius: 1.5 } }}
                      />
                    </Stack>
                 </Stack>
               </Box>

               {/* Coupon Section */}
               <Box>
                 <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ConfirmationNumber fontSize="small" color="primary" /> MÃ GIẢM GIÁ
                 </Typography>
                 <Stack direction="row" spacing={1} alignItems="flex-start">
                    <TextField 
                      label="Mã giảm giá" 
                      placeholder="Nhập mã giảm giá..."
                      size="small"
                      fullWidth 
                      value={couponCode}
                      disabled={!!appliedCoupon || isValidatingCoupon}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      error={!!couponError}
                      helperText={couponError}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                    {appliedCoupon ? (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={handleRemoveCoupon}
                        sx={{ borderRadius: 1.5, px: 3, height: '40px', minWidth: 100, whiteSpace: 'nowrap' }}
                      >
                        Hủy
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        sx={{ borderRadius: 1.5, px: 3, height: '40px', minWidth: 100, whiteSpace: 'nowrap' }}
                      >
                        {isValidatingCoupon ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Áp dụng'}
                      </Button>
                    )}
                 </Stack>
               </Box>

               <Box>
                 <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>PHƯƠNG THỨC THANH TOÁN:</Typography>
                 <Stack spacing={1.5}>

                   {/* Ví tiền */}
                   {(() => {
                     const walletBal = parseFloat(String(user?.wallet_balance || 0));
                     const finalPrice = appliedCoupon ? appliedCoupon.final_amount : totalPrice;
                     const canUseWallet = walletBal >= finalPrice;
                     return (
                       <Paper
                         variant="outlined"
                         onClick={() => canUseWallet && setPaymentMethod('wallet')}
                         sx={{
                           p: 2, borderRadius: 1.5, cursor: canUseWallet ? 'pointer' : 'default',
                           border: paymentMethod === 'wallet' ? '2px solid #10B981' : '1px solid #E2E8F0',
                           bgcolor: paymentMethod === 'wallet' ? '#ECFDF5' : (canUseWallet ? 'white' : '#F8FAFC'),
                           opacity: canUseWallet ? 1 : 0.65,
                           transition: 'all 0.2s'
                         }}
                       >
                         <Stack direction="row" spacing={1.5} alignItems="center">
                           <AccountBalanceWallet sx={{ color: canUseWallet ? '#10B981' : '#94A3B8' }} />
                           <Box sx={{ flex: 1 }}>
                             <Stack direction="row" justifyContent="space-between" alignItems="center">
                               <Typography variant="body2" sx={{ fontWeight: 800 }}>Ví tiền</Typography>
                               <Typography variant="caption" sx={{ fontWeight: 900, color: canUseWallet ? '#10B981' : '#EF4444' }}>
                                 {new Intl.NumberFormat('vi-VN').format(walletBal)}đ
                               </Typography>
                             </Stack>
                             {canUseWallet ? (
                               <Typography variant="caption" color="text.secondary">
                                 Thanh toán ngay, không cần chuyển hướng.
                               </Typography>
                             ) : (
                               <Stack direction="row" spacing={0.5} alignItems="center">
                                 <Lock sx={{ fontSize: 11, color: '#EF4444' }} />
                                 <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                                   Không đủ số dư (thiếu {new Intl.NumberFormat('vi-VN').format(finalPrice - walletBal)}đ)
                                 </Typography>
                               </Stack>
                             )}
                           </Box>
                         </Stack>
                       </Paper>
                     );
                   })()}

                   {/* VNPay */}
                   <Paper
                     variant="outlined"
                     onClick={() => setPaymentMethod('vnpay')}
                     sx={{
                       p: 2, borderRadius: 1.5, cursor: 'pointer',
                       border: paymentMethod === 'vnpay' ? '2px solid #0EA5E9' : '1px solid #E2E8F0',
                       bgcolor: paymentMethod === 'vnpay' ? '#F0F9FF' : 'white',
                       transition: 'all 0.2s'
                     }}
                   >
                     <Stack direction="row" spacing={1.5} alignItems="center">
                       <Payments sx={{ color: '#0EA5E9' }} />
                       <Box>
                         <Typography variant="body2" sx={{ fontWeight: 800 }}>VNPay (Visa, Mastercard, QR)</Typography>
                         <Typography variant="caption" color="text.secondary">Chuyển đến trang thanh toán an toàn của VNPay.</Typography>
                       </Box>
                     </Stack>
                   </Paper>

                 </Stack>
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
            <Button onClick={handleCloseConfirm} sx={{ fontWeight: 700 }}>QUAY LẠI</Button>
            <Button 
              variant="contained"
              color={paymentMethod === 'wallet' ? 'success' : 'primary'}
              onClick={handleBooking}
              disabled={createMutation.isPending}
              startIcon={createMutation.isPending ? <CircularProgress size={20} /> : (paymentMethod === 'wallet' ? <AccountBalanceWallet /> : <CheckCircle />)}
              sx={{ borderRadius: 1.5, py: 1.2, px: 4, fontWeight: 900 }}
            >
              {paymentMethod === 'wallet' ? 'THANH TOÁN BẰNG VÍ' : 'THANH TOÁN VNPay'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default BookingPage;
