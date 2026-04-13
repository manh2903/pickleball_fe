import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Card, Typography, TextField, 
  IconButton, Chip, Stack, MenuItem, 
  Tooltip, Avatar, Tabs, Tab
} from '@mui/material';
import { 
  Search, Block, CheckCircle, Visibility, 
  Email, Phone as PhoneIcon, Security, Badge, Wallet
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminApi } from '@/api/adminApi';
import DataTable, { Column } from '@/components/DataTable';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0); // DataTable uses 0-based paging for MUI TablePagination logic usually, or I adapt.
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['admin-users', role, status, search, page, rowsPerPage],
    queryFn: () => adminApi.getUsers({ role, status, search, page: page + 1, limit: rowsPerPage })
  });

  const users = usersRes?.data?.users || [];
  const totalUsers = usersRes?.data?.total || 0;

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
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ fontSize: 12, mr: 0.5 }} /> {user.phone || 'N/A'}
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
          label={user.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'} 
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
          <Tooltip title="Xem chi tiết">
            <IconButton size="small">
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

        <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField 
            size="small" 
            placeholder="Tìm tên, email, sđt..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ 
               startAdornment: <Search sx={{ color: 'text.disabled', mr: 1 }} />,
               sx: { borderRadius: 2 }
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <TextField 
            select 
            size="small" 
            label="Trạng thái" 
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            <MenuItem value="active">Đang hoạt động</MenuItem>
            <MenuItem value="inactive">Đã khóa</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ px: 3, pb: 3 }}>
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
    </Box>
  );
};

export default AdminUsers;
