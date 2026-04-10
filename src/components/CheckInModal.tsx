import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, Typography, Stack, 
  CircularProgress, Divider, Paper
} from '@mui/material';
import { 
  QrCodeScanner, Search, CheckCircle, 
  AccessTime, DirectionsRun, Phone
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { ownerApi } from '@/api/ownerApi';

interface CheckInModalProps {
  open: boolean;
  onClose: () => void;
  initialCode?: string;
}

const CheckInModal = ({ open, onClose, initialCode }: CheckInModalProps) => {
  const [bookingCode, setBookingCode] = useState('');
  const [checkInData, setCheckInData] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialCode) {
      setBookingCode(initialCode);
    } else {
      setBookingCode('');
    }
    setCheckInData(null);
  }, [initialCode, open]);

  const checkInMutation = useMutation({
    mutationFn: (code: string) => ownerApi.checkIn(code),
    onSuccess: (res: any) => {
      setCheckInData(res.data);
      enqueueSnackbar('Check-in thành công! 🎉', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['owner-stats'] });
    },
    onError: (err: any) => {
      enqueueSnackbar(err.message || 'Check-in thất bại', { variant: 'error' });
      setCheckInData(null);
    }
  });

  const handleCheckIn = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!bookingCode) return;
    checkInMutation.mutate(bookingCode);
  };

  const resetAndClose = () => {
    setBookingCode('');
    setCheckInData(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ p: 4, pb: 2, textAlign: 'center' }}>
        <QrCodeScanner sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 950, fontFamily: 'Times New Roman' }}>
          Check-in Khách hàng 🏓
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleCheckIn} sx={{ mb: checkInData ? 4 : 0 }}>
          <Stack spacing={2}>
            <TextField 
              fullWidth 
              label="Mã đặt sân"
              variant="outlined"
              placeholder="VD: PB12345678"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              type="submit"
              disabled={checkInMutation.isPending || !bookingCode}
              startIcon={checkInMutation.isPending ? <CircularProgress size={20} /> : <Search />}
              sx={{ py: 1.5, borderRadius: 3, fontWeight: 900 }}
            >
              XÁC NHẬN CHECK-IN
            </Button>
          </Stack>
        </Box>

        {checkInData && (
          <Paper elevation={0} sx={{ p: 3, bgcolor: '#F0FDF4', border: '1px solid', borderColor: 'success.light', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle sx={{ color: 'success.main', fontSize: 24, mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.dark' }}>Thành công!</Typography>
            </Box>
            
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <DirectionsRun sx={{ mr: 1, mt: 0.3, fontSize: 18, color: 'primary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Khách hàng & Sân</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{checkInData.user?.name || checkInData.customer_name} - {checkInData.slots?.[0]?.court?.name}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <AccessTime sx={{ mr: 1, mt: 0.3, fontSize: 18, color: 'primary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Ngày & Giờ</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {checkInData.slots?.[0]?.date ? new Date(checkInData.slots[0].date).toLocaleDateString('vi-VN') : ''} | {checkInData.slots?.[0]?.start_time?.slice(0, 5)}
                  </Typography>
                </Box>
              </Box>
            </Stack>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'center', color: checkInData.payment_status === 'paid' ? 'success.main' : 'error.main' }}>
              {checkInData.payment_status === 'paid' ? 'ĐÃ THANH TOÁN ✅' : 'CHƯA THANH TOÁN ❌'}
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button fullWidth onClick={resetAndClose} variant="text" sx={{ fontWeight: 800 }}>ĐÓNG</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckInModal;
