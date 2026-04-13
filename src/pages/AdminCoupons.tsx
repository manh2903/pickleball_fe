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
  Select,
  FormControl,
  InputLabel,
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
      enqueueSnackbar('Tao ma giam gia he thong thanh cong', { variant: 'success' });
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
    onError: (err: any) => enqueueSnackbar(err.message || 'Loi tao ma', { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminApi.updateCouponStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      enqueueSnackbar('Da cap nhat trang thai ma', { variant: 'success' });
    },
  });

  const handleCreate = () => {
    if (!formData.code || !formData.discount_value) {
      enqueueSnackbar('Vui long dien day du thong tin', { variant: 'warning' });
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
    enqueueSnackbar(`Da sao chep ma: ${code}`, { variant: 'success' });
  };

  const columns: Column<any>[] = [
    {
      key: 'scope',
      label: 'Pham vi',
      render: (c) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {c.type === 'platform' ? (
            <Chip
              icon={<Public sx={{ fontSize: '1rem !important' }} />}
              label="He thong"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Store sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {c.venue?.name || 'Co so'}
              </Typography>
            </Box>
          )}
        </Stack>
      ),
    },
    {
      key: 'code',
      label: 'Ma giam gia',
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
      label: 'Gia tri',
      render: (c) => (
        <Typography sx={{ fontWeight: 800 }}>
          {c.discount_type === 'percentage'
            ? `${c.discount_value}%`
            : `${new Intl.NumberFormat('vi-VN').format(c.discount_value)}d`}
        </Typography>
      ),
    },
    {
      key: 'creator',
      label: 'Nguoi tao',
      render: (c) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {c.creator?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {c.creator?.role}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Trang thai',
      render: (c) => (
        <Chip
          label={c.status.toUpperCase()}
          color={c.status === 'active' ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 800, fontSize: '0.65rem' }}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Quan ly',
      align: 'right',
      render: (c) => (
        <Tooltip title={c.status === 'active' ? 'Vo hieu hoa' : 'Kich hoat'}>
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
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>
            Quan ly Khuyen mai toan san
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin tao ma giam gia do he thong chi tra hoac quan ly ma cua cac san.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAdd(true)} sx={{ borderRadius: 2, fontWeight: 700 }}>
          TAO MA HE THONG
        </Button>
      </Box>

      <AdminFilterBar onReset={handleResetFilters} disableReset={!filterType && !filterStatus}>
        <FormControl sx={{ minWidth: 140 }} size="small">
          <InputLabel>Loai ma</InputLabel>
          <Select
            value={filterType}
            label="Loai ma"
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Tat ca</MenuItem>
            <MenuItem value="platform">Ma he thong</MenuItem>
            <MenuItem value="venue">Ma chu san</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140 }} size="small">
          <InputLabel>Trang thai</InputLabel>
          <Select
            value={filterStatus}
            label="Trang thai"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Tat ca</MenuItem>
            <MenuItem value="active">Dang kich hoat</MenuItem>
            <MenuItem value="inactive">Da dung</MenuItem>
          </Select>
        </FormControl>
      </AdminFilterBar>

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
      />

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>Tao ma giam gia toan he thong</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 700 }}>
            Ma nay ap dung cho tat ca cac san. Chi phi giam gia do he thong chiu.
          </Typography>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Ma giam gia"
              size="small"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Loai giam gia</InputLabel>
                  <Select
                    value={formData.discount_type}
                    label="Loai giam gia"
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  >
                    <MenuItem value="percentage">Theo phan tram (%)</MenuItem>
                    <MenuItem value="fixed">So tien co dinh</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Gia tri giam"
                  size="small"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Don toi thieu (VND)"
                  size="small"
                  type="number"
                  value={formData.min_booking_amount}
                  onChange={(e) => setFormData({ ...formData, min_booking_amount: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Gioi han luot dung"
                  size="small"
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Ngay bat dau"
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
                  label="Ngay ket thuc"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setOpenAdd(false)}>Huy</Button>
          <Button variant="contained" sx={{ fontWeight: 800 }} onClick={handleCreate} disabled={createMutation.isPending}>
            PHAT HANH
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCoupons;
