import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Card, Grid, Stack, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress
} from '@mui/material';
import { 
  AccountBalanceWallet, History, CallMade, 
  LocalAtm
} from '@mui/icons-material';
import { useState } from 'react';
import { withdrawalApi } from '@/api/withdrawalApi';
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

  const { data: withdrawalsRes, isLoading } = useQuery({
    queryKey: ['my-withdrawals'],
    queryFn: () => withdrawalApi.getMyWithdrawals(),
  });

  const withdrawals = withdrawalsRes?.data?.requests || [];

  const withdrawMutation = useMutation({
    mutationFn: (data: any) => withdrawalApi.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] }); // To refresh balance in header
      enqueueSnackbar('Yêu cầu rút tiền đã được gửi. Số dư tạm thời đã bị khấu trừ.', { variant: 'success' });
      setOpenWithdraw(false);
      // Reset form
      setAmount('');
      setBankName('');
      setBankAcc('');
      setBankAccName('');
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
    rejected: 'error'
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, fontFamily: 'Times New Roman' }}>
        Ví tiền & Thanh toán 💸
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <Card sx={{ 
            p: 4, borderRadius: 2, 
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            color: 'white', position: 'relative', overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(34, 197, 94, 0.4)'
          }}>
            <AccountBalanceWallet sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: 150, opacity: 0.1 }} />
            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 600, mb: 1 }}>SỐ DƯ KHẢ DỤNG</Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>
              {new Intl.NumberFormat('vi-VN').format(user?.wallet_balance || 0)}đ
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenWithdraw(true)}
              sx={{ 
                bgcolor: 'white', color: 'primary.main', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                fontWeight: 800, px: 4, borderRadius: 1.5
              }}
              startIcon={<CallMade />}
            >
              RÚT TIỀN VỀ NGÂN HÀNG
            </Button>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 4, borderRadius: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>TỔNG DOANH THU</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>---</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ĐANG CHỜ DUYỆT</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>---</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center' }}>
        <History sx={{ mr: 1 }} /> Lịch sử rút tiền
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 1.5 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Số tiền</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngân hàng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày yêu cầu</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mã GD / Ghi chú</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {withdrawals.map((req: any) => (
              <TableRow key={req.id} hover>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
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
                    sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }} 
                  />
                </TableCell>
                <TableCell>
                  {req.transaction_ref || req.reject_reason || '-'}
                </TableCell>
              </TableRow>
            ))}
            {withdrawals.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">Chưa có yêu cầu rút tiền nào.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Withdrawal Dialog */}
      <Dialog open={openWithdraw} onClose={() => setOpenWithdraw(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>Yêu cầu rút tiền</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3 }}>
            Số dư ví hiện tại: <b>{new Intl.NumberFormat('vi-VN').format(user?.wallet_balance || 0)}đ</b>
          </Alert>

          <Stack spacing={2.5}>
            <TextField 
              fullWidth label="Số tiền yêu cầu rút" 
              type="number"
              placeholder="Tối thiểu 50.000đ"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{ startAdornment: <LocalAtm sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>Thông tin nhận tiền:</Typography>
            <TextField 
              fullWidth label="Tên ngân hàng" 
              placeholder="VD: Vietcombank, Techcombank..." 
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
            <TextField 
              fullWidth label="Số tài khoản" 
              value={bankAcc}
              onChange={(e) => setBankAcc(e.target.value)}
            />
            <TextField 
              fullWidth label="Họ tên chủ tài khoản" 
              value={bankAccName}
              onChange={(e) => setBankAccName(e.target.value.toUpperCase())}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setOpenWithdraw(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleRequest}
            disabled={!amount || !bankAcc || withdrawMutation.isPending}
          >
            Gửi yêu cầu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OwnerWallet;
