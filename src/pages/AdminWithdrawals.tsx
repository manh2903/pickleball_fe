import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip, 
  IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress,
  Tooltip, Alert, Stack, Divider
} from '@mui/material';
import { 
  Visibility,
  Close, DoneAll, Block
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { withdrawalApi } from '@/api/withdrawalApi';
import { useSnackbar } from 'notistack';
import { socketService } from '@/utils/socket';
import { useAuthStore } from '@/stores/authStore';

const AdminWithdrawals = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [transRef, setTransRef] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthStore();

  // Join admin-room & listen for real-time withdrawal events
  useEffect(() => {
    socketService.joinAdmin();

    const handleNotification = (notif: any) => {
      if (notif?.type === 'withdrawal_requested') {
        queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
        enqueueSnackbar(
          `💸 Yêu cầu rút tiền mới: ${notif.body}`,
          { variant: 'info', autoHideDuration: 6000 }
        );
      }
    };

    // Also listen for the dedicated direct event (instant refresh without needing notification bell)
    const handleDirectWithdrawal = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      enqueueSnackbar(
        `💸 Chủ sân ${data.owner_name} vừa yêu cầu rút ${new Intl.NumberFormat('vi-VN').format(data.amount)}đ`,
        { variant: 'info', autoHideDuration: 6000 }
      );
    };

    socketService.socket?.on('new-notification', handleNotification);
    socketService.socket?.on('withdrawal-new-request', handleDirectWithdrawal);

    return () => {
      socketService.socket?.off('new-notification', handleNotification);
      socketService.socket?.off('withdrawal-new-request', handleDirectWithdrawal);
    };
  }, [queryClient]);

  const { data: requestsRes, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: () => withdrawalApi.getAllRequests(),
  });

  const requests = requestsRes?.data?.requests || [];

  const updateMutation = useMutation({
    mutationFn: (data: any) => withdrawalApi.updateStatus(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      enqueueSnackbar('Cập nhật trạng thái thanh toán thành công', { variant: 'success' });
      setOpenDetail(false);
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi xử lý yêu cầu', { variant: 'error' })
  });

  const handleOpenDetail = (req: any) => {
    setSelectedRequest(req);
    setTransRef(req.transaction_ref || '');
    setRejectReason(req.reject_reason || '');
    setAdminNote(req.note || '');
    setOpenDetail(true);
  };

  const handleProcess = (status: string) => {
    updateMutation.mutate({
      id: selectedRequest.id,
      payload: { 
        status, 
        transaction_ref: transRef,
        reject_reason: rejectReason,
        note: adminNote
      }
    });
  };

  const statusColors: any = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    rejected: 'error'
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>
          Quản lý Rút tiền & Tài chính 💸
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 1.5 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Chủ sân</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Số tiền</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngân hàng nhận</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày yêu cầu</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req: any) => (
              <TableRow key={req.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{req.owner?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{req.owner?.phone}</Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {new Intl.NumberFormat('vi-VN').format(req.amount)}đ
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.bank_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{req.bank_account}</Typography>
                </TableCell>
                <TableCell>{new Date(req.created_at).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>
                  <Chip 
                    label={req.status} 
                    color={statusColors[req.status]} 
                    size="small" 
                    sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }} 
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Xem chi tiết & Xử lý">
                    <IconButton size="small" color="primary" onClick={() => handleOpenDetail(req)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">Chưa có yêu cầu rút tiền nào cần xử lý.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Admin Action Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>Chi tiết yêu cầu thanh toán</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>CHỦ SÂN YÊU CẦU:</Typography>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 900, mb: 2 }}>
              {new Intl.NumberFormat('vi-VN').format(selectedRequest?.amount || 0)}đ
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Tên ngân hàng:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedRequest?.bank_name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Số tài khoản:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedRequest?.bank_account}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Chủ tài khoản:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedRequest?.bank_account_name}</Typography>
              </Box>
            </Stack>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>XỬ LÝ THANH TOÁN (ADMIN):</Typography>
          <Stack spacing={2.5}>
            <TextField 
              fullWidth label="Mã giao dịch ngân hàng" 
              placeholder="VD: TRF123456789 (Nếu đã chuyển tiền)" 
              value={transRef}
              onChange={(e) => setTransRef(e.target.value)}
            />
            <TextField 
              fullWidth label="Lý do từ chối (Nếu Reject)" 
              disabled={transRef !== ''}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <TextField 
              fullWidth multiline rows={2} label="Ghi chú nội bộ" 
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
          </Stack>
          
          {selectedRequest?.status === 'completed' && (
            <Alert severity="success" sx={{ mt: 3 }}>Yêu cầu đã được hoàn thành vào lúc {new Date(selectedRequest.processed_at).toLocaleString('vi-VN')}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setOpenDetail(false)} startIcon={<Close />}>Đóng</Button>
          {selectedRequest?.status !== 'completed' && selectedRequest?.status !== 'rejected' && (
            <>
              <Button color="error" startIcon={<Block />} onClick={() => handleProcess('rejected')}>Từ chối</Button>
              <Button variant="contained" color="info" onClick={() => handleProcess('processing')}>Đang xử lý</Button>
              <Button variant="contained" color="success" startIcon={<DoneAll />} onClick={() => handleProcess('completed')}>Hoàn tất chuyển tiền</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminWithdrawals;
