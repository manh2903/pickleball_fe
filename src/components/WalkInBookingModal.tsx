import { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Grid, Box, Typography, 
  Stack, Chip, CircularProgress, Alert,
  Divider
} from '@mui/material';
import { 
  Person, Phone, CalendarToday, AccessTime, 
  CheckCircle, SportsTennis
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '@/api/bookingApi';
import { ownerApi } from '@/api/ownerApi';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';

interface WalkInBookingModalProps {
  open: boolean;
  onClose: () => void;
  venueId: string | number;
}

const WalkInBookingModal = ({ open, onClose, venueId }: WalkInBookingModalProps) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCourtId, setSelectedCourtId] = useState<string | number>('');
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Khách vãng lai',
    phone: '',
    email: '',
  });

  // 1. Fetch Courts for this Venue
  const { data: courtsRes, isLoading: isCourtsLoading } = useQuery({
    queryKey: ['owner-courts', venueId],
    queryFn: () => ownerApi.getCourts(venueId),
    enabled: open && !!venueId,
  });
  const courts = courtsRes?.data || [];

  // 2. Fetch Availability for selected court and date
  const { data: slotsRes, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['availability', selectedCourtId, selectedDate],
    queryFn: () => bookingApi.getAvailability({ court_id: selectedCourtId, date: selectedDate }),
    enabled: !!selectedCourtId && !!selectedDate,
  });
  const availableSlots = slotsRes?.data?.slots || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => bookingApi.createWalkInBooking(data),
    onSuccess: () => {
      enqueueSnackbar('Tạo đơn đặt sân thành công!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['owner-stats'] });
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      resetAndClose();
    },
    onError: (err: any) => {
      enqueueSnackbar(err.message || 'Lỗi khi tạo đơn', { variant: 'error' });
    }
  });

  const resetAndClose = () => {
    setStep(1);
    setSelectedCourtId('');
    setSelectedSlotIds([]);
    setCustomerInfo({ name: 'Khách vãng lai', phone: '', email: '' });
    onClose();
  };

  const toggleSlot = (id: number) => {
    setSelectedSlotIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (selectedSlotIds.length === 0) {
      enqueueSnackbar('Vui lòng chọn khung giờ', { variant: 'warning' });
      return;
    }
    if (!customerInfo.phone) {
        enqueueSnackbar('Vui lòng nhập số điện thoại khách', { variant: 'warning' });
        return;
    }

    createMutation.mutate({
      slot_ids: selectedSlotIds,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_email: customerInfo.email,
      notes: 'Đặt trực tiếp tại quầy',
    });
  };

  const totalPrice = availableSlots
    .filter((s: any) => selectedSlotIds.includes(s.id))
    .reduce((sum: number, s: any) => sum + parseFloat(s.price), 0);

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="sm" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ p: 4, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SportsTennis color="primary" /> TẠO ĐƠN TRỰC TIẾP
        </Typography>
        <Typography variant="body2" color="text.secondary">Ghi nhận khách đặt sân tại quầy (Walk-in)</Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Divider sx={{ mb: 3 }} />
        
        {step === 1 ? (
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ngày đặt sân"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlotIds([]);
                  }}
                  InputProps={{ startAdornment: <CalendarToday sx={{ mr: 1, fontSize: 20, color: 'action.active' }} />, sx: { borderRadius: 3 } }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Chọn sân"
                  value={selectedCourtId}
                  onChange={(e) => {
                    setSelectedCourtId(e.target.value);
                    setSelectedSlotIds([]);
                  }}
                  SelectProps={{ native: true }}
                  InputProps={{ startAdornment: <SportsTennis sx={{ mr: 1, fontSize: 20, color: 'action.active' }} />, sx: { borderRadius: 3 } }}
                >
                  <option value="">-- Chọn sân --</option>
                  {courts.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {isSlotsLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={30} /></Box>
            ) : selectedCourtId ? (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Khung giờ còn trống:</Typography>
                
                {/* Status Legend */}
                <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 0.5 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Trống</Typography>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#0EA5E9', borderRadius: 0.5 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Chọn</Typography>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#EF4444', borderRadius: 0.5 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Đã đặt</Typography>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#F472B6', borderRadius: 0.5 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Bảo trì</Typography>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#E2E8F0', borderRadius: 0.5 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Đã qua</Typography>
                   </Box>
                </Stack>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableSlots.map((slot: any) => {
                    const isSelected = selectedSlotIds.includes(slot.id);
                    const isBooked = slot.status === 'booked';
                    const isMaintenance = slot.status === 'maintenance';
                    const isToday = dayjs(selectedDate).isSame(dayjs(), 'day');
                    const hour = parseInt(slot.start_time.split(':')[0]);
                    const isPast = isToday && hour <= dayjs().hour();
                    
                    const isAvailable = slot.status === 'available' && !isPast;
                    
                    return (
                      <Chip
                        key={slot.id}
                        label={`${slot.start_time.slice(0, 5)} - ${parseInt(slot.price).toLocaleString()}đ`}
                        onClick={() => isAvailable && toggleSlot(slot.id)}
                        disabled={!isAvailable || isBooked || isMaintenance}
                        icon={isSelected ? <CheckCircle sx={{ fontSize: '1rem', color: 'white !important' }} /> : undefined}
                        sx={{ 
                          borderRadius: 2, 
                          fontWeight: 800,
                          py: 2.2,
                          px: 1,
                          fontSize: '0.8rem',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          border: '1.5px solid',
                          transition: '0.2s',
                          // Color Logic matching BookingPage
                          borderColor: isSelected ? '#0EA5E9' : (isAvailable ? '#E2E8F0' : '#CBD5E1'),
                          bgcolor: isSelected ? '#0EA5E9' : (isPast ? '#E2E8F0' : (isBooked ? '#EF4444' : (isMaintenance ? '#F472B6' : 'white'))),
                          color: (isSelected || isBooked || isMaintenance) ? 'white' : (isAvailable ? '#1E293B' : '#94A3B8'),
                          
                          '&:hover': isAvailable && !isSelected ? { 
                            bgcolor: '#E0F2FE', 
                            borderColor: '#0EA5E9' 
                          } : {},
                          '&.Mui-disabled': {
                            bgcolor: isPast ? '#E2E8F0' : (isBooked ? '#EF4444' : (isMaintenance ? '#F472B6' : '#F1F5F9')),
                            color: (isBooked || isMaintenance) ? 'white' : '#94A3B8',
                            opacity: 1,
                            pointerEvents: 'none'
                          }
                        }}
                      />
                    );
                  })}
                  {availableSlots.length === 0 && <Alert severity="info" sx={{ width: '100%' }}>Sân này đã hết lịch trống hoặc chưa cấu hình.</Alert>}
                </Box>
              </Box>
            ) : (
              <Alert severity="warning">Vui lòng chọn sân để xem khung giờ trống.</Alert>
            )}
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0' }}>
               <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, display: 'block' }}>TỔNG QUAN LỊCH ĐẶT</Typography>
               <Typography variant="body2" sx={{ fontWeight: 600 }}>Cơ sở: {courts.find((c:any) => c.id === Number(selectedCourtId))?.name}</Typography>
               <Typography variant="body2" sx={{ fontWeight: 600 }}>Ngày: {format(new Date(selectedDate), 'dd/MM/yyyy')}</Typography>
               <Typography variant="body2" sx={{ fontWeight: 600 }}>Các khung giờ: {selectedSlotIds.length} Slot</Typography>
               <Divider sx={{ my: 1.5 }} />
               <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  Tổng cộng: {totalPrice.toLocaleString()}đ
               </Typography>
            </Box>

            <TextField
              fullWidth
              label="Tên khách hàng"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />, sx: { borderRadius: 3 } }}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              required
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />, sx: { borderRadius: 3 } }}
            />
            <TextField
              fullWidth
              label="Email (nếu có)"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              InputProps={{ startAdornment: <AccessTime sx={{ mr: 1, color: 'action.active' }} />, sx: { borderRadius: 3 } }}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 0 }}>
        <Button onClick={resetAndClose} variant="text" sx={{ fontWeight: 800 }}>HỦY</Button>
        <Box sx={{ flexGrow: 1 }} />
        {step === 1 ? (
          <Button 
            variant="contained" 
            disableElevation
            disabled={selectedSlotIds.length === 0}
            onClick={() => setStep(2)}
            endIcon={<ArrowForward />}
            sx={{ px: 4, py: 1, borderRadius: 3, fontWeight: 900 }}
          >
            TIẾP THEO
          </Button>
        ) : (
          <Button 
            variant="contained"
            color="success"
            disableElevation
            disabled={createMutation.isPending}
            onClick={handleCreate}
            startIcon={createMutation.isPending ? <CircularProgress size={16} /> : <CheckCircle />}
            sx={{ px: 4, py: 1, borderRadius: 3, fontWeight: 900 }}
          >
            XÁC NHẬN TẠO ĐƠN
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WalkInBookingModal;

import { ArrowForward } from '@mui/icons-material';
