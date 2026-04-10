import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Box, Card, Typography, Chip, 
  Button, TextField, MenuItem, Stack,
  IconButton, Tooltip 
} from '@mui/material';
import { Search, Person } from '@mui/icons-material';
import { ownerApi } from '@/api/ownerApi';
import DataTable, { Column } from '@/components/DataTable';
import WalkInBookingModal from '@/components/WalkInBookingModal';
import CheckInModal from '@/components/CheckInModal';
import IncidentReportModal from '@/components/IncidentReportModal';
import { CheckCircle, ErrorOutline } from '@mui/icons-material';

const OwnerBookings = () => {
  const { venueId }: any = useOutletContext();
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);
  const [activeCode, setActiveCode] = useState('');
  const [activeCourtId, setActiveCourtId] = useState<number | string>('');
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
    confirmed: { label: 'Đã thanh toán', color: 'success' },
    cancelled: { label: 'Đã hủy', color: 'error' },
    completed: { label: 'Hoàn thành', color: 'info' },
    checked_in: { label: 'Đã check-in', color: 'success' }
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.user?.name || row.customer_name}</Typography>
          <Typography variant="caption" color="text.secondary">{row.user?.phone || row.customer_phone}</Typography>
          <Typography variant="caption" color="text.secondary">{row.user?.email || row.customer_email}</Typography>
        </Box>
      )
    },
    {
      key: 'court',
      label: 'SÂN / GIỜ',
      render: (row) => {
        const slots = row.slots || [];
        if (slots.length === 0) return <Typography variant="caption" color="text.secondary">N/A</Typography>;

        const uniqueCourts = Array.from(new Set(slots.map((s: any) => s.court?.name))).filter(Boolean);
        const bookingDate = slots[0]?.date ? new Date(slots[0].date).toLocaleDateString('vi-VN') : new Date(row.createdAt).toLocaleDateString('vi-VN');
        
        // Find min start and max end
        const times = slots.map((s: any) => s.start_time);
        const endTimes = slots.map((s: any) => s.end_time);
        const startTime = times.sort()[0]?.slice(0, 5);
        const endTime = endTimes.sort().reverse()[0]?.slice(0, 5);

        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {uniqueCourts.length > 0 ? uniqueCourts.join(', ') : 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
              {bookingDate}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800 }}>
              {startTime} - {endTime}
            </Typography>
          </Box>
        );
      }
    },
    {
      key: 'total_price',
      label: 'THÀNH TIỀN',
      render: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 900 }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.total_price)}
          </Typography>
          <Typography variant="caption" color="red">Thực nhận: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.owner_revenue)}</Typography>
        </Box>
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
      label: 'HÀNH ĐỘNG',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {row.status === 'confirmed' && (
            <Tooltip title="Check-in nhanh">
              <IconButton 
                size="small" 
                color="success" 
                onClick={() => {
                  setActiveCode(row.booking_code);
                  setIsCheckInOpen(true);
                }}
                sx={{ bgcolor: '#F0FDF4' }}
              >
                <CheckCircle sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Báo cáo sự cố">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => {
                const courtId = row.slots?.[0]?.court?.id;
                setActiveCourtId(courtId || '');
                setIsIncidentOpen(true);
              }}
              sx={{ bgcolor: '#FEF2F2' }}
            >
              <ErrorOutline sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" component={Link} to={`/owner/bookings/${row.booking_code}`} sx={{ bgcolor: '#F1F5F9' }}>
               <Search sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Box>
      <Card sx={{ p: 4, borderRadius: 3, border: '1px solid #F1F5F9', boxShadow: 'none' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 950, fontFamily: 'Times New Roman' }}>Lịch sử Đặt sân 📅</Typography>
            <Typography variant="body2" color="text.secondary">Quản lý và theo dõi tất cả các đơn đặt sân của cơ sở.</Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<Person />}
            onClick={() => setIsWalkInModalOpen(true)}
            sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
          >
            Tạo đơn nhanh (Walk-in)
          </Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
          {/* ... existing textfields ... */}
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
            <MenuItem value="confirmed">Đã n</MenuItem>
            <MenuItem value="completed">Hoàn thành</MenuItem>
            <MenuItem value="cancelled">Đã hủy</MenuItem>
            <MenuItem value="checked_in">Đã check-in</MenuItem>
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

      <WalkInBookingModal 
        open={isWalkInModalOpen} 
        onClose={() => setIsWalkInModalOpen(false)} 
        venueId={venueId} 
      />

      <CheckInModal 
        open={isCheckInOpen} 
        onClose={() => {
          setIsCheckInOpen(false);
          setActiveCode('');
        }}
        initialCode={activeCode}
      />

      <IncidentReportModal 
        open={isIncidentOpen}
        onClose={() => {
          setIsIncidentOpen(false);
          setActiveCourtId('');
        }}
        venueId={venueId}
        initialCourtId={activeCourtId}
      />
    </Box>
  );
};

export default OwnerBookings;
