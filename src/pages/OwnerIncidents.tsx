import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip, 
  IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  Visibility, CheckCircle, Info, ReportProblem, 
  Close, ErrorOutline
} from '@mui/icons-material';
import { useState } from 'react';
import { incidentApi } from '@/api/incidentApi';
import { useOutletContext } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const OwnerIncidents = () => {
  const { venueId } = useOutletContext<{ venueId: string | number }>();
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: incidentsRes, isLoading } = useQuery({
    queryKey: ['venue-incidents', venueId],
    queryFn: () => incidentApi.getVenueIncidents(venueId),
    enabled: !!venueId,
  });

  const incidents = incidentsRes?.data?.incidents || [];

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; status: string; notes: string }) => 
      incidentApi.updateStatus(data.id, { status: data.status, resolution_notes: data.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-incidents', venueId] });
      enqueueSnackbar('Cập nhật sự cố thành công', { variant: 'success' });
      setOpenDetail(false);
    }
  });

  const handleOpenDetail = (incident: any) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status);
    setResolutionNotes(incident.resolution_notes || '');
    setOpenDetail(true);
  };

  const statusColors: any = {
    open: 'error',
    in_progress: 'warning',
    resolved: 'success',
    closed: 'default'
  };

  const statusLabels: any = {
    open: 'Mới mở',
    in_progress: 'Đang sửa',
    resolved: 'Đã xong',
    closed: 'Đã đóng'
  };

  const severityIcons: any = {
    low: <Info color="info" fontSize="small" />,
    medium: <ReportProblem color="warning" fontSize="small" />,
    high: <ErrorOutline color="error" fontSize="small" />
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>
          Quản lý Sự cố & Bảo trì 🛠️
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sân</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mức độ</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày báo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Người báo</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((incident: any) => (
              <TableRow key={incident.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{incident.title}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 200 }}>
                    {incident.description}
                  </Typography>
                </TableCell>
                <TableCell>{incident.court?.name || 'Toàn cơ sở'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {severityIcons[incident.severity]}
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{incident.severity}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={statusLabels[incident.status]} 
                    color={statusColors[incident.status]} 
                    size="small" 
                    sx={{ fontWeight: 800, borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>{new Date(incident.created_at).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>{incident.reporter?.name}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Xem chi tiết & Xử lý">
                    <IconButton size="small" color="primary" onClick={() => handleOpenDetail(incident)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {incidents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">Hiện không có báo cáo sự cố nào.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Incident Detail / Action Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>
          Chi tiết báo cáo: {selectedIncident?.title}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Mô tả sự cố:</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
              {selectedIncident?.description}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Người báo:</Typography>
              <Typography variant="body2">{selectedIncident?.reporter?.name}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Ngày báo:</Typography>
              <Typography variant="body2">{selectedIncident && new Date(selectedIncident.created_at).toLocaleString('vi-VN')}</Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Cập nhật trạng thái xử lý:</Typography>
            <TextField
              select
              fullWidth
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="open">Mới mở (Open)</MenuItem>
              <MenuItem value="in_progress">Đang sửa chữa (In Progress)</MenuItem>
              <MenuItem value="resolved">Đã khắc phục (Resolved)</MenuItem>
              <MenuItem value="closed">Đóng báo cáo (Closed)</MenuItem>
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Ghi chú xử lý / Kết quả"
              placeholder="VD: Đã gọi thợ sửa đèn LED, dự kiến xong trong chiều nay..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setOpenDetail(false)} startIcon={<Close />}>Bỏ qua</Button>
          <Button 
            variant="contained" 
            startIcon={<CheckCircle />}
            onClick={() => updateMutation.mutate({ id: selectedIncident.id, status: newStatus, notes: resolutionNotes })}
            disabled={updateMutation.isPending}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OwnerIncidents;
