import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Card, Stack, Button, 
  Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Tooltip, Grid
} from '@mui/material';
import { 
  Add, 
  ContentCopy,
  ToggleOn, ToggleOff,
  Public, Store
} from '@mui/icons-material';
import { useState } from 'react';
import { adminApi } from '@/api/adminApi';
import { useSnackbar } from 'notistack';
import DataTable, { Column } from '@/components/DataTable';

const AdminCoupons = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // Pagination State
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
    usage_limit: ''
  });

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Queries
  const { data: couponsRes, isLoading } = useQuery({
    queryKey: ['admin-coupons', filterStatus, filterType, page, rowsPerPage],
    queryFn: () => adminApi.getCoupons({ 
      status: filterStatus, 
      type: filterType,
      page: page + 1,
      limit: rowsPerPage 
    }),
  });

  const coupons = couponsRes?.data?.coupons || [];
  const totalCount = couponsRes?.data?.total || 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      enqueueSnackbar('Tạo mã giảm giá hệ thống thành công', { variant: 'success' });
      setOpenAdd(false);
      setFormData({
         code: '', discount_type: 'percentage', discount_value: '',
         min_booking_amount: '0', max_discount_amount: '',
         start_date: new Date().toISOString().split('T')[0],
         end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
         usage_limit: ''
      });
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi tạo mã', { variant: 'error' })
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => adminApi.updateCouponStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      enqueueSnackbar('Đã cập nhật trạng thái mã', { variant: 'success' });
    }
  });

  const handleCreate = () => {
    if (!formData.code || !formData.discount_value) return enqueueSnackbar('Vui lòng điền đầy đủ thông tin', { variant: 'warning' });
    createMutation.mutate(formData);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    enqueueSnackbar('Đã sao chép mã: ' + code, { variant: 'success' });
  };

  // DataTable Columns Definition
  const columns: Column<any>[] = [
    {
      key: 'scope',
      label: 'Phạm vi',
      render: (c) => (
        <Stack direction="row" spacing={1} alignItems="center">
           {c.type === 'platform' ? (
             <Chip icon={<Public sx={{ fontSize: '1rem !important' }} />} label="Hệ thống" size="small" color="primary" variant="outlined" sx={{ fontWeight: 800 }} />
           ) : (
             <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Store sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.venue?.name || 'Cơ sở'}</Typography>
             </Box>
           )}
        </Stack>
      )
    },
    {
      key: 'code',
      label: 'Mã giảm giá',
      render: (c) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main', textDecoration: 'underline' }}>{c.code}</Typography>
          <IconButton size="small" onClick={() => copyCode(c.code)}><ContentCopy sx={{ fontSize: '0.8rem' }} /></IconButton>
        </Stack>
      )
    },
    {
      key: 'discount',
      label: 'Giá trị',
      render: (c) => (
        <Typography sx={{ fontWeight: 800 }}>
           {c.discount_type === 'percentage' ? `${c.discount_value}%` : `${new Intl.NumberFormat('vi-VN').format(c.discount_value)}đ`}
        </Typography>
      )
    },
    {
      key: 'creator',
      label: 'Người tạo',
      render: (c) => (
        <Box>
           <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.creator?.name}</Typography>
           <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{c.creator?.role}</Typography>
        </Box>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (c) => (
        <Chip 
          label={c.status.toUpperCase()} 
          color={c.status === 'active' ? 'success' : 'default'} 
          size="small" 
          sx={{ fontWeight: 800, fontSize: '0.65rem' }} 
        />
      )
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
             onClick={() => statusMutation.mutate({ id: c.id, status: c.status === 'active' ? 'inactive' : 'active' })}
           >
              {c.status === 'active' ? <ToggleOn /> : <ToggleOff />}
           </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>
            Quản lý Khuyến mãi toàn sàn 🏷️
          </Typography>
          <Typography variant="body2" color="text.secondary">Admin tạo mã giảm giá do hệ thống chi trả hoặc quản lý mã của các sân.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAdd(true)} sx={{ borderRadius: 2, fontWeight: 700 }}>
          TẠO MÃ HỆ THỐNG
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2 }}>
         <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Loại mã</InputLabel>
            <Select value={filterType} label="Loại mã" onChange={(e) => { setFilterType(e.target.value); setPage(0); }}>
               <MenuItem value="">Tất cả</MenuItem>
               <MenuItem value="platform">Mã hệ thống</MenuItem>
               <MenuItem value="venue">Mã chủ sân</MenuItem>
            </Select>
         </FormControl>
         <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Trạng thái</InputLabel>
            <Select value={filterStatus} label="Trạng thái" onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}>
               <MenuItem value="">Tất cả</MenuItem>
               <MenuItem value="active">Đang kích hoạt</MenuItem>
               <MenuItem value="inactive">Đã dừng</MenuItem>
            </Select>
         </FormControl>
      </Card>

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

      {/* Add Dialog (Admin only creates Platform coupons) */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>Tạo mã giảm giá toàn hệ thống</DialogTitle>
        <DialogContent dividers>
           <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 700 }}>
             * Lưu ý: Mã này áp dụng cho TẤT CẢ các sân. Chi phí giảm giá sẽ do hệ thống chịu.
           </Typography>
           <Stack spacing={3}>
              <TextField 
                fullWidth label="Mã giảm giá (VD: HELLO_PICKLE)" 
                size="small"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              />

              <Grid container spacing={2}>
                 <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Loại giảm giá</InputLabel>
                      <Select 
                        value={formData.discount_type} 
                        label="Loại giảm giá" 
                        onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                      >
                         <MenuItem value="percentage">Theo phần trăm (%)</MenuItem>
                         <MenuItem value="fixed">VND số tiền cụ thể</MenuItem>
                      </Select>
                    </FormControl>
                 </Grid>
                 <Grid item xs={6}>
                    <TextField 
                      fullWidth label="Giá trị giảm" 
                      size="small" type="number" 
                      value={formData.discount_value}
                      onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    />
                 </Grid>
              </Grid>

              <Grid container spacing={2}>
                 <Grid item xs={6}>
                    <TextField 
                      fullWidth label="Đơn tối thiểu (VND)" 
                      size="small" type="number" 
                      value={formData.min_booking_amount}
                      onChange={(e) => setFormData({...formData, min_booking_amount: e.target.value})}
                    />
                 </Grid>
                 <Grid item xs={6}>
                    <TextField 
                      fullWidth label="Giới hạn lượt dùng" 
                      size="small" type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    />
                 </Grid>
              </Grid>

              <Grid container spacing={2}>
                 <Grid item xs={6}>
                    <TextField 
                      fullWidth label="Ngày bắt đầu" 
                      type="date" size="small"
                      InputLabelProps={{ shrink: true }}
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                 </Grid>
                 <Grid item xs={6}>
                    <TextField 
                      fullWidth label="Ngày kết thúc" 
                      type="date" size="small"
                      InputLabelProps={{ shrink: true }}
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                 </Grid>
              </Grid>
           </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
           <Button onClick={() => setOpenAdd(false)}>Hủy</Button>
           <Button variant="contained" sx={{ fontWeight: 800 }} onClick={handleCreate} disabled={createMutation.isPending}>
              PHÁT HÀNH
           </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCoupons;
