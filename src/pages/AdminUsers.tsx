import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Card, Typography, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Stack, MenuItem, CircularProgress,
  Tooltip, Avatar, Pagination
} from '@mui/material';
import { 
  Search, Block, CheckCircle, Visibility, 
  Email, Phone as PhoneIcon, Person, 
  Security, Badge, Wallet, Loyalty
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminApi } from '@/api/adminApi';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users', role, status, search, page],
    queryFn: () => adminApi.getUsers({ role, status, search, page, limit: 10 })
  });

  const users = usersRes?.data?.users || [];
  const totalPages = usersRes?.data?.totalPages || 1;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => adminApi.updateUserStatus(id, status),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      enqueueSnackbar(res.data?.message || 'Cập nhật trạng thái thành công', { variant: 'success' });
    }
  });

  const getRoleChip = (role: string) => {
    switch (role) {
      case 'admin': return <Chip label="Admin" color="error" size="small" icon={<Security />} sx={{ fontWeight: 800 }} />;
      case 'owner': return <Chip label="Chủ sân" color="primary" size="small" icon={<Badge />} sx={{ fontWeight: 800 }} />;
      default: return <Chip label="Người dùng" color="secondary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />;
    }
  };

  const getStatusChip = (status: string) => {
    return status === 'active' 
      ? <Chip label="Đang hoạt động" color="success" size="small" variant="outlined" />
      : <Chip label="Đã khóa" color="default" size="small" />;
  };

  return (
    <Box>
      <Card sx={{ p: 4, borderRadius: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Quản trị Người dùng Hệ thống 👤</Typography>
            <Typography variant="body2" color="text.secondary">Quản lý và kiểm soát toàn bộ tài khoản trên nền tảng Pickleball Hub.</Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, justifyContent: 'flex-end', minWidth: 300 }}>
            <TextField 
              size="small" 
              placeholder="Tìm tên, email, sđt..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              InputProps={{ startAdornment: <Search sx={{ color: 'text.disabled', mr: 1 }} /> }}
              sx={{ minWidth: 250 }}
            />
            <TextField 
              select 
              size="small" 
              label="Vai trò" 
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="user">Người dùng</MenuItem>
              <MenuItem value="owner">Chủ sân</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField 
              select 
              size="small" 
              label="Trạng thái" 
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Đã khóa</MenuItem>
            </TextField>
          </Stack>
        </Box>

        {isLoading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Thông tin cá nhân</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vai trò</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Số dư / Điểm</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ngày gia nhập</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
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
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <PhoneIcon sx={{ fontSize: 12, mr: 0.5 }} /> {user.phone || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{getRoleChip(user.role)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F1F5F9', px: 1, py: 0.5, borderRadius: 1 }}>
                            <Wallet sx={{ fontSize: 14, mr: 0.5, color: 'primary.main' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {new Intl.NumberFormat('vi-VN').format(user.wallet_balance || 0)}đ
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">| {user.points || 0} pts</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" sx={{ mt: 1 }}>
                          <Loyalty sx={{ mr: 1, color: 
                            user?.member_rank === 'platinum' ? '#E5E4E2' : 
                            user?.member_rank === 'gold' ? '#FFD700' : 
                            user?.member_rank === 'silver' ? '#C0C0C0' : '#CD7F32'
                          , fontSize: '1.2rem' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Hạng: {
                              user?.member_rank === 'platinum' ? 'Bạch Kim' :
                              user?.member_rank === 'gold' ? 'Vàng' :
                              user?.member_rank === 'silver' ? 'Bạc' : 'Đồng'
                            }
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(user.status)}</TableCell>
                      <TableCell align="right">
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
                          <Tooltip title="Xem chi tiết">
                            <IconButton size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                        <Person sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">Không tìm thấy người dùng nào phù hợp kết quả tìm kiếm.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={(_, val) => setPage(val)} 
                color="primary" 
                size="large"
                sx={{ '& .MuiPaginationItem-root': { fontWeight: 700 } }}
              />
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
};

export default AdminUsers;
