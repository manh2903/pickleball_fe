import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Card, Typography, TextField, 
  IconButton, Chip, Stack, MenuItem, 
  Avatar, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, CircularProgress, Alert
} from '@mui/material';
import { 
  Block, CheckCircle, Visibility, 
  AccountBalanceWallet
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminApi } from '@/api/adminApi';
import DataTable, { Column } from '@/components/DataTable';
import AdminFilterBar from '@/components/AdminFilterBar';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [planId, setPlanId] = useState('');
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Detail Modal State
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users', role, status, search, planId, page, rowsPerPage],
    queryFn: () => adminApi.getUsers({ role, status, search, planId, page: page + 1, limit: rowsPerPage })
  });

  const { data: detailRes, isLoading: loadingDetail } = useQuery({
    queryKey: ['admin-user-detail', viewingUserId],
    queryFn: () => adminApi.getUserDetail(viewingUserId!),
    enabled: !!viewingUserId && openDetail
  });

  const users = usersRes?.data?.users || [];
  const totalUsers = usersRes?.data?.total || 0;
  const userDetail = detailRes?.data;
  const selectedUser = userDetail?.user;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => adminApi.updateUserStatus(id, status),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', viewingUserId] });
      enqueueSnackbar(res.data?.message || 'Cập nhật trạng thái thành công', { variant: 'success' });
    }
  });

  const handleOpenDetail = (user: any) => {
    setViewingUserId(user.id);
    setOpenDetail(true);
  };

  const getPlanBadge = (planName: string) => {
    if (!planName) return null;
    const isUltra = planName.toLowerCase().includes('ultra');
    const isPro = planName.toLowerCase().includes('pro');
    
    return (
      <Chip 
        label={planName.toUpperCase()} 
        size="small"
        sx={{ 
          borderRadius: 0, 
          fontWeight: 900, 
          fontSize: '0.65rem',
          bgcolor: isUltra ? '#7C3AED' : (isPro ? '#10B981' : '#64748B'),
          color: 'white',
          height: 20
        }} 
      />
    );
  };

  const columns: Column<any>[] = [
    {
      key: 'info',
      label: 'NGƯỜI DÙNG',
      render: (user: any) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar 
            src={user.avatar} 
            sx={{ 
                borderRadius: 0, 
                bgcolor: user.role === 'admin' ? 'error.main' : (user.role === 'owner' ? 'primary.main' : 'secondary.main'), 
                fontWeight: 800,
                width: 36, height: 36
            }}
          >
            {user.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>{user.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem' }}>
               {user.email}
            </Typography>
          </Box>
        </Stack>
      )
    },
    {
      key: 'role',
      label: 'VAI TRÒ',
      render: (user: any) => (
        <Chip 
            label={user.role === 'owner' ? 'CHỦ SÂN' : (user.role === 'admin' ? 'ADMIN' : 'PLAYER')} 
            variant="outlined"
            size="small" 
            sx={{ borderRadius: 0, fontWeight: 900, fontSize: '0.65rem', borderWeight: 2 }} 
        />
      )
    },
    {
        key: 'subscription',
        label: 'GÓI DỊCH VỤ',
        render: (user: any) => {
            if (user.role !== 'owner') return <Typography variant="caption" color="text.disabled">-</Typography>;
            const sub = user.activeSubscription;
            return (
                <Stack spacing={0.5}>
                    {sub ? getPlanBadge(sub.option?.plan?.name || 'Active') : <Chip label="MIỄN PHÍ" size="small" sx={{ borderRadius: 0, fontWeight: 800, fontSize: '0.65rem', height: 20 }} />}
                    {sub && (
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.secondary' }}>
                            Hết hạn: {new Date(sub.end_date).toLocaleDateString('vi-VN')}
                        </Typography>
                    )}
                </Stack>
            );
        }
    },
    {
      key: 'finance',
      label: 'SỐ DƯ VÍ',
      render: (user: any) => (
        <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'Times New Roman', color: 'primary.main' }}>
          {new Intl.NumberFormat('vi-VN').format(user.wallet_balance || 0)}đ
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      render: (user: any) => (
        <Chip 
          label={user.status === 'active' ? 'ACTIVE' : 'LOCKED'} 
          color={user.status === 'active' ? 'success' : 'error'} 
          size="small" 
          sx={{ borderRadius: 0, fontWeight: 900, fontSize: '0.65rem', height: 20 }}
        />
      )
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      align: 'right',
      render: (user: any) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton size="small" onClick={() => handleOpenDetail(user)} sx={{ borderRadius: 0, bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}>
            <Visibility fontSize="small" color="primary" />
          </IconButton>
          {user.role !== 'admin' && (
             <IconButton 
                size="small" 
                color={user.status === 'active' ? 'error' : 'success'}
                onClick={() => updateStatusMutation.mutate({ id: user.id, status: user.status === 'active' ? 'inactive' : 'active' })}
                sx={{ borderRadius: 0, bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}
             >
                {user.status === 'active' ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
             </IconButton>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', letterSpacing: -1 }}>
            Hệ thống Tài khoản 👥
          </Typography>
          <Typography variant="body2" color="text.secondary">Quản trị phân quyền và theo dõi trạng thái gói cước của toàn bộ thành viên.</Typography>
      </Box>

      <Card sx={{ borderRadius: 0, border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1, bgcolor: '#F8FAFC' }}>
          <Tabs 
            value={role} 
            onChange={(_, val) => { setRole(val); setPage(0); }}
            sx={{ 
                '& .MuiTab-root': { fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem', minWidth: 120 },
                '& .Mui-selected': { color: 'primary.main' },
                '& .MuiTabs-indicator': { height: 3 }
            }}
          >
            <Tab label="Tất cả" value="" />
            <Tab label="Người chơi" value="user" />
            <Tab label="Chủ sân" value="owner" />
            <Tab label="Quản trị viên" value="admin" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
            <AdminFilterBar
            search={search}
            onSearchChange={(val: string) => { setSearch(val); setPage(0); }}
            searchPlaceholder="Tìm theo tên, email, sđt..."
            onReset={() => { setSearch(''); setStatus(''); setPlanId(''); setPage(0); }}
            disableReset={search === '' && status === '' && planId === ''}
            >
            {role === 'owner' && (
                <TextField 
                    select size="small" label="Gói dịch vụ" value={planId}
                    onChange={(e) => { setPlanId(e.target.value); setPage(0); }}
                    sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                >
                    <MenuItem value="">Tất cả gói</MenuItem>
                    <MenuItem value="1">Gói Miễn Phí</MenuItem>
                    <MenuItem value="2">Gói Pro</MenuItem>
                    <MenuItem value="3">Gói Ultra</MenuItem>
                </TextField>
            )}
            <TextField 
                select size="small" label="Trạng thái" value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0); }}
                sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="inactive">Đã khóa</MenuItem>
            </TextField>
            </AdminFilterBar>

            <Box sx={{ mt: 3 }}>
                <DataTable 
                columns={columns}
                data={users}
                isLoading={isLoading}
                count={totalUsers}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </Box>
        </Box>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth sx={{ '& .MuiPaper-root': { borderRadius: 0 } }}>
        <DialogTitle sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Times New Roman' }}>
          HỒ SƠ THÀNH VIÊN
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          {loadingDetail ? (
              <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
          ) : selectedUser ? (
            <Stack spacing={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar 
                    src={selectedUser.avatar} 
                    sx={{ width: 100, height: 100, borderRadius: 0, border: '4px solid #F1F5F9', bgcolor: 'primary.main', fontWeight: 950, fontSize: '2.5rem' }}
                >
                  {selectedUser.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 950, fontFamily: 'Times New Roman' }}>{selectedUser.name}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label={selectedUser.role.toUpperCase()} size="small" sx={{ borderRadius: 0, fontWeight: 900, bgcolor: 'black', color: 'white' }} />
                    <Chip 
                        label={selectedUser.status === 'active' ? 'ACTIVE' : 'LOCKED'} 
                        color={selectedUser.status === 'active' ? 'success' : 'error'}
                        size="small" sx={{ borderRadius: 0, fontWeight: 900 }}
                    />
                  </Stack>
                </Box>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', mb: 2 }}>Thông tin định danh</Typography>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', pb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>Email liên hệ:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedUser.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', pb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>Số điện thoại:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedUser.phone || 'Chưa có'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', pb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>Ngày gia nhập:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</Typography>
                        </Box>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Box sx={{ p: 3, bgcolor: '#0F172A', color: 'white', borderRadius: 0 }}>
                        <Typography variant="overline" sx={{ fontWeight: 800, opacity: 0.7 }}>SỐ DƯ HIỆN TẠI</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', color: '#10B981', mt: 1 }}>
                            {new Intl.NumberFormat('vi-VN').format(selectedUser.wallet_balance || 0)}đ
                        </Typography>
                        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalanceWallet sx={{ fontSize: 16, opacity: 0.5 }} />
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>{selectedUser.role === 'owner' ? 'Doanh thu tích lũy' : 'Ví người dùng'}</Typography>
                        </Box>
                    </Box>
                </Grid>
              </Grid>

              {/* Owner Context: Subscriptions & Venues */}
              {selectedUser.role === 'owner' && (
                  <Box>
                      <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', mb: 2 }}>Trạng thái vận hành & Gói cước</Typography>
                      <Grid container spacing={2}>
                          <Grid item xs={12} sm={8}>
                             <Box sx={{ p: 2, border: '2px solid', borderColor: userDetail.subscription ? 'primary.main' : '#E2E8F0', borderRadius: 0 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>GÓI DỊCH VỤ ĐANG DÙNG</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                            {userDetail.subscription?.option?.plan?.name || 'GÓI MIỄN PHÍ'}
                                        </Typography>
                                    </Box>
                                    {userDetail.subscription && getPlanBadge(userDetail.subscription.option?.plan?.name)}
                                </Stack>
                                {userDetail.subscription && (
                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Hết hạn vào:</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'error.main' }}>
                                            {new Date(userDetail.subscription.end_date).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </Box>
                                )}
                             </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                             <Box sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', height: '100%', textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>CƠ SỞ ĐANG QUẢN TRỊ</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', mt: 1 }}>
                                    {userDetail.venueCount || 0}
                                </Typography>
                             </Box>
                          </Grid>
                      </Grid>
                  </Box>
              )}

              {/* Subscription History for Owner */}
              {selectedUser.role === 'owner' && (
                  <Box sx={{ mt: 2 }}>
                       <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', mb: 2 }}>Lịch sử sở hữu gói dịch vụ</Typography>
                       <DataTable 
                        columns={[
                            { key: 'plan', label: 'GÓI / OPTION', render: (p: any) => <Typography variant="caption" sx={{ fontWeight: 800 }}>{p.option?.plan?.name || 'Gói dịch vụ'}</Typography> },
                            { key: 'amount', label: 'SỐ TIỀN', render: (p: any) => <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>{p.amount_paid > 0 ? `${new Intl.NumberFormat('vi-VN').format(p.amount_paid)}đ` : '0đ'}</Typography> },
                            { key: 'start', label: 'TỪ NGÀY', render: (p: any) => <Typography variant="caption">{new Date(p.start_date).toLocaleDateString('vi-VN')}</Typography> },
                            { key: 'end', label: 'ĐẾN NGÀY', render: (p: any) => <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 800 }}>{new Date(p.end_date).toLocaleDateString('vi-VN')}</Typography> },
                            { key: 'status', label: 'TRẠNG THÁI', render: (p: any) => (
                                <Chip 
                                    label={p.status.toUpperCase()} 
                                    size="small" 
                                    sx={{ borderRadius: 0, fontWeight: 900, height: 16, fontSize: '0.55rem', bgcolor: p.status === 'active' ? '#DCFCE7' : '#F1F5F9', color: p.status === 'active' ? '#166534' : 'text.secondary' }} 
                                />
                            )}
                        ]}
                        data={userDetail.subscriptionHistory || []}
                        isLoading={false}
                        hidePagination
                       />
                  </Box>
              )}
            </Stack>
          ) : (
            <Alert severity="warning" sx={{ borderRadius: 0 }}>Không tìm thấy dữ liệu thành viên này.</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setOpenDetail(false)} sx={{ fontWeight: 800, borderRadius: 0, textTransform: 'none' }}>Đóng cửa sổ</Button>
          {selectedUser?.status === 'active' && selectedUser?.role !== 'admin' && (
              <Button 
                variant="contained" color="error" startIcon={<Block />}
                onClick={() => updateStatusMutation.mutate({ id: selectedUser.id, status: 'inactive' })}
                sx={{ fontWeight: 900, borderRadius: 0, px: 3, textTransform: 'none' }}
              >
                KHÓA TÀI KHOẢN
              </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
