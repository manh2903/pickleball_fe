import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, TextField, MenuItem, Stack, Chip
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { adminApi } from '@/api/adminApi';
import DataTable, { Column } from '@/components/DataTable';
import AdminFilterBar from '@/components/AdminFilterBar';

const bookingStatusMap: Record<string, { label: string; color: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  pending: { label: 'Chờ xử lý', color: 'warning' },
  confirmed: { label: 'Đã xác nhận', color: 'success' },
  checked_in: { label: 'Đã check-in', color: 'info' },
  completed: { label: 'Hoàn thành', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
  no_show: { label: 'Không đến', color: 'default' },
};

const paymentStatusMap: Record<string, { label: string; color: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  unpaid: { label: 'Chưa thanh toán', color: 'warning' },
  partial: { label: 'Thanh toán một phần', color: 'info' },
  paid: { label: 'Đã thanh toán', color: 'success' },
  refunded: { label: 'Đã hoàn tiền', color: 'default' },
};

const AdminBookings = () => {
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [bookingType, setBookingType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: bookingsRes, isLoading } = useQuery({
    queryKey: ['admin-bookings', status, paymentStatus, bookingType, search, page, rowsPerPage],
    queryFn: () => adminApi.getBookings({
      status,
      payment_status: paymentStatus,
      booking_type: bookingType,
      search,
      page: page + 1,
      limit: rowsPerPage,
    }),
  });

  const bookings = bookingsRes?.data?.bookings || [];
  const total = bookingsRes?.data?.total || 0;

  const columns: Column<any>[] = [
    {
      key: 'booking',
      label: 'Đơn đặt',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
            #{row.booking_code}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(row.createdAt || row.created_at).toLocaleString('vi-VN')}
          </Typography>
        </Box>
      )
    },
    {
      key: 'venue',
      label: 'Cơ sở / Chủ sân',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.venue?.name || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Chủ sân: {row.venue?.owner?.name || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.user?.name || row.customer_name || 'Khách walk-in'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.user?.phone || row.customer_phone || row.user?.email || row.customer_email || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'schedule',
      label: 'Sân / Lịch',
      render: (row) => {
        const slots = row.slots || [];
        const firstSlot = slots[0];
        const date = firstSlot?.date ? new Date(firstSlot.date).toLocaleDateString('vi-VN') : 'N/A';
        const courtNames = Array.from(new Set(slots.map((slot: any) => slot.court?.name).filter(Boolean)));
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {courtNames.join(', ') || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {date}
            </Typography>
          </Box>
        );
      }
    },
    {
      key: 'amount',
      label: 'Thanh toán',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 900 }}>
            {new Intl.NumberFormat('vi-VN').format(row.total_price || 0)}đ
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.payment_method?.toUpperCase() || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <Stack spacing={0.5}>
          <Chip
            label={bookingStatusMap[row.status]?.label || row.status}
            color={bookingStatusMap[row.status]?.color || 'default'}
            size="small"
            sx={{ fontWeight: 700, width: 'fit-content' }}
          />
          <Chip
            label={paymentStatusMap[row.payment_status]?.label || row.payment_status}
            color={paymentStatusMap[row.payment_status]?.color || 'default'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700, width: 'fit-content' }}
          />
        </Stack>
      )
    }
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 950, mb: 1, letterSpacing: -1 }}>
        Theo dõi Đặt Sân Toàn Hệ Thống
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
        Theo dõi booking online, walk-in, trạng thái vận hành và thanh toán toàn nền tảng.
      </Typography>

      <AdminFilterBar
        search={search}
        onSearchChange={(val: string) => { setSearch(val); setPage(0); }}
        searchPlaceholder="Tìm mã đơn, khách hàng, cơ sở..."
        onReset={() => {
          setSearch('');
          setStatus('all');
          setPaymentStatus('all');
          setBookingType('all');
          setPage(0);
        }}
        disableReset={search === '' && status === 'all' && paymentStatus === 'all' && bookingType === 'all'}
      >
        <TextField select size="small" label="Trạng thái" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} sx={{ minWidth: 160 }}>
          <MenuItem value="all">Tất cả trạng thái</MenuItem>
          <MenuItem value="pending">Chờ xử lý</MenuItem>
          <MenuItem value="confirmed">Đã xác nhận</MenuItem>
          <MenuItem value="checked_in">Đã check-in</MenuItem>
          <MenuItem value="completed">Hoàn thành</MenuItem>
          <MenuItem value="cancelled">Đã hủy</MenuItem>
          <MenuItem value="no_show">Không đến</MenuItem>
        </TextField>
        <TextField select size="small" label="Thanh toán" value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(0); }} sx={{ minWidth: 160 }}>
          <MenuItem value="all">Tất cả thanh toán</MenuItem>
          <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
          <MenuItem value="partial">Một phần</MenuItem>
          <MenuItem value="paid">Đã thanh toán</MenuItem>
          <MenuItem value="refunded">Đã hoàn tiền</MenuItem>
        </TextField>
        <TextField select size="small" label="Loại đơn" value={bookingType} onChange={(e) => { setBookingType(e.target.value); setPage(0); }} sx={{ minWidth: 140 }}>
          <MenuItem value="all">Tất cả loại</MenuItem>
          <MenuItem value="online">Online</MenuItem>
          <MenuItem value="walkin">Walk-in</MenuItem>
        </TextField>
      </AdminFilterBar>

      <Box sx={{ mt: 3 }}>
        <DataTable
          columns={columns}
          data={bookings}
          isLoading={isLoading}
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          emptyMessage="Chưa có booking nào phù hợp bộ lọc."
        />
      </Box>
    </Box>
  );
};

export default AdminBookings;
