import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  Grid,
} from '@mui/material';
import { Add, ContentCopy, ToggleOn, ToggleOff, Public, Store } from '@mui/icons-material';
import { useState } from 'react';
import { adminApi } from '@/api/adminApi';
import { useSnackbar } from 'notistack';
import DataTable, { Column } from '@/components/DataTable';
import AdminFilterBar from '@/components/AdminFilterBar';

const AdminCoupons = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_booking_amount: '0',
    max_discount_amount: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage_limit: '',
  });

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { data: couponsRes, isLoading } = useQuery({
    queryKey: ['admin-coupons', filterStatus, filterType, page, rowsPerPage],
    queryFn: () =>
      adminApi.getCoupons({
        status: filterStatus,
        type: filterType,
        page: page + 1,
        limit: rowsPerPage,
      }),
  });

  const coupons = couponsRes?.data?.coupons || [];
  const totalCount = couponsRes?.data?.total || 0;

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      enqueueSnackbar('Tạo mã giảm giá hệ thống thành công', { variant: 'success' });
      setOpenAdd(false);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_booking_amount: '0',
        max_discount_amount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usage_limit: '',
      });
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi tạo mã', { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminApi.updateCouponStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      enqueueSnackbar('Đã cập nhật trạng thái mã', { variant: 'success' });
    },
  });

  const handleCreate = () => {
    if (!formData.code || !formData.discount_value) {
      enqueueSnackbar('Vui lòng điền đầy đủ thông tin', { variant: 'warning' });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleResetFilters = () => {
    setFilterType('');
    setFilterStatus('');
    setPage(0);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    enqueueSnackbar(`Đã sao chép mã: ${code}`, { variant: 'success' });
  };

  const columns: Column<any>[] = [
    {
      key: 'scope',
      label: 'Phạm vi',
      render: (c) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {c.type === 'platform' ? (
            <Chip
              icon={<Public sx={{ fontSize: '1rem !important' }} />}
              label="Hệ thống"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Store sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {c.venue?.name || 'Cơ sở'}
              </Typography>
            </Box>
          )}
        </Stack>
      ),
    },
    {
      key: 'code',
      label: 'Mã giảm giá',
      render: (c) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main', textDecoration: 'underline' }}>
            {c.code}
          </Typography>
          <IconButton size="small" onClick={() => copyCode(c.code)}>
            <ContentCopy sx={{ fontSize: '0.8rem' }} />
          </IconButton>
        </Stack>
      ),
    },
    {
      key: 'discount',
      label: 'Giá trị',
      render: (c) => (
        <Typography sx={{ fontWeight: 800 }}>
          {c.discount_type === 'percentage'
            ? `${c.discount_value}%`
            : `${new Intl.NumberFormat('vi-VN').format(c.discount_value)}đ`}
        </Typography>
      ),
    },
    {
      key: 'creator',
      label: 'Người tạo',
      render: (c) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {c.creator?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {c.creator?.role === 'admin' ? 'Quản trị viên' : 'Chủ sân'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (c) => (
        <Chip
          label={c.status === 'active' ? 'ĐANG HOẠT ĐỘNG' : 'TẠM DỪNG'}
          color={c.status === 'active' ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 800, fontSize: '0.65rem' }}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Quản lý',
      align: 'right',
      render: (c) => (
        <Tooltip title={c.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
          <IconButton
            size="small"
            color={c.status === 'active' ? 'success' : 'default'}
            onClick={() =>
              statusMutation.mutate({
                id: c.id,
                status: c.status === 'active' ? 'inactive' : 'active',
              })
            }
          >
            {c.status === 'active' ? <ToggleOn /> : <ToggleOff />}
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -1 }}>
            Quản lý Khuyến mãi toàn sàn 🏷️
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Admin tạo mã giảm giá do hệ thống chi trả hoặc quản lý mã của các sân.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAdd(true)} sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}>
          Tạo mã hệ thống
        </Button>
      </Box>

      <AdminFilterBar onReset={handleResetFilters} disableReset={!filterType && !filterStatus}>
        <TextField
          select
          size="small"
          label="Loại coupon"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="platform">Mã hệ thống</MenuItem>
          <MenuItem value="venue">Mã chủ sân</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Trạng thái"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="active">Đang kích hoạt</MenuItem>
          <MenuItem value="inactive">Đã dừng</MenuItem>
        </TextField>
      </AdminFilterBar>

      <Box sx={{ mt: 3 }}>
        <DataTable
          columns={columns}
          data={coupons}
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          isLoading={isLoading}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          emptyMessage="Không tìm thấy mã giảm giá nào."
        />
      </Box>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Tạo mã giảm giá toàn hệ thống</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="caption" color="error" sx={{ mb: 3, fontWeight: 700, display: 'block', bgcolor: '#FFF1F2', p: 1.5, borderRadius: 1.5, border: '1px solid #FECACA' }}>
            ⚠️ Lưu ý: Mã này áp dụng cho tất cả các sân trên toàn hệ thống. Chi phí giảm giá do hệ thống chịu trách nhiệm chi trả.
          </Typography>
          
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mã giảm giá (VD: PICKLEBALL2024)"
                size="small"
                placeholder="Nhập mã viết liền không dấu..."
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Loại giảm giá"
                size="small"
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
              >
                <MenuItem value="percentage">Phần trăm (%)</MenuItem>
                <MenuItem value="fixed">Số tiền mặt (VNĐ)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Giá trị giảm"
                size="small"
                type="number"
                placeholder="0"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Đơn tối thiểu (VNĐ)"
                size="small"
                type="number"
                placeholder="0"
                value={formData.min_booking_amount}
                onChange={(e) => setFormData({ ...formData, min_booking_amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Số lượng mã tối đa"
                size="small"
                type="number"
                placeholder="Không giới hạn"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setOpenAdd(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>Hủy bỏ</Button>
          <Button variant="contained" sx={{ fontWeight: 800, textTransform: 'none' }} onClick={handleCreate} disabled={createMutation.isPending}>
            PHÁT HÀNH MÃ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCoupons;
