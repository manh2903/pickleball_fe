import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Box, Card, Typography, Chip, 
  Button, TextField, MenuItem, Stack 
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { ownerApi } from '@/api/ownerApi';
import DataTable, { Column } from '@/components/DataTable';

const OwnerBookings = () => {
  const { venueId }: any = useOutletContext();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['owner-bookings', venueId, page, rowsPerPage, status, search],
    queryFn: () => ownerApi.getBookings({ 
      venue_id: venueId, 
      page: page + 1, 
      limit: rowsPerPage, 
      status: status === 'all' ? undefined : status,
      search: search || undefined
    }),
    enabled: !!venueId,
  });

  const bookings = data?.data?.bookings || [];
  const total = data?.data?.total || 0;

  const STATUS_LABELS: any = {
    pending: { label: 'Chờ thanh toán', color: 'warning' },
    confirmed: { label: 'Đã xác nhận', color: 'success' },
    cancelled: { label: 'Đã hủy', color: 'error' },
    completed: { label: 'Hoàn thành', color: 'info' }
  };

  const columns: Column<any>[] = [
    {
      key: 'code',
      label: 'MÃ ĐƠN / NGÀY',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>#{row.booking_code}</Typography>
          <Typography variant="caption" color="text.secondary">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</Typography>
        </Box>
      )
    },
    {
      key: 'customer',
      label: 'KHÁCH HÀNG',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.user?.name}</Typography>
          <Typography variant="caption" color="text.secondary">{row.user?.phone}</Typography>
        </Box>
      )
    },
    {
      key: 'court',
      label: 'SÂN / GIỜ',
      render: (row) => {
        const slots = row.slots || [];
        const uniqueCourts = Array.from(new Set(slots.map((s: any) => s.court?.name))).filter(Boolean);
        const startTime = slots[0]?.start_time?.slice(0, 5);
        const endTime = slots[slots.length - 1]?.end_time?.slice(0, 5);

        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {uniqueCourts.join(', ') || 'N/A'}
            </Typography>
            <Typography variant="caption" display="block">
              {slots[0]?.date ? new Date(slots[0].date).toLocaleDateString('vi-VN') : ''} | {startTime} - {endTime}
            </Typography>
          </Box>
        );
      }
    },
    {
      key: 'total_price',
      label: 'THÀNH TIỀN',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 900 }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.total_price)}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      render: (row) => (
        <Chip 
          label={STATUS_LABELS[row.status]?.label || row.status} 
          color={STATUS_LABELS[row.status]?.color || 'default'} 
          size="small"
          sx={{ fontWeight: 800, fontSize: 10 }}
        />
      )
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      align: 'right',
      render: (row) => (
        <Button size="small" variant="outlined" component={Link} to={`/owner/bookings/${row.booking_code}`} sx={{ borderRadius: 1, fontWeight: 700 }}>
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <Box>
      <Card sx={{ p: 4, borderRadius: 3, border: '1px solid #F1F5F9', boxShadow: 'none' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 950, fontFamily: 'Times New Roman' }}>Lịch sử Đặt sân 📅</Typography>
          <Typography variant="body2" color="text.secondary">Quản lý và theo dõi tất cả các đơn đặt sân của cơ sở.</Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
          <TextField 
            size="small" 
            placeholder="Tìm kiếm mã đơn, tên khách..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{ startAdornment: <Search fontSize="small" color="action" sx={{ mr: 1 }} />, sx: { borderRadius: 2 } }}
          />
          <TextField
            select
            size="small"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{ sx: { borderRadius: 2 } }}
          >
            <MenuItem value="all">Tất cả trạng thái</MenuItem>
            <MenuItem value="pending">Chờ thanh toán</MenuItem>
            <MenuItem value="confirmed">Đã xác nhận</MenuItem>
            <MenuItem value="completed">Hoàn thành</MenuItem>
            <MenuItem value="cancelled">Đã hủy</MenuItem>
          </TextField>
        </Stack>

        <DataTable
          columns={columns}
          data={bookings}
          isLoading={isLoading}
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, val) => setPage(val)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Card>
    </Box>
  );
};

export default OwnerBookings;
