import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Chip, 
  IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField,
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
import DataTable, { Column } from '@/components/DataTable';

const AdminWithdrawals = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [transRef, setTransRef] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const statusColors: any = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    rejected: 'error'
  };

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

  // Listen for real-time withdrawal events
  useEffect(() => {
    if (!socketService.socket) return;
    
    console.log('📡 AdminWithdrawals: Registering socket listeners...');

    const handleNotification = (notif: any) => {
      console.log('🔔 AdminWithdrawals received notification:', notif);
      if (notif?.type === 'withdrawal_requested') {
        queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      }
    };

    const handleDirectWithdrawal = (data: any) => {
      console.log('💸 AdminWithdrawals received direct withdrawal event:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    };

    socketService.socket.on('new-notification', handleNotification);
    socketService.socket.on('withdrawal-new-request', handleDirectWithdrawal);

    // Re-join admin room if socket reconnects
    const handleConnect = () => {
      console.log('🔌 AdminWithdrawals: Socket reconnected, re-joining admin room');
      socketService.joinAdmin();
    };
    socketService.socket.on('connect', handleConnect);

    return () => {
      socketService.socket?.off('new-notification', handleNotification);
      socketService.socket?.off('withdrawal-new-request', handleDirectWithdrawal);
      socketService.socket?.off('connect', handleConnect);
    };
  }, [queryClient, enqueueSnackbar, socketService.socket]);

  const { data: requestsRes, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: () => withdrawalApi.getAllRequests(),
  });

  const requests = requestsRes?.data?.requests || [];

  const columns: Column<any>[] = [
    {
      key: 'owner',
      label: 'Chủ sân',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.owner?.name}</Typography>
          <Typography variant="caption" color="text.secondary">{row.owner?.phone}</Typography>
        </Box>
      )
    },
    {
      key: 'amount',
      label: 'Số tiền',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
          {new Intl.NumberFormat('vi-VN').format(row.amount)}đ
        </Typography>
      )
    },
    {
      key: 'bank',
      label: 'Ngân hàng nhận',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.bank_name}</Typography>
          <Typography variant="caption" color="text.secondary">{row.bank_account}</Typography>
        </Box>
      )
    },
    {
      key: 'created_at',
      label: 'Ngày yêu cầu',
      render: (row) => row.createdAt
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <Chip 
          label={row.status} 
          color={statusColors[row.status]} 
          size="small" 
          sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }} 
        />
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      align: 'right',
      render: (row) => (
        <Tooltip title="Xem chi tiết & Xử lý">
          <IconButton size="small" color="primary" onClick={() => handleOpenDetail(row)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };


  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>
          Quản lý Rút tiền & Tài chính 💸
        </Typography>
      </Box>

      <DataTable
        columns={columns}
        data={requests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        isLoading={isLoading}
        count={requests.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="Chưa có yêu cầu rút tiền nào cần xử lý."
      />

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
