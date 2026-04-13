import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Card, Grid, Stack, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Divider
} from '@mui/material';
import { 
  AccountBalanceWallet, History, CallMade, 
  LocalAtm, ReceiptLong, Payment as PaymentIcon,
  Storefront
} from '@mui/icons-material';
import { useState } from 'react';
import { withdrawalApi } from '@/api/withdrawalApi';
import { paymentApi } from '@/api/paymentApi';
import { useAuthStore } from '@/stores/authStore';
import { useSnackbar } from 'notistack';

const OwnerWallet = () => {
  const { user } = useAuthStore();
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [bankAccName, setBankAccName] = useState('');
  
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // 1. Fetch Withdrawals
  const { data: withdrawalsRes, isLoading: loadingWithdraws } = useQuery({
    queryKey: ['my-withdrawals'],
    queryFn: () => withdrawalApi.getMyWithdrawals(),
  });
  const withdrawals = withdrawalsRes?.data?.requests || [];

  // 2. Fetch Payments (Subscriptions etc)
  const { data: paymentsRes, isLoading: loadingPayments } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => paymentApi.getMyPayments(),
  });
  const payments = paymentsRes || [];

  const withdrawMutation = useMutation({
    mutationFn: (data: any) => withdrawalApi.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] }); 
      enqueueSnackbar('Yêu cầu rút tiền đã được gửi.', { variant: 'success' });
      setOpenWithdraw(false);
      setAmount(''); setBankName(''); setBankAcc(''); setBankAccName('');
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi yêu cầu rút tiền', { variant: 'error' })
  });

  const handleRequest = () => {
    withdrawMutation.mutate({
      amount: parseInt(amount),
      bank_name: bankName,
      bank_account: bankAcc,
      bank_account_name: bankAccName
    });
  };

  const statusColors: any = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    paid: 'success',
    failed: 'error',
    rejected: 'error',
    cancelled: 'default'
  };

  if (loadingWithdraws || loadingPayments) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 950, mb: 4, letterSpacing: -0.5 }}>
        Tài chính & Giao dịch 💸
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={5}>
          <Card sx={{ 
            p: 4, borderRadius: 3, 
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white', position: 'relative', overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4)'
          }}>
            <AccountBalanceWallet sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: 150, opacity: 0.1 }} />
            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700, mb: 1, letterSpacing: 1 }}>SỐ DƯ KHẢ DỤNG</Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, fontFamily: 'monospace' }}>
              {new Intl.NumberFormat('vi-VN').format(user?.wallet_balance || 0)}đ
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenWithdraw(true)}
              sx={{ 
                bgcolor: 'white', color: '#059669', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                fontWeight: 900, px: 4, borderRadius: 2, textTransform: 'none'
              }}
              startIcon={<CallMade />}
            >
              Rút tiền về ngân hàng
            </Button>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 4, borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Grid container spacing={4}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>TỔNG DOANH THU</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 1, color: '#0F172A' }}>
                  {new Intl.NumberFormat('vi-VN').format(user?.wallet_balance || 0)}đ 
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 500, color: 'text.secondary' }}>(Bao gồm cả số dư hiện tại)</Typography>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>GIAO DỊCH CHỜ</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 1, color: '#F59E0B' }}>
                   {new Intl.NumberFormat('vi-VN').format(payments.filter((p:any) => p.status === 'pending').length)}
                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 500, color: 'text.secondary' }}>Yêu cầu chưa hoàn tất</Typography>
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column: Payment History (Subscriptions) */}
        <Grid item xs={12} lg={7}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <ReceiptLong sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Lịch sử thanh toán gói</Typography>
          </Stack>
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, py: 2 }}>Gói & Kỳ hạn</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Số tiền</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Ngày</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.option?.plan?.name || 'Gói dịch vụ'}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.option?.duration_months} tháng</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{new Intl.NumberFormat('vi-VN').format(p.amount)}đ</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {p.createdAt || p.created_at}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={p.status === 'completed' ? 'Thành công' : p.status === 'pending' ? 'Chờ' : 'Thất bại'} 
                        color={statusColors[p.status] || 'default'} 
                        size="small" 
                        sx={{ fontWeight: 900, fontSize: '0.6rem', height: 20 }} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ py: 6, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Chưa có giao dịch thanh toán gói.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Right Column: Withdrawal History */}
        <Grid item xs={12} lg={5}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <History sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Lịch sử rút tiền</Typography>
          </Stack>
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, py: 2 }}>Số tiền</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Ngày</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.map((req: any) => (
                  <TableRow key={req.id} hover>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                        {new Intl.NumberFormat('vi-VN').format(req.amount)}đ
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{req.bank_name}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {new Date(req.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={req.status === 'completed' ? 'Đã nhận' : req.status} 
                        color={statusColors[req.status]} 
                        size="small" 
                        sx={{ fontWeight: 900, fontSize: '0.6rem', height: 20, textTransform: 'uppercase' }} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {withdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ py: 6, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Chưa có yêu cầu rút tiền.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Withdrawal Dialog */}
      <Dialog open={openWithdraw} onClose={() => setOpenWithdraw(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900, px: 3, pt: 3 }}>Yêu cầu rút tiền 💸</DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
            Số dư ví hiện tại: {new Intl.NumberFormat('vi-VN').format(user?.wallet_balance || 0)}đ
          </Alert>
          <Stack spacing={2.5}>
            <TextField 
              fullWidth label="Số tiền muốn rút" type="number"
              variant="filled" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{ startAdornment: <LocalAtm sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1 }}>THÔNG TIN NHẬN TIỀN</Typography>
            <TextField fullWidth label="Ngân hàng" placeholder="VD: Vietcombank" variant="filled" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="Số tài khoản" variant="filled" value={bankAcc} onChange={(e) => setBankAcc(e.target.value)} />
              <TextField fullWidth label="Chủ tài khoản" variant="filled" value={bankAccName} onChange={(e) => setBankAccName(e.target.value.toUpperCase())} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenWithdraw(false)} sx={{ fontWeight: 700, borderRadius: 2 }}>Hủy bỏ</Button>
          <Button 
            variant="contained" 
            onClick={handleRequest}
            disabled={!amount || !bankAcc || withdrawMutation.isPending}
            sx={{ fontWeight: 900, px: 4, borderRadius: 2 }}
          >
            Gửi yêu cầu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OwnerWallet;
