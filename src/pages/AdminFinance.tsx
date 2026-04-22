import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Chip, 
  IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField,
  Tooltip, Stack, Divider, Tabs, Tab
} from '@mui/material';
import { 
  Visibility,
  AccountBalanceWallet,
  ReceiptLong,
  WorkspacePremium
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { withdrawalApi } from '@/api/withdrawalApi';
import { adminApi } from '@/api/adminApi';
import { useSnackbar } from 'notistack';
import { socketService } from '@/utils/socket';
import DataTable, { Column } from '@/components/DataTable';
import AdminFilterBar from '@/components/AdminFilterBar';

const AdminFinance = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openPaymentDetail, setOpenPaymentDetail] = useState(false);
  const [transRef, setTransRef] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [search, setSearch] = useState('');
  
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

  // --- Withdrawals Logic ---
  const { data: requestsRes, isLoading: loadingWithdrawals } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: () => withdrawalApi.getAllRequests(),
    enabled: tabValue === 0
  });

  const { data: paymentsRes, isLoading: loadingPayments } = useQuery({
    queryKey: ['admin-subscription-payments', page, rowsPerPage, search],
    queryFn: () => adminApi.getSubscriptionPayments({ 
        page: page + 1, 
        limit: rowsPerPage,
        search: search 
    }),
    enabled: tabValue === 1
  });

  const requests = requestsRes?.data?.requests || [];
  const payments = paymentsRes?.data?.payments || [];
  const totalPayments = paymentsRes?.data?.total || 0;

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
      payload: { status, transaction_ref: transRef, reject_reason: rejectReason, note: adminNote }
    });
  };

  useEffect(() => {
    if (tabValue === 0) {
        socketService.onNewNotification((notif) => {
          if (notif?.type === 'withdrawal_requested') {
            queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
          }
        });
    }
  }, [tabValue, queryClient]);

  // --- Column Definitions ---
  const withdrawalColumns: Column<any>[] = [
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

  const paymentColumns: Column<any>[] = [
    {
      key: 'owner',
      label: 'Chủ sân (Người mua)',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.payer?.name}</Typography>
          <Typography variant="caption" color="text.secondary">{row.payer?.email}</Typography>
        </Box>
      )
    },
    {
      key: 'plan',
      label: 'Gói nâng cấp',
      render: (row) => {
        const planName = row.option?.plan?.name || '';
        let color = '#64748B'; // Default Gray
        let bgColor = '#F1F5F9';
        
        if (planName.includes('Pro')) { color = '#16A34A'; bgColor = '#DCFCE7'; }
        else if (planName.includes('Ultra')) { color = '#7C3AED'; bgColor = '#F3E8FF'; }
        else if (planName.includes('Enterprise')) { color = '#0F172A'; bgColor = '#F1F5F9'; }

        return (
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 1, 
            bgcolor: bgColor, 
            color: color, 
            px: 1.5, 
            py: 0.5, 
            borderLeft: `3px solid ${color}` 
          }}>
              <WorkspacePremium sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {planName}
              </Typography>
          </Box>
        );
      }
    },
    {
      key: 'amount',
      label: 'Giá trị',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 800, color: '#16A34A' }}>
          +{new Intl.NumberFormat('vi-VN').format(row.amount)}đ
        </Typography>
      )
    },
    {
      key: 'method',
      label: 'Phương thức',
      render: (row) => <Chip label={row.method?.toUpperCase()} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.6rem' }} />
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => {
        const color = row.status === 'completed' ? 'success' : (row.status === 'pending' ? 'warning' : 'error');
        return <Chip label={row.status?.toUpperCase()} color={color} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />;
      }
    },
    {
      key: 'date',
      label: 'Thời gian',
      render: (row) => new Date(row.createdAt).toLocaleString('vi-VN')
    },
    {
      key: 'actions',
      label: 'Thao tác',
      align: 'right',
      render: (row) => (
        <Tooltip title="Chi tiết thanh toán">
          <IconButton size="small" color="primary" onClick={() => { setSelectedPayment(row); setOpenPaymentDetail(true); }}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', letterSpacing:-1 }}>
          Quản lý Tài chính Hệ thống 💸
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Giám sát nguồn thu từ Gói dịch vụ và xử lý Yêu cầu rút tiền.</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => { setTabValue(v); setPage(0); setSearch(''); }} sx={{ '& .MuiTab-root': { fontWeight: 800, fontSize: '0.85rem' } }}>
          <Tab icon={<AccountBalanceWallet sx={{ fontSize: 20 }} />} iconPosition="start" label="Yêu cầu rút tiền" />
          <Tab icon={<ReceiptLong sx={{ fontSize: 20 }} />} iconPosition="start" label="Doanh thu Gói dịch vụ" />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
        <AdminFilterBar
            search={search}
            onSearchChange={(val: string) => { setSearch(val); setPage(0); }}
            searchPlaceholder={tabValue === 0 ? "Tìm tên chủ sân..." : "Tìm tên chủ sân, mã giao dịch..."}
            onReset={() => {
                setSearch('');
                setPage(0);
            }}
            disableReset={search === ''}
        />
      </Box>

      {tabValue === 0 ? (
        <DataTable
          columns={withdrawalColumns}
          data={requests.filter((r: any) => 
            !search || r.owner?.name?.toLowerCase().includes(search.toLowerCase())
          ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          isLoading={loadingWithdrawals}
          count={requests.filter((r: any) => 
            !search || r.owner?.name?.toLowerCase().includes(search.toLowerCase())
          ).length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          emptyMessage="Chưa có yêu cầu rút tiền nào cần xử lý."
        />
      ) : (
        <DataTable
          columns={paymentColumns}
          data={payments}
          isLoading={loadingPayments}
          count={totalPayments}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          emptyMessage="Chưa có doanh thu đăng ký nào được ghi nhận."
        />
      )}

      {/* Withdrawal Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>Xử lý thanh toán rút tiền</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>CHỦ SÂN YÊU CẦU:</Typography>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 950 }}>
              {new Intl.NumberFormat('vi-VN').format(selectedRequest?.amount || 0)}đ
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Ngân hàng:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedRequest?.bank_name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Số tài khoản:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedRequest?.bank_account}</Typography>
              </Box>
            </Stack>
          </Box>

          <Stack spacing={2.5}>
            <TextField fullWidth label="Mã giao dịch ngân hàng" value={transRef} onChange={(e) => setTransRef(e.target.value)} />
            <TextField fullWidth label="Lý do từ chối" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            <TextField fullWidth multiline rows={2} label="Ghi chú nội bộ" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setOpenDetail(false)}>Đóng</Button>
          {(selectedRequest?.status === 'pending' || selectedRequest?.status === 'processing') && (
            <>
              <Button color="error" onClick={() => handleProcess('rejected')}>Từ chối</Button>
              <Button variant="contained" color="success" onClick={() => handleProcess('completed')}>Hoàn tất chuyển tiền</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Payment Detail Dialog */}
      <Dialog open={openPaymentDetail} onClose={() => setOpenPaymentDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>Chi tiết giao dịch thanh toán</DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Stack spacing={3}>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderLeft: '4px solid #16A34A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Hóa đơn giá trị</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 950, color: '#16A34A' }}>
                    {new Intl.NumberFormat('vi-VN').format(selectedPayment.amount)}đ
                    </Typography>
                </Box>
                <Chip 
                    label={selectedPayment.status?.toUpperCase()} 
                    color={selectedPayment.status === 'completed' ? 'success' : 'warning'} 
                    sx={{ fontWeight: 900, borderRadius: 0 }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>Thông tin khách hàng</Typography>
                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Họ tên:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedPayment.payer?.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Email:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedPayment.payer?.email}</Typography>
                    </Box>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>Chi tiết gói dịch vụ</Typography>
                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Gói đăng ký:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>{selectedPayment.option?.plan?.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Thời hạn:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedPayment.option?.duration_months} tháng</Typography>
                    </Box>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>Thông tin giao dịch</Typography>
                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Phương thức:</Typography>
                        <Chip label={selectedPayment.method?.toUpperCase()} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Mã giao dịch:</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: 'monospace', wordBreak: 'break-all', bgcolor: '#F1F5F9', p: 0.5 }}>
                            {selectedPayment.transaction_id}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Thời gian:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}</Typography>
                    </Box>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDetail(false)} variant="contained" sx={{ borderRadius: 0 }}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminFinance;
