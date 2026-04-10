import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Typography, Card, Grid, Stack, Button, 
  Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Tooltip
} from '@mui/material';
import { 
  Add, ConfirmationNumber, 
  ContentCopy,
  ToggleOn, ToggleOff
} from '@mui/icons-material';
import { useState } from 'react';
import { couponApi } from '@/api/couponApi';
import { ownerApi } from '@/api/ownerApi';
import { useSnackbar } from 'notistack';
import DataTable, { Column } from '@/components/DataTable';

const OwnerCoupons = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState('');
  
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
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage_limit: '',
    venue_id: ''
  });

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Queries
  const { data: venuesRes } = useQuery({
    queryKey: ['owner-venues'],
    queryFn: () => ownerApi.getVenues(),
  });

  const { data: couponsRes, isLoading } = useQuery({
    queryKey: ['owner-coupons', selectedVenue],
    queryFn: () => couponApi.getOwnerCoupons(selectedVenue),
  });

  const venues = venuesRes?.data || [];
  const coupons = couponsRes?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => couponApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-coupons'] });
      enqueueSnackbar('Tạo mã giảm giá thành công', { variant: 'success' });
      setOpenAdd(false);
      setFormData({
         code: '', discount_type: 'percentage', discount_value: '',
         min_booking_amount: '0', max_discount_amount: '',
         start_date: new Date().toISOString().split('T')[0],
         end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
         usage_limit: '', venue_id: ''
      });
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi tạo mã', { variant: 'error' })
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => couponApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-coupons'] });
      enqueueSnackbar('Đã cập nhật trạng thái mã', { variant: 'success' });
    }
  });

  const handleCreate = () => {
    if (!formData.venue_id) return enqueueSnackbar('Vui lòng chọn cơ sở áp dụng', { variant: 'warning' });
    createMutation.mutate(formData);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    enqueueSnackbar('Đã sao chép mã: ' + code, { variant: 'success' });
  };

  // DataTable Columns Definition
  const columns: Column<any>[] = [
    {
      key: 'code',
      label: 'Mã / Loại',
      render: (c) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ p: 1, bgcolor: '#F0F9FF', color: 'primary.main', borderRadius: 1, display: 'flex' }}>
             <ConfirmationNumber fontSize="small" />
          </Box>
          <Box>
             <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>{c.code}</Typography>
             <Typography variant="caption" color="text.secondary">Min: {new Intl.NumberFormat('vi-VN').format(c.min_booking_amount)}đ</Typography>
          </Box>
          <IconButton size="small" onClick={() => copyCode(c.code)}><ContentCopy sx={{ fontSize: '0.8rem' }} /></IconButton>
        </Stack>
      )
    },
    {
      key: 'discount_value',
      label: 'Giá trị giảm',
      render: (c) => (
        <Typography sx={{ fontWeight: 800 }}>
           {c.discount_type === 'percentage' ? `${c.discount_value}%` : `${new Intl.NumberFormat('vi-VN').format(c.discount_value)}đ`}
        </Typography>
      )
    },
    {
      key: 'date',
      label: 'Thời hạn',
      render: (c) => (
        <Box>
           <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>TỪ: {new Date(c.start_date).toLocaleDateString('vi-VN')}</Typography>
           <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>ĐẾN: {new Date(c.end_date).toLocaleDateString('vi-VN')}</Typography>
        </Box>
      )
    },
    {
      key: 'usage',
      label: 'Lượt dùng',
      render: (c) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.used_count} / {c.usage_limit || '∞'}</Typography>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (c) => (
        <Chip 
          label={c.status === 'active' ? 'ĐANG CHẠY' : 'DỪNG'} 
          color={c.status === 'active' ? 'success' : 'default'} 
          size="small" 
          sx={{ fontWeight: 800, fontSize: '0.65rem' }} 
        />
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      align: 'right',
      render: (c) => (
        <Tooltip title={c.status === 'active' ? 'Tạm dừng' : 'Kích hoạt lại'}>
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
            Chương trình Khuyến mãi 🏷️
          </Typography>
          <Typography variant="body2" color="text.secondary">Tạo các mã giảm giá để thu hút người chơi mới.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAdd(true)} sx={{ borderRadius: 2, fontWeight: 700 }}>
          TẠO MÃ MỚI
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 3, borderRadius: 2 }}>
         <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Lọc theo cơ sở</InputLabel>
            <Select 
              value={selectedVenue} 
              label="Lọc theo cơ sở" 
              onChange={(e) => {
                setSelectedVenue(e.target.value);
                setPage(0);
              }}
              size="small"
            >
               <MenuItem value="">Tất cả cơ sở</MenuItem>
               {venues.map((v: any) => (
                 <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
               ))}
            </Select>
         </FormControl>
      </Card>

      <DataTable 
        columns={columns}
        data={coupons.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        count={coupons.length}
        page={page}
        rowsPerPage={rowsPerPage}
        isLoading={isLoading}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        emptyMessage="Bạn chưa có mã giảm giá nào."
      />

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Times New Roman' }}>Tạo chương trình khuyến mãi mới</DialogTitle>
        <DialogContent dividers>
           <Stack spacing={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Áp dụng tại cơ sở</InputLabel>
                <Select 
                  value={formData.venue_id} 
                  label="Áp dụng tại cơ sở" 
                  onChange={(e) => setFormData({...formData, venue_id: e.target.value})}
                >
                   {venues.map((v: any) => (
                     <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                   ))}
                </Select>
              </FormControl>

              <TextField 
                fullWidth label="Mã giảm giá (VD: PICKLE10)" 
                size="small"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                helperText="Khách hàng sẽ nhập mã này khi thanh toán."
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
                      size="small" type="number" placeholder="Để trống nếu không giới hạn"
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
              PHÁT HÀNH MÃ
           </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OwnerCoupons;
