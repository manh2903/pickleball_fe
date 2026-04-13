import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Card, Typography, 
  IconButton, Chip, TextField, Stack, MenuItem, 
  Tooltip, Avatar
} from '@mui/material';
import { 
  CheckCircle, Cancel, 
  Visibility
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminApi } from '@/api/adminApi';
import DataTable, { Column } from '@/components/DataTable';
import AdminFilterBar from '@/components/AdminFilterBar';

const AdminVenues = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: venuesRes, isLoading } = useQuery({
    queryKey: ['admin-venues', statusFilter, search, page, rowsPerPage],
    queryFn: () => adminApi.getVenues({ status: statusFilter, search, page: page + 1, limit: rowsPerPage })
  });

  const venues = venuesRes?.data?.venues || [];
  const totalVenues = venuesRes?.data?.total || 0;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => adminApi.updateVenueStatus(id, status),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      enqueueSnackbar(res.data?.message || 'Cập nhật trạng thái thành công', { variant: 'success' });
    }
  });

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active': return <Chip label="Đang hoạt động" color="success" size="small" variant="outlined" sx={{ fontWeight: 800 }} />;
      case 'pending_review': return <Chip label="Chờ duyệt" color="warning" size="small" sx={{ fontWeight: 800 }} />;
      case 'suspended': return <Chip label="Đình chỉ" color="error" size="small" sx={{ fontWeight: 800 }} />;
      default: return <Chip label="Không hoạt động" color="default" size="small" sx={{ fontWeight: 800 }} />;
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'venue',
      label: 'Thông tin Địa điểm',
      render: (venue: any) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{venue.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {venue.address}
          </Typography>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
             Hotline: {venue.phone || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'owner',
      label: 'Chủ sở hữu',
      render: (venue: any) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 900, fontSize: '0.8rem' }}>
             {venue.owner?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{venue.owner?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{venue.owner?.email}</Typography>
          </Box>
        </Stack>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (venue: any) => getStatusChip(venue.status)
    },
    {
      key: 'actions',
      label: 'Hành động',
      align: 'right',
      render: (venue: any) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {venue.status === 'pending_review' && (
            <Tooltip title="Duyệt hoạt động">
              <IconButton 
                color="success" size="small"
                onClick={() => updateStatusMutation.mutate({ id: venue.id, status: 'active' })}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle />
              </IconButton>
            </Tooltip>
          )}
          {venue.status === 'active' && (
            <Tooltip title="Đình chỉ tạm thời">
              <IconButton 
                color="error" size="small"
                onClick={() => updateStatusMutation.mutate({ id: venue.id, status: 'suspended' })}
                disabled={updateStatusMutation.isPending}
              >
                <Cancel />
              </IconButton>
            </Tooltip>
          )}
          {venue.status === 'suspended' && (
            <Tooltip title="Mở khóa">
              <IconButton 
                color="success" size="small"
                onClick={() => updateStatusMutation.mutate({ id: venue.id, status: 'active' })}
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
        Phê duyệt Địa điểm & Đối tác 🏢
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
        Quản lý các cơ sở đăng ký mới và kiểm soát trạng thái vận hành toàn hệ thống.
      </Typography>

      <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
      <AdminFilterBar
        search={search}
        onSearchChange={(val: string) => { setSearch(val); setPage(0); }}
        searchPlaceholder="Tìm tên sân, địa chỉ..."
        onReset={() => {
          setSearch('');
          setStatusFilter('');
          setPage(0);
        }}
        disableReset={search === '' && statusFilter === ''}
      >
        <TextField 
          select 
          size="small" 
          label="Trạng thái" 
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        >
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          <MenuItem value="active">Đang hoạt động</MenuItem>
          <MenuItem value="pending_review">Chờ duyệt</MenuItem>
          <MenuItem value="suspended">Đã đình chỉ</MenuItem>
        </TextField>
      </AdminFilterBar>

      <Box sx={{ mt: 3 }}>
        <DataTable 
          columns={columns}
          data={venues}
          isLoading={isLoading}
          count={totalVenues}
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

export default AdminVenues;
