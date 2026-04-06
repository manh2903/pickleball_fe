import { useState } from 'react';
import { 
  Box, Card, Typography, TextField, Button, 
  Stack, CircularProgress, Divider, Paper
} from '@mui/material';
import { 
  QrCodeScanner, Search, CheckCircle, 
  AccessTime, DirectionsRun, Phone
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { ownerApi } from '@/api/ownerApi';
import { incidentApi } from '@/api/incidentApi';
import { useOutletContext } from 'react-router-dom';
import { 
  Dialog, DialogTitle, DialogContent, MenuItem, 
  DialogActions, Alert
} from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

const OwnerCheckin = () => {
  const [bookingCode, setBookingCode] = useState('');
  const [checkInData, setCheckInData] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();

  const { venueId } = useOutletContext<{ venueId: string | number }>();

  // Incident state
  const [openIncident, setOpenIncident] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState('medium');
  const [incidentCourt, setIncidentCourt] = useState('');

  const { data: courtsRes } = useQuery({ 
    queryKey: ['venue-courts', venueId], 
    queryFn: () => ownerApi.getCourts(venueId),
    enabled: !!venueId
  });
  const courts = courtsRes?.data || [];

  const incidentMutation = useMutation({
    mutationFn: (data: any) => incidentApi.createIncident(data),
    onSuccess: () => {
      enqueueSnackbar('Đã gửi báo cáo sự cố cho chủ sân', { variant: 'info' });
      setOpenIncident(false);
      setIncidentTitle('');
      setIncidentDesc('');
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi gửi báo cáo', { variant: 'error' })
  });

  const handleReportIncident = () => {
    incidentMutation.mutate({
      venue_id: venueId,
      court_id: incidentCourt || null,
      title: incidentTitle,
      description: incidentDesc,
      severity: incidentSeverity
    });
  };

  const checkInMutation = useMutation({
    mutationFn: (code: string) => ownerApi.checkIn(code),
    onSuccess: (res: any) => {
      setCheckInData(res.data);
      enqueueSnackbar('Check-in thành công! 🎉', { variant: 'success' });
      setBookingCode('');
    },
    onError: (err: any) => {
      enqueueSnackbar(err.message || 'Hủy thất bại', { variant: 'error' });
      setCheckInData(null);
    }
  });

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode) return;
    checkInMutation.mutate(bookingCode);
  };

  return (
    <Box maxWidth="sm" sx={{ mx: 'auto', pt: 4 }}>
      <Card sx={{ p: 5, borderRadius: 1.5, textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <QrCodeScanner sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Times New Roman' }}>
          Quầy Check-in 🏓
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Nhập mã đặt sân hoặc mã QR thủ công để xác nhận khách ra sân.
        </Typography>

        <Box component="form" onSubmit={handleCheckIn} sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <TextField 
              fullWidth 
              label="Mã đặt sân (VD: PB12345678)"
              variant="outlined"
              placeholder="Vui lòng nhập chính xác..."
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
            />
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              type="submit"
              disabled={checkInMutation.isPending}
              startIcon={checkInMutation.isPending ? <CircularProgress size={20} /> : <Search />}
              sx={{ py: 1.5, borderRadius: 1 }}
            >
              Tìm kiếm & Xác nhận
            </Button>
          </Stack>
        </Box>

        {checkInData && (
          <Paper sx={{ p: 4, bgcolor: '#F0FDF4', border: '1px solid', borderColor: 'success.light', borderRadius: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <CheckCircle sx={{ color: 'success.main', fontSize: 40, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.dark' }}>Check-in Thành công!</Typography>
            </Box>
            
            <Stack spacing={2} sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DirectionsRun sx={{ mr: 1.5, color: 'primary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Khách hàng & Sân</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{checkInData.user?.name} - {checkInData.court?.name}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime sx={{ mr: 1.5, color: 'primary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Suất chơi</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {new Date(checkInData.slot?.date).toLocaleDateString('vi-VN')} | {checkInData.slot?.start_time.slice(0, 5)} - {checkInData.slot?.end_time.slice(0, 5)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1.5, color: 'primary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">SĐT liên hệ</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{checkInData.user?.phone || 'N/A'}</Typography>
                </Box>
              </Box>
            </Stack>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: checkInData.payment_status === 'paid' ? 'success.main' : 'error.main' }}>
              Trạng thái thanh toán: {checkInData.payment_status === 'paid' ? 'Đã thanh toán ✅' : 'CHƯA THANH TOÁN ❌'}
            </Typography>
          </Paper>
        )}

        <Box sx={{ mt: 5 }}>
          <Divider sx={{ mb: 3 }}>HOẶC</Divider>
          <Button 
            variant="outlined" 
            color="error" 
            fullWidth 
            startIcon={<ErrorOutline />} 
            onClick={() => setOpenIncident(true)}
            sx={{ borderStyle: 'dashed', py: 1.2 }}
          >
            BÁO CÁO SỰ CỐ / HỎNG HÓC 🛠️
          </Button>
        </Box>
      </Card>

      {/* Incident Dialog */}
      <Dialog open={openIncident} onClose={() => setOpenIncident(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Báo cáo sự cố vận hành</DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 3 }}>Thông tin sẽ được gửi trực tiếp đến chủ sân để xử lý.</Alert>
          <Stack spacing={2.5}>
            <TextField 
              fullWidth label="Tiêu đề sự cố" 
              placeholder="VD: Hỏng đèn sân 2, Rách lưới..." 
              value={incidentTitle}
              onChange={(e) => setIncidentTitle(e.target.value)}
            />
            <TextField 
              select fullWidth label="Sân xảy ra sự cố" 
              value={incidentCourt}
              onChange={(e) => setIncidentCourt(e.target.value)}
            >
              <MenuItem value="">Toàn cơ sở</MenuItem>
              {courts.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField 
              select fullWidth label="Mức độ nghiêm trọng" 
              value={incidentSeverity}
              onChange={(e) => setIncidentSeverity(e.target.value)}
            >
              <MenuItem value="low">Thấp (Cần lưu ý)</MenuItem>
              <MenuItem value="medium">Trung bình (Cần sửa sớm)</MenuItem>
              <MenuItem value="high">Cao (Cần xử lý ngay)</MenuItem>
            </TextField>
            <TextField 
              fullWidth multiline rows={3} label="Mô tả chi tiết" 
              placeholder="Vui lòng mô tả rõ tình trạng..." 
              value={incidentDesc}
              onChange={(e) => setIncidentDesc(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenIncident(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleReportIncident}
            disabled={!incidentTitle || !incidentDesc || incidentMutation.isPending}
          >
            Gửi báo cáo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>

  );
};

export default OwnerCheckin;
