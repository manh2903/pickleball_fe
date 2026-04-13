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
  LocalAtm, ReceiptLong, Lock, TrendingUp
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useState, useEffect } from 'react';
import { withdrawalApi } from '@/api/withdrawalApi';
import { paymentApi } from '@/api/paymentApi';
import { ownerApi } from '@/api/ownerApi';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/stores/authStore';
import { socketService } from '@/utils/socket';
import { useSnackbar } from 'notistack';

const OwnerWallet = () => {
  const { user, updateUser } = useAuthStore();
  const subscription = (useAuthStore as any).getState?.()?.subscription;
  const hasAnalytics = subscription?.option?.features?.analytics === true;
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [bankAccName, setBankAccName] = useState('');
  
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // --- Real-time: Poll /auth/me every 30s for latest wallet_balance ---
  const { data: meData, refetch: refetchMe } = useQuery({
    queryKey: ['auth-me-wallet'],
    queryFn: () => authApi.getMe(),
    refetchInterval: 30_000,       // Poll every 30 seconds
    staleTime: 10_000,
  });

  // Sync fresh wallet_balance into Zustand store whenever /auth/me returns
  useEffect(() => {
    const freshUser = meData?.data?.user || meData?.data;
    if (freshUser?.wallet_balance !== undefined) {
      updateUser({ wallet_balance: freshUser.wallet_balance });
    }
  }, [meData]);

  // --- Real-time: Socket listener for booking events ---
  useEffect(() => {
    const handleBookingUpdate = () => {
      // Immediately refetch wallet balance + analytics on any booking change
      refetchMe();
      queryClient.invalidateQueries({ queryKey: ['owner-analytics-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['owner-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-withdrawals'] });
    };

    socketService.socket?.on('booking-status-updated', handleBookingUpdate);
    socketService.socket?.on('new-booking', handleBookingUpdate);

    return () => {
      socketService.socket?.off('booking-status-updated', handleBookingUpdate);
      socketService.socket?.off('new-booking', handleBookingUpdate);
    };
  }, [socketService.socket]);

  // Live wallet balance — prefer fresh data from /auth/me, fallback to store
  const freshUser = meData?.data?.user || meData?.data;
  const walletBalance = freshUser?.wallet_balance ?? user?.wallet_balance ?? 0;

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

  // 3. Analytics (gated — Basic/Premium only)
  const { data: analyticsRes } = useQuery({
    queryKey: ['owner-analytics-wallet'],
    queryFn: () => ownerApi.getAnalytics(),
    enabled: hasAnalytics,
  });
  const analytics = analyticsRes?.data;
  const last6Months = analytics?.monthly?.slice(-6) || [];

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
    pending: 'warning', processing: 'info', completed: 'success',
    paid: 'success', failed: 'error', rejected: 'error', cancelled: 'default'
  };

  if (loadingWithdraws || loadingPayments) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  console.log("user", user)
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Times New Roman' }}>
        Tài chính & Giao dịch 💸
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Quản lý số dư ví, lịch sử thu chi và rút tiền về ngân hàng.
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
              {new Intl.NumberFormat('vi-VN').format(walletBalance)}đ
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
                  {new Intl.NumberFormat('vi-VN').format(hasAnalytics ? (analytics?.totalRevenue || 0) : walletBalance)}đ
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 500, color: 'text.secondary' }}>Tổng đặt sân đã thanh toán</Typography>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>ĐƠN CHỜ XỬ LÝ</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 1, color: '#F59E0B' }}>
                   {payments.filter((p:any) => p.status === 'pending').length}
                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 500, color: 'text.secondary' }}>Yêu cầu chưa hoàn tất</Typography>
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Analytics Chart */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4, border: '1px solid #E2E8F0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TrendingUp sx={{ color: '#10B981' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Doanh thu 6 tháng</Typography>
              {!hasAnalytics && (
                <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700 }}>
                  🔒 Tính năng dành cho gói Basic/Premium
                </Typography>
              )}
            </Box>
          </Stack>
          {hasAnalytics && last6Months.length > 0 && (
            <Stack direction="row" spacing={3}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>TỔNG 6 THÁNG</Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: '#10B981' }}>
                  {new Intl.NumberFormat('vi-VN').format(last6Months.reduce((s: number, m: any) => s + m.revenue, 0))}đ
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>SỐ ĐẶT</Typography>
                <Typography variant="body1" sx={{ fontWeight: 900 }}>
                  {last6Months.reduce((s: number, m: any) => s + m.count, 0)}
                </Typography>
              </Box>
            </Stack>
          )}
        </Stack>

        {hasAnalytics ? (
          last6Months.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last6Months} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} width={45} />
                <ReTooltip
                  formatter={(val: any) => [new Intl.NumberFormat('vi-VN').format(val) + 'đ', 'Doanh thu']}
                  contentStyle={{ borderRadius: 8, fontSize: 12, fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {last6Months.map((_: any, i: number) => (
                    <Cell key={i} fill={i === last6Months.length - 1 ? '#10B981' : '#A7F3D0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">Chưa có dữ liệu doanh thu trong 6 tháng qua.</Typography>
            </Box>
          )
        ) : (
          <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#FAFAFA', borderRadius: 2, border: '1px dashed #E2E8F0' }}>
            <Lock sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 0.5 }}>Biểu đồ doanh thu theo tháng</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Nâng cấp lên gói Basic hoặc Premium để xem phân tích doanh thu, xu hướng đặt sân và các chỉ số kinh doanh chi tiết.
            </Typography>
            <Button variant="contained" size="small" href="/owner/subscription" 
              sx={{ fontWeight: 800, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, borderRadius: 2 }}>
              Nâng cấp gói →
            </Button>
          </Box>
        )}
      </Paper>

      {/* Tables */}
      <Grid container spacing={4}>
        {/* Left Column: Payment History */}
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
                      {new Date(p.createdAt || p.created_at).toLocaleDateString('vi-VN')}
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
            Số dư ví hiện tại: {new Intl.NumberFormat('vi-VN').format(walletBalance)}đ
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
