import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Card, Typography, TextField, 
  IconButton, Chip, Stack, MenuItem, 
  Tooltip, Avatar, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Divider, Grid, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { 
  Block, CheckCircle, Visibility, 
  Email, Security, Badge, Wallet,
  CalendarMonth, Update, Person, Store, WorkspacePremium, History
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
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Detail Modal State
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users', role, status, search, page, rowsPerPage],
    queryFn: () => adminApi.getUsers({ role, status, search, page: page + 1, limit: rowsPerPage })
  });

  // Fetch detailed info when modal opens
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

  const getRoleChip = (role: string) => {
    switch (role) {
      case 'admin': return <Chip label="Admin" color="error" size="small" icon={<Security />} sx={{ fontWeight: 800 }} />;
      case 'owner': return <Chip label="Chủ sân" color="primary" size="small" icon={<Badge />} sx={{ fontWeight: 800 }} />;
      default: return <Chip label="Người dùng" color="secondary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />;
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'info',
      label: 'Thông tin cá nhân',
      render: (user: any) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={user.avatar} sx={{ bgcolor: 'secondary.light', color: 'secondary.main', fontWeight: 800 }}>
            {user.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{user.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ fontSize: 12, mr: 0.5 }} /> {user.email}
              </Typography>
            </Box>
          </Box>
        </Stack>
      )
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (user: any) => getRoleChip(user.role)
    },
    {
      key: 'finance',
      label: 'Số dư ví',
      render: (user: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F1F5F9', px: 1, py: 0.5, borderRadius: 1, width: 'fit-content' }}>
          <Wallet sx={{ fontSize: 14, mr: 0.5, color: 'primary.main' }} />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {new Intl.NumberFormat('vi-VN').format(user.wallet_balance || 0)}đ
          </Typography>
        </Box>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (user: any) => (
        <Chip 
          label={user.status === 'active' ? 'Hoạt động' : 'Đã khóa'} 
          color={user.status === 'active' ? 'success' : 'default'} 
          size="small" 
          variant="outlined" 
          sx={{ fontWeight: 700 }}
        />
      )
    },
    {
      key: 'actions',
      label: 'Hành động',
      align: 'right',
      render: (user: any) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {user.status === 'active' ? (
            <Tooltip title="Khóa tài khoản">
              <IconButton 
                color="error" size="small"
                onClick={() => updateStatusMutation.mutate({ id: user.id, status: 'inactive' })}
                disabled={updateStatusMutation.isPending || user.role === 'admin'}
              >
                <Block />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Mở khóa tài khoản">
              <IconButton 
                color="success" size="small"
                onClick={() => updateStatusMutation.mutate({ id: user.id, status: 'active' })}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Xem chi tiết & Lịch sử">
            <IconButton size="small" onClick={() => handleOpenDetail(user)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 950, mb: 1, letterSpacing: -1 }}>
        Quản lý Tài khoản 👥
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
        Quản trị toàn bộ Khách hàng, Chủ sân và Cộng tác viên trên nền tảng.
      </Typography>

      <Card sx={{ p: 0, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2, bgcolor: '#F8FAFC' }}>
          <Tabs 
            value={role} 
            onChange={(_, val) => { setRole(val); setPage(0); }}
            sx={{ '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', minWidth: 100 } }}
          >
            <Tab label="Tất cả" value="" />
            <Tab label="Người chơi" value="user" />
            <Tab label="Chủ sân" value="owner" />
            <Tab label="Quản trị viên" value="admin" />
          </Tabs>
        </Box>

      <Box sx={{ mt: 3, px: 3 }}>
        <AdminFilterBar
          search={search}
          onSearchChange={(val: string) => { setSearch(val); setPage(0); }}
          searchPlaceholder="Tìm tên, email, sđt..."
          onReset={() => {
            setSearch('');
            setStatus('');
            setPage(0);
          }}
          disableReset={search === '' && status === ''}
        >
          <TextField 
            select 
            size="small" 
            label="Trạng thái" 
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            <MenuItem value="active">Đang hoạt động</MenuItem>
            <MenuItem value="inactive">Đã khóa</MenuItem>
          </TextField>
        </AdminFilterBar>
      </Box>

      <Box sx={{ px: 3, pb: 3, mt: 3 }}>
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
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" /> Chi tiết tài liệu quản trị
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetail ? (
              <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
          ) : selectedUser ? (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                    src={selectedUser.avatar} 
                    sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.light', fontWeight: 900 }}
                >
                  {selectedUser.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedUser.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    {getRoleChip(selectedUser.role)}
                    <Chip 
                        label={selectedUser.status === 'active' ? 'Hoạt động' : 'Đã khóa'} 
                        color={selectedUser.status === 'active' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider />

              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                        🛡️ THÔNG TIN CƠ BẢN
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>📧 EMAIL</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedUser.email}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>📞 SỐ ĐIỆN THOẠI</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedUser.phone || 'Chưa cập nhật'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>NGÀY THAM GIA</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                            {new Date(selectedUser.created_at || selectedUser.createdAt).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Update sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>CẬP NHẬT CUỐI</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                            {new Date(selectedUser.updated_at || selectedUser.updatedAt).toLocaleString('vi-VN')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                            <Wallet fontSize="inherit" /> TÀI CHÍNH NỀN TẢNG
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 950, color: 'primary.main' }}>
                            {new Intl.NumberFormat('vi-VN').format(selectedUser.wallet_balance || 0)}đ
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {selectedUser.role === 'owner' ? '* Bao gồm doanh thu từ booking chưa rút.' : '* Tiền dư trong tài khoản người chơi.'}
                        </Typography>
                    </Box>
                </Grid>
              </Grid>

              {/* Owner Specific Info */}
              {selectedUser.role === 'owner' && (
                  <Box sx={{ p: 2.5, bgcolor: '#F0F9FF', borderRadius: 2, border: '1px solid #BAE6FD' }}>
                      <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
                          <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <WorkspacePremium sx={{ fontSize: 18 }} /> GÓI DỊCH VỤ HIỆN TẠI
                              </Typography>
                              {userDetail.subscription ? (
                                  <Box>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                          {userDetail.subscription.option?.plan?.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                          Hết hạn: {new Date(userDetail.subscription.end_date).toLocaleDateString('vi-VN')}
                                      </Typography>
                                  </Box>
                              ) : (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Chưa đăng ký gói</Typography>
                              )}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Store sx={{ fontSize: 18 }} /> CƠ SỞ ĐANG QUẢN LÝ
                              </Typography>
                              <Typography variant="h4" sx={{ fontWeight: 950 }}>
                                  {userDetail.venueCount || 0} <Typography component="span" variant="body2" color="text.secondary">Sân</Typography>
                              </Typography>
                          </Box>
                      </Stack>
                  </Box>
              )}

              {/* User Specific Info - Booking History */}
              {selectedUser.role === 'user' && (
                  <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <History /> LỊCH SỬ ĐẶT SÂN GẦN NHẤT
                      </Typography>
                      {userDetail.recentBookings?.length > 0 ? (
                          <Table size="small">
                              <TableHead>
                                  <TableRow>
                                      <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Mã đặt sân</TableCell>
                                      <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Cơ sở</TableCell>
                                      <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Thời gian</TableCell>
                                      <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Tổng tiền</TableCell>
                                      <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Trạng thái</TableCell>
                                  </TableRow>
                              </TableHead>
                              <TableBody>
                                  {userDetail.recentBookings.map((bk: any) => (
                                      <TableRow key={bk.id}>
                                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{bk.booking_code}</TableCell>
                                          <TableCell sx={{ fontSize: '0.75rem' }}>{bk.venue?.name}</TableCell>
                                          <TableCell sx={{ fontSize: '0.75rem' }}>{new Date(bk.created_at).toLocaleDateString('vi-VN')}</TableCell>
                                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN').format(bk.total_price)}đ</TableCell>
                                          <TableCell>
                                              <Chip 
                                                label={bk.status === 'confirmed' ? 'Thành công' : bk.status} 
                                                size="small" 
                                                color={bk.status === 'confirmed' ? 'success' : 'default'}
                                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} 
                                              />
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      ) : (
                          <Alert severity="info" sx={{ py: 0 }}>Người dùng này chưa có đơn đặt sân nào.</Alert>
                      )}
                  </Box>
              )}
            </Stack>
          ) : (
            <Alert severity="warning">Không tìm thấy dữ liệu người dùng.</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setOpenDetail(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>Đóng cửa sổ</Button>
          {selectedUser?.status === 'active' ? (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<Block />}
                onClick={() => updateStatusMutation.mutate({ id: selectedUser.id, status: 'inactive' })}
                disabled={updateStatusMutation.isPending || selectedUser.role === 'admin'}
                sx={{ fontWeight: 700, textTransform: 'none' }}
              >
                Khóa vĩnh viễn
              </Button>
          ) : (
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<CheckCircle />}
                onClick={() => updateStatusMutation.mutate({ id: selectedUser.id, status: 'active' })}
                disabled={updateStatusMutation.isPending}
                sx={{ fontWeight: 700, textTransform: 'none' }}
              >
                Kích hoạt lại
              </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
