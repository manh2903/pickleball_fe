import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Stack, MenuItem, Alert, 
  Typography, Box
} from '@mui/material';
import { Build } from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { incidentApi } from '@/api/incidentApi';
import { ownerApi } from '@/api/ownerApi';

interface IncidentReportModalProps {
  open: boolean;
  onClose: () => void;
  venueId: string | number;
  initialCourtId?: string | number;
  onSuccess?: () => void;
}

const IncidentReportModal = ({ open, onClose, venueId, initialCourtId, onSuccess }: IncidentReportModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [courtId, setCourtId] = useState<string | number>('');

  useEffect(() => {
    if (initialCourtId) {
      setCourtId(initialCourtId);
    } else {
      setCourtId('');
    }
  }, [initialCourtId, open]);

  // Fetch Courts for dropdown
  const { data: courtsRes } = useQuery({ 
    queryKey: ['venue-courts', venueId], 
    queryFn: () => ownerApi.getCourts(venueId),
    enabled: open && !!venueId
  });
  const courts = courtsRes?.data || [];

  const mutation = useMutation({
    mutationFn: (data: any) => incidentApi.createIncident(data),
    onSuccess: () => {
      enqueueSnackbar('Đã gửi báo cáo sự cố thành công', { variant: 'info' });
      if (onSuccess) onSuccess();
      resetAndClose();
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi gửi báo cáo', { variant: 'error' })
  });

  const handleSubmit = () => {
    mutation.mutate({
      venue_id: venueId,
      court_id: courtId || null,
      title,
      description,
      severity
    });
  };

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setCourtId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ p: 4, pb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
           <Build color="error" />
           <Typography variant="h5" sx={{ fontWeight: 950, fontFamily: 'Times New Roman' }}>Báo cáo Sự cố 🛠️</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
          Thông tin sự cố sẽ được gửi trực tiếp đến quản lý cơ sở.
        </Alert>
        
        <Stack spacing={2.5}>
          <TextField 
            fullWidth 
            label="Tiêu đề sự cố" 
            placeholder="VD: Hỏng đèn, Rách lưới, Mặt sân trơn..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          
          <TextField 
            select 
            fullWidth 
            label="Sân xảy ra sự cố" 
            value={courtId}
            onChange={(e) => setCourtId(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          >
            <MenuItem value="">Toàn cơ sở</MenuItem>
            {courts.map((c: any) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          <TextField 
            select 
            fullWidth 
            label="Mức độ nghiêm trọng" 
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          >
            <MenuItem value="low">Thấp (Cần lưu ý)</MenuItem>
            <MenuItem value="medium">Trung bình (Cần sửa sớm)</MenuItem>
            <MenuItem value="high">Cao (Cần xử lý ngay)</MenuItem>
          </TextField>

          <TextField 
            fullWidth 
            multiline 
            rows={4} 
            label="Mô tả chi tiết" 
            placeholder="Mô tả tình trạng chi tiết để bộ phận kỹ thuật nắm bắt..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 0 }}>
        <Button onClick={resetAndClose} sx={{ fontWeight: 800 }}>HỦY</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
          variant="contained" 
          color="error" 
          disableElevation
          onClick={handleSubmit}
          disabled={!title || !description || mutation.isPending}
          sx={{ px: 4, py: 1.2, borderRadius: 3, fontWeight: 900 }}
        >
          {mutation.isPending ? 'ĐANG GỬI...' : 'GỬI BÁO CÁO'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentReportModal;
