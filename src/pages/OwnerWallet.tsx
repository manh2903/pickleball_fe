import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Card, Grid, Stack, Button, 
  Paper, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  AccountBalanceWallet, CallMade, 
  ReceiptLong, Lock, TrendingUp, InfoOutlined
} from '@mui/icons-material';
import { useState, useEffect, useMemo } from 'react';
import Chart, { useChart } from '@/components/chart';
import { withdrawalApi } from '@/api/withdrawalApi';
import { ownerApi } from '@/api/ownerApi';
import { authApi } from '@/api/authApi';
import { subscriptionApi } from '@/api/subscriptionApi';
import { useAuthStore } from '@/stores/authStore';
import { socketService } from '@/utils/socket';
import { useSnackbar } from 'notistack';
import DataTable, { Column } from '@/components/DataTable';

const OwnerWallet = () => {
  const { user, updateUser } = useAuthStore();
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [bankAccName, setBankAccName] = useState('');

  // Analytics query client and snackbar
  
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: mySubRes } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionApi.getMySubscription,
  });

  const currentSubscription = mySubRes?.data || mySubRes;
  const hasAnalytics = currentSubscription?.option?.features?.analytics === true;

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- Real-time: Poll /auth/me every 30s for latest wallet_balance ---
  const { data: meData, refetch: refetchMe } = useQuery({
    queryKey: ['auth-me-wallet'],
    queryFn: () => authApi.getMe(),
    refetchInterval: 30_000,
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
      refetchMe();
      queryClient.invalidateQueries({ queryKey: ['owner-analytics-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['owner-stats'] });
      queryClient.invalidateQueries({ queryKey: ['owner-cashflow'] });
    };

    socketService.socket?.on('booking-status-updated', handleBookingUpdate);
    socketService.socket?.on('new-booking', handleBookingUpdate);

    return () => {
      socketService.socket?.off('booking-status-updated', handleBookingUpdate);
      socketService.socket?.off('new-booking', handleBookingUpdate);
    };
  }, [socketService.socket]);

  // --- Real-time: Socket listener for withdrawal status update ---
  useEffect(() => {
    const handleWithdrawalUpdate = (notif: any) => {
      if (
        notif?.type === 'withdrawal_approved' ||
        notif?.type === 'withdrawal_rejected'
      ) {
        refetchMe();
        queryClient.invalidateQueries({ queryKey: ['owner-cashflow'] });
        enqueueSnackbar(notif.title, { variant: notif.type === 'withdrawal_approved' ? 'success' : 'error' });
      }
    };

    socketService.socket?.on('new-notification', handleWithdrawalUpdate);
    return () => {
      socketService.socket?.off('new-notification', handleWithdrawalUpdate);
    };
  }, [socketService.socket]);

  // Live wallet balance — prefer fresh data from /auth/me, fallback to store
  const freshUser = meData?.data?.user || meData?.data;
  const walletBalance = freshUser?.wallet_balance ?? user?.wallet_balance ?? 0;
  const pendingBalance = freshUser?.pending_balance ?? 0;
  const availableBalance = freshUser?.available_balance ?? walletBalance;

  // 1. Fetch Cashflow
  const { data: cashflowRes, isLoading: loadingCashflow } = useQuery({
    queryKey: ['owner-cashflow'],
    queryFn: () => ownerApi.getCashflow(),
  });
  const cashflows = cashflowRes || [];

  // Date range states (default: first day of current month to today)
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  // 3. Analytics (gated — Basic/Premium only)
  const { data: analyticsRes } = useQuery({
    queryKey: ['owner-analytics-wallet', startDate, endDate],
    queryFn: () => ownerApi.getAnalytics({ start_date: startDate, end_date: endDate }),
    enabled: hasAnalytics,
  });
  const analytics = analyticsRes?.data;

  const processedData = useMemo(() => {
    if (!analytics?.daily || !Array.isArray(analytics.daily) || analytics.daily.length === 0) {
      return {
        categories: [],
        series: [
          { name: 'Doanh thu (đ)', type: 'area', data: [] },
          { name: 'Số lượt đặt', type: 'column', data: [] }
        ]
      };
    }

    // Sort data by date (oldest to newest)
    const sortedData = [...analytics.daily]
      .filter((item: any) => item?.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const categories = sortedData.map(item => {
      const date = new Date(item.date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    });

    const revenueData = sortedData.map(item => Number.isFinite(Number(item.revenue)) ? Number(item.revenue) : 0);
    const countData = sortedData.map(item => Number.isFinite(Number(item.count)) ? Number(item.count) : 0);

    return {
      categories,
      series: [
        { name: 'Doanh thu (đ)', type: 'area', data: revenueData },
        { name: 'Số lượt đặt', type: 'column', data: countData }
      ]
    };
  }, [analytics?.daily]);

  const chartOptions = useChart({
    xaxis: {
      categories: processedData.categories,
    },
    tooltip: {
      y: {
        formatter: (value: number, { seriesIndex }: any) => {
          if (value === undefined || value === null) return '';
          if (seriesIndex === 0) {
            return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
          }
          return `${value} lượt đặt`;
        },
      },
      shared: true,
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: [
      {
        title: {
          text: 'Doanh thu (đ)',
        },
        labels: {
          formatter: (val: number) => {
            if (val >= 1_000_000) {
              return `${(val / 1_000_000).toFixed(1)}M`;
            }
            if (val >= 1_000) {
              return `${(val / 1_000).toFixed(0)}k`;
            }
            return `${val}`;
          }
        },
        min: 0,
        max: Math.max(...(processedData.series[0]?.data || [0])) * 1.15 || 100000,
      },
      {
        opposite: true,
        title: {
          text: 'Số lượt đặt',
        },
        min: 0,
        max: Math.ceil(Math.max(...(processedData.series[1]?.data || [0])) * 1.15) || 5,
        tickAmount: 5,
        labels: {
          formatter: (val: number) => Math.round(val).toString()
        }
      }
    ],
    stroke: {
      curve: 'smooth',
      width: [3, 2],
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    colors: ['#22C55E', '#0F172A'],
    fill: {
      type: ['gradient', 'solid'],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (data: any) => withdrawalApi.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-cashflow'] });
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

  const columns: Column<any>[] = [
    {
      key: 'description',
      label: 'Giao dịch',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.description}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Mã tham chiếu: #{row.id}
          </Typography>
        </Box>
      )
    },
    {
      key: 'type',
      label: 'Loại',
      render: (row) => (
        <Chip 
          label={row.amount > 0 ? '+ Thu thập' : '- Trừ tiền'} 
          color={row.amount > 0 ? 'success' : 'error'} 
          variant="outlined" 
          size="small" 
          sx={{ fontWeight: 800, fontSize: '0.65rem', height: 22 }} 
        />
      )
    },
    {
      key: 'amount',
      label: 'Số tiền',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 900, color: row.amount > 0 ? '#10B981' : '#EF4444' }}>
          {row.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(row.amount)}đ
        </Typography>
      )
    },
    {
      key: 'date',
      label: 'Thời gian',
      render: (row) => (
        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
          {new Date(row.date).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <Chip 
          label={row.status === 'completed' ? 'Thành công' : row.status} 
          color={statusColors[row.status] || 'default'} 
          size="small" 
          sx={{ fontWeight: 900, fontSize: '0.6rem', height: 20, textTransform: 'uppercase' }} 
        />
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
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, fontFamily: 'monospace' }}>
              {new Intl.NumberFormat('vi-VN').format(availableBalance)}đ
            </Typography>
            <Tooltip 
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5, borderBottom: '1px dashed rgba(255,255,255,0.3)', pb: 0.5 }}>
                    CÔNG THỨC: Khả dụng = Tổng ví - Tạm giữ
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    • Tiền khách thanh toán được cộng ngay vào TỔNG VÍ.<br/>
                    • Các lịch đặt <b>Sắp diễn ra</b> tính là TIỀN TẠM GIỮ để đảm bảo hoàn tiền nếu khách hủy.<br/>
                    • Khi khách <b>Đã check-in</b> hoặc sân <b>Hoàn thành</b>, tiền trở thành KHẢ DỤNG và rút được ngay.
                  </Typography>
                </Box>
              }
              arrow placement="bottom-start"
            >
              <Box sx={{ 
                mb: 3, display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'help',
                bgcolor: 'rgba(255,255,255,0.15)', px: 1.5, py: 0.5, borderRadius: 1.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transition: 'all 0.2s' }
              }}>
                <InfoOutlined sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Đang tạm giữ chờ sân hoàn thành: {new Intl.NumberFormat('vi-VN').format(pendingBalance)}đ
                </Typography>
              </Box>
            </Tooltip>
            <Box>
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
            </Box>
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
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>GIAO DỊCH GẦN ĐÂY</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 1, color: '#0ea5e9' }}>
                   {cashflows.slice(0,10).length}
                   <Typography variant="caption" sx={{ display: 'block', fontWeight: 500, color: 'text.secondary' }}>Biến động 10 giao dịch</Typography>
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Analytics Chart */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4, border: '1px solid #E2E8F0' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TrendingUp sx={{ color: '#10B981' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Phân tích doanh thu</Typography>
              {!hasAnalytics && (
                <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700 }}>
                  🔒 Tính năng dành cho gói Basic/Premium
                </Typography>
              )}
            </Box>
          </Stack>

          {hasAnalytics && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" width={{ xs: '100%', md: 'auto' }}>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 140 }}
                />
                <TextField
                  label="Đến ngày"
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 140 }}
                />
              </Stack>
              {processedData.categories.length > 0 && (
                <Stack direction="row" spacing={2} sx={{ ml: { sm: 2 } }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>TỔNG DOANH THU</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#10B981' }}>
                      {new Intl.NumberFormat('vi-VN').format(analytics?.totalRevenue || 0)}đ
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>SỐ ĐẶT</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900 }}>
                      {analytics?.totalBookings || 0}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>

        {hasAnalytics ? (
          processedData.categories.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Chart
                type="line"
                series={processedData.series}
                options={chartOptions}
                height={280}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">Chưa có dữ liệu doanh thu trong khoảng thời gian này.</Typography>
            </Box>
          )
        ) : (
          <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#FAFAFA', borderRadius: 2, border: '1px dashed #E2E8F0' }}>
            <Lock sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 0.5 }}>Biểu đồ doanh thu theo khoảng thời gian</Typography>
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

      {/* Venue & Court Revenue Report */}
      {hasAnalytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue by Venue */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                Doanh thu theo cơ sở (Venues)
              </Typography>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, bgcolor: '#F8FAFC' }}>Cơ sở</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#F8FAFC' }}>Số đặt</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#F8FAFC' }}>Doanh thu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics?.venueReport && analytics.venueReport.length > 0 ? (
                      analytics.venueReport.map((v: any) => (
                        <TableRow key={v.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{v.name}</TableCell>
                          <TableCell align="right">{v.count}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: '#10B981' }}>
                            {new Intl.NumberFormat('vi-VN').format(v.revenue)}đ
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Revenue by Court */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                Doanh thu theo sân con (Courts)
              </Typography>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, bgcolor: '#F8FAFC' }}>Sân con</TableCell>
                      <TableCell sx={{ fontWeight: 800, bgcolor: '#F8FAFC' }}>Cơ sở</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#F8FAFC' }}>Số đặt</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#F8FAFC' }}>Doanh thu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics?.courtReport && analytics.courtReport.length > 0 ? (
                      analytics.courtReport.map((c: any) => (
                        <TableRow key={c.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{c.name}</TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{c.venue_name}</TableCell>
                          <TableCell align="right">{c.count}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: '#10B981' }}>
                            {new Intl.NumberFormat('vi-VN').format(c.revenue)}đ
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Cashflow Table */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <ReceiptLong sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Lịch sử dòng tiền (Thu / Chi)</Typography>
          </Stack>
          <DataTable
            columns={columns}
            data={cashflows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            isLoading={loadingCashflow}
            count={cashflows.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            emptyMessage="Chưa có giao dịch phát sinh."
          />
        </Grid>
      </Grid>

      {/* Withdrawal Dialog */}
      <Dialog open={openWithdraw} onClose={() => setOpenWithdraw(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900, px: 3, pt: 3 }}>Yêu cầu rút tiền 💸</DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
            Số dư khả dụng: {new Intl.NumberFormat('vi-VN').format(availableBalance)}đ 
            {pendingBalance > 0 && ` (Đang tạm giữ ${new Intl.NumberFormat('vi-VN').format(pendingBalance)}đ)`}
          </Alert>
          <Stack spacing={2.5}>
            <TextField 
              fullWidth label="Số tiền muốn rút" type="number"
              variant="filled" value={amount}
              onChange={(e) => setAmount(e.target.value)}
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