import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Card, Typography, Button, IconButton, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Stack, MenuItem,
  Tooltip, Grid, FormControlLabel, Checkbox, FormGroup,
  InputAdornment, Paper, Avatar 
} from '@mui/material';
import { 
  Add, Edit, Delete, SportsTennis, Info,
  Payments, Settings, Layers
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { ownerApi } from '@/api/ownerApi';
import DataTable, { Column } from '@/components/DataTable';
import { useAuthStore } from '@/stores/authStore';

const OwnerCourts = () => {
  const { venueId }: any = useOutletContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthStore();
  const isStaff = user?.role === 'staff';
  
  // Pagination & Filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog Open
  const [open, setOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    type: 'double', // Khớp ENUM: single, double, quad
    status: 'active',
    description: '',
    price_morning: '',
    price_afternoon: '',
    price_evening: '',
    amenities: []
  });

  const { data: courtsData, isLoading: isLoadingCourts } = useQuery({ 
    queryKey: ['owner-courts', venueId], 
    queryFn: () => venueId ? ownerApi.getCourts(venueId) : Promise.reject('No venue'),
    enabled: !!venueId
  });

  const { data: venueRes } = useQuery({
    queryKey: ['owner-venue-current', venueId],
    queryFn: () => venueId ? ownerApi.getVenue(venueId) : Promise.reject('No venue'),
    enabled: !!venueId
  });

  const courts = courtsData?.data || [];
  const venue = venueRes?.data;

  const paginatedCourts = courts.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => ownerApi.createCourt(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-courts'] });
      handleClose();
      enqueueSnackbar('Thêm sân con mới thành công!', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Thêm sân con thất bại!', { variant: 'error' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => ownerApi.updateCourt(venueId, selectedCourt.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-courts'] });
      handleClose();
      enqueueSnackbar('Cập nhật cấu hình sân thành công!', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Cập nhật cấu hình sân thất bại!', { variant: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ownerApi.deleteCourt(venueId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-courts'] });
      enqueueSnackbar('Đã thay đổi trạng thái hoạt động của sân', { variant: 'info' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Thay đổi trạng thái hoạt động của sân thất bại!', { variant: 'error' });
    }
  });

  const handleOpen = (court: any = null) => {
    if (court) {
      setSelectedCourt(court);
      setFormData({
        name: court.name,
        type: court.type,
        status: court.status,
        description: court.description || '',
        price_morning: court.price_morning || '',
        price_afternoon: court.price_afternoon || '',
        price_evening: court.price_evening || '',
        amenities: court.amenities || []
      });
    } else {
      setSelectedCourt(null);
      setFormData({
        name: '',
        type: 'double',
        status: 'active',
        description: '',
        price_morning: '',
        price_afternoon: '',
        price_evening: '',
        amenities: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCourt(null);
  };

  const handleAmenityChange = (val: string) => {
    const newAmenities = formData.amenities.includes(val)
      ? formData.amenities.filter((a: string) => a !== val)
      : [...formData.amenities, val];
    setFormData({ ...formData, amenities: newAmenities });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price_morning: formData.price_morning ? Number(formData.price_morning) : null,
      price_afternoon: formData.price_afternoon ? Number(formData.price_afternoon) : null,
      price_evening: formData.price_evening ? Number(formData.price_evening) : null,
    };
    if (selectedCourt) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const COURT_TYPE_LABELS: any = { single: 'Sân đơn (2 người)', double: 'Sân đôi (4 người)', quad: 'Sân tứ (8 người)' };
  const AMENITIES_OPTIONS = ['Đèn LED', 'Mái che', 'Điều hòa', 'VIP', 'Gần nhà vệ sinh'];

  const PriceDisplay = ({ amount, venueDefault, label, timeRange }: any) => {
    const isOverridden = amount !== null && amount !== undefined && amount !== '';
    const finalAmount = isOverridden ? amount : venueDefault;
    
    return (
      <Box sx={{ mb: 0.5 }}>
         <Typography variant="caption" sx={{ fontWeight: 900, color: isOverridden ? 'primary.main' : 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {label} <b>{new Intl.NumberFormat('vi-VN').format(finalAmount || 0)}đ</b>
            {!isOverridden && <span style={{ color: '#64748B', fontWeight: 700, fontSize: 10 }}>(Cơ sở)</span>}
         </Typography>
         <Typography variant="caption" sx={{ fontSize: 10, color: 'text.primary', fontWeight: 700, display: 'block', mt: -0.2 }}>{timeRange}</Typography>
      </Box>
    );
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'THÔNG TIN SÂN',
      render: (court) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: 'primary.main', width: 44, height: 44 }}>
            <SportsTennis />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>{court.name}</Typography>
            <Stack direction="row" spacing={0.5}>
              {court.amenities?.map((a: string) => (
                <Chip key={a} label={a} size="small" sx={{ height: 16, fontSize: 9, fontWeight: 700 }} />
              ))}
            </Stack>
          </Box>
        </Stack>
      )
    },
    {
      key: 'type',
      label: 'LOẠI SÂN',
      render: (court) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{COURT_TYPE_LABELS[court.type] || court.type}</Typography>
      )
    },
    {
      key: 'pricing',
      label: 'BẢNG GIÁ HIỆN TẠI',
      render: (court) => (
        <Box>
          <PriceDisplay amount={court.price_morning} venueDefault={venue?.default_price_morning} label="☀️" timeRange="06:00 - 11:00" />
          <PriceDisplay amount={court.price_afternoon} venueDefault={venue?.default_price_afternoon} label="⛅" timeRange="11:00 - 17:00" />
          <PriceDisplay amount={court.price_evening} venueDefault={venue?.default_price_evening} label="🌙" timeRange="17:00 - 22:00" />
        </Box>
      )
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      render: (court) => (
        <Chip 
          label={court.status === 'active' ? 'Hoạt động' : (court.status === 'maintenance' ? 'Bảo trì' : 'Đóng cửa')} 
          color={court.status === 'active' ? 'success' : (court.status === 'maintenance' ? 'warning' : 'default')}
          size="small"
          sx={{ fontWeight: 800, fontSize: 10 }}
        />
      )
    },
    {
       key: 'actions',
       label: 'THAO TÁC',
       align: 'right',
       render: (court) => (
         <Box>
            <Tooltip title="Sửa cấu hình">
               <IconButton color="primary" onClick={() => handleOpen(court)}>
                  <Edit fontSize="small" />
               </IconButton>
            </Tooltip>
            <Tooltip title="Ngừng hoạt động / Xóa">
               <IconButton color="error" onClick={() => deleteMutation.mutate(court.id)}>
                  <Delete fontSize="small" />
               </IconButton>
            </Tooltip>
         </Box>
       )
    }
  ].filter(col => !isStaff || col.key !== 'actions');

  return (
    <Box>
      <Card sx={{ p: 4, borderRadius: 3, border: '1px solid #F1F5F9', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 950, fontFamily: 'Times New Roman' }}>Quản lý Danh sách Sân con 🏸</Typography>
            <Typography variant="body2" color="text.secondary">Giá được in đậm nếu ghi đè riêng cho sân này.</Typography>
          </Box>
          {!isStaff && (
            <Button 
              variant="contained" 
              disableElevation
              startIcon={<Add />} 
              onClick={() => handleOpen()}
              sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: 900 }}
            >
              THÊM SÂN MỚI
            </Button>
          )}
        </Box>

        <DataTable 
          columns={columns}
          data={paginatedCourts}
          isLoading={isLoadingCourts}
          count={courts.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, val) => setPage(val)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          emptyMessage="Chưa có sân con nào được cấu hình."
        />
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ py: 3, bgcolor: '#0F172A', color: 'white' }}>
            <Stack direction="row" spacing={2} alignItems="center">
               <Settings />
               <Typography variant="h6" sx={{ fontWeight: 900 }}>{selectedCourt ? 'CHỈNH SỬA CẤU HÌNH SÂN' : 'TẠO MỚI SÂN CON'}</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 4 }}>
            <Grid container spacing={4} sx={{ mt: 0 }}>
               {/* Left Column: General */}
               <Grid item xs={12} md={7}>
                  <Stack spacing={3}>
                     <Typography variant="subtitle2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info fontSize="small" color="primary" /> THÔNG TIN CƠ BẢN
                     </Typography>
                     <TextField 
                        label="Tên sân con" required fullWidth 
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="VD: Sân số 01 - VIP"
                        InputProps={{ sx: { borderRadius: 3 } }}
                     />
                     <Stack direction="row" spacing={2}>
                        <TextField 
                           select label="Loại sân (DB Enum)" fullWidth required
                           value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                           InputProps={{ sx: { borderRadius: 3 } }}
                        >
                           <MenuItem value="single">Sân đơn (Single)</MenuItem>
                           <MenuItem value="double">Sân đôi (Double)</MenuItem>
                           <MenuItem value="quad">Sân tứ (Quad)</MenuItem>
                        </TextField>
                        <TextField 
                           select label="Trạng thái" fullWidth required
                           value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                           InputProps={{ sx: { borderRadius: 3 } }}
                        >
                           <MenuItem value="active">Đang hoạt động</MenuItem>
                           <MenuItem value="maintenance">Đang bảo trì</MenuItem>
                           <MenuItem value="inactive">Đã đóng cửa</MenuItem>
                        </TextField>
                     </Stack>
                     <TextField 
                        label="Mô tả & Ghi chú" fullWidth multiline rows={3}
                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Nhập các đặc điểm nổi bật của sân..."
                        InputProps={{ sx: { borderRadius: 3 } }}
                     />
                     
                     <Typography variant="subtitle2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                        <Layers fontSize="small" color="primary" /> TIỆN ÍCH RIÊNG
                     </Typography>
                     <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        {AMENITIES_OPTIONS.map((item) => (
                           <FormControlLabel 
                              key={item}
                              control={<Checkbox checked={formData.amenities.includes(item)} onChange={() => handleAmenityChange(item)} />} 
                              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>{item}</Typography>} 
                           />
                        ))}
                     </FormGroup>
                  </Stack>
               </Grid>

               {/* Right Column: Pricing */}
               <Grid item xs={12} md={5}>
                  <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, bgcolor: '#F8FAFC', height: '100%' }}>
                     <Typography variant="subtitle2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Payments fontSize="small" color="primary" /> GIÁ OVERRIDE (VNĐ)
                     </Typography>
                     <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3, fontWeight: 500 }}>
                        * Để trống nếu muốn áp dụng giá mặc định của cơ sở.
                     </Typography>
                     <Stack spacing={3}>
                        <TextField 
                           label="Giá Sáng (6h-11h)" type="number" fullWidth
                           value={formData.price_morning} onChange={(e) => setFormData({ ...formData, price_morning: e.target.value })}
                           InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3, bgcolor: 'white' } }}
                        />
                        <TextField 
                           label="Giá Chiều (11h-17h)" type="number" fullWidth
                           value={formData.price_afternoon} onChange={(e) => setFormData({ ...formData, price_afternoon: e.target.value })}
                           InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3, bgcolor: 'white' } }}
                        />
                        <TextField 
                           label="Giá Tối (17h-22h)" type="number" fullWidth
                           value={formData.price_evening} onChange={(e) => setFormData({ ...formData, price_evening: e.target.value })}
                           InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3, bgcolor: 'white' } }}
                        />
                     </Stack>
                  </Paper>
               </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, bgcolor: '#F8FAFC' }}>
            <Button onClick={handleClose} variant="text" sx={{ fontWeight: 800 }}>HỦY BỎ</Button>
            <Button 
               type="submit" variant="contained" disableElevation
               disabled={createMutation.isPending || updateMutation.isPending}
               sx={{ px: 6, py: 1.2, borderRadius: 2, fontWeight: 900 }}
            >
               {selectedCourt ? 'CẬP NHẬT CẤU HÌNH' : 'XÁC NHẬN TẠO SÂN'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default OwnerCourts;
