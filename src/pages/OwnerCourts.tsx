import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Card, Typography, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stack, MenuItem, CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  Add, Edit, Delete
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { ownerApi } from '@/api/ownerApi';

const OwnerCourts = () => {
  const { venueId }: any = useOutletContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  // States
  const [open, setOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'indoor',
    status: 'active',
    description: '',
    price_morning: '',
    price_afternoon: '',
    price_evening: '',
  });

  const { data: courtsData, isLoading } = useQuery({ 
    queryKey: ['owner-courts', venueId], 
    queryFn: () => venueId ? ownerApi.getCourts(venueId) : Promise.reject('No venue'),
    enabled: !!venueId
  });

  const courts = courtsData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => ownerApi.createCourt(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-courts'] });
      handleClose();
      enqueueSnackbar('Thêm sân thành công!', { variant: 'success' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => ownerApi.updateCourt(venueId, selectedCourt.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-courts'] });
      handleClose();
      enqueueSnackbar('Cập nhật thành công!', { variant: 'success' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ownerApi.deleteCourt(venueId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-courts'] });
      enqueueSnackbar('Đã chuyển sân sang trạng thái ngừng hoạt động', { variant: 'info' });
    }
  });

  // Handlers
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
      });
    } else {
      setSelectedCourt(null);
      setFormData({
        name: '',
        type: 'indoor',
        status: 'active',
        description: '',
        price_morning: '',
        price_afternoon: '',
        price_evening: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCourt(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price_morning: formData.price_morning ? Number(formData.price_morning) : null,
      price_afternoon: formData.price_afternoon ? Number(formData.price_afternoon) : null,
      price_evening: formData.price_evening ? Number(formData.price_evening) : null,
    };

    if (selectedCourt) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box>
      <Card sx={{ p: 4, borderRadius: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Quản lý Danh sách Sân 🏸</Typography>
            <Typography variant="body2" color="text.secondary">Thêm mới hoặc chỉnh sửa cấu hình các sân con thuộc cơ sở của bạn.</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => handleOpen()}
            sx={{ borderRadius: 1 }}
          >
            Thêm sân mới
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Thông tin sân</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Giá (Sáng/Chiều/Tối)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courts.map((court: any) => (
                <TableRow key={court.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{court.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150, display: 'block' }}>
                      {court.description || 'Không có mô tả'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={court.type === 'indoor' ? 'Trong nhà' : 'Ngoài trời'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">☀️ {new Intl.NumberFormat('vi-VN').format(court.price_morning || 0)}đ</Typography>
                    <Typography variant="caption" display="block">⛅ {new Intl.NumberFormat('vi-VN').format(court.price_afternoon || 0)}đ</Typography>
                    <Typography variant="caption" display="block">🌙 {new Intl.NumberFormat('vi-VN').format(court.price_evening || 0)}đ</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={court.status === 'active' ? 'Đang hoạt động' : (court.status === 'maintenance' ? 'Bảo trì' : 'Ngừng hoạt động')} 
                      color={court.status === 'active' ? 'success' : (court.status === 'maintenance' ? 'warning' : 'default')}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton color="primary" size="small" onClick={() => handleOpen(court)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ngừng hoạt động">
                      <IconButton color="error" size="small" onClick={() => deleteMutation.mutate(court.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {courts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    Chưa có sân nào được tạo. Nhấn "Thêm sân mới" để bắt đầu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {selectedCourt ? 'Chỉnh sửa thông tin sân' : 'Thêm sân con mới'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField 
                label="Tên sân" 
                required 
                fullWidth 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Sân số 1 - VIP"
              />
              
              <Stack direction="row" spacing={2}>
                <TextField 
                  select 
                  label="Loại sân" 
                  fullWidth 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="indoor">Trong nhà</MenuItem>
                  <MenuItem value="outdoor">Ngoài trời</MenuItem>
                </TextField>
                
                <TextField 
                  select 
                  label="Trạng thái" 
                  fullWidth 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="maintenance">Bảo trì</MenuItem>
                  <MenuItem value="inactive">Đóng cửa</MenuItem>
                </TextField>
              </Stack>

              <TextField 
                label="Mô tả" 
                fullWidth 
                multiline 
                rows={2} 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>🏷️ BẢNG GIÁ RIÊNG (ĐỂ TRỐNG NẾU DÙNG GIÁ CHUNG CỦA CƠ SỞ)</Typography>
              
              <Stack direction="row" spacing={2}>
                <TextField 
                  label="Giá Sáng" 
                  type="number" 
                  fullWidth 
                  value={formData.price_morning}
                  onChange={(e) => setFormData({ ...formData, price_morning: e.target.value })}
                  helperText="05:00 - 12:00"
                />
                <TextField 
                  label="Giá Chiều" 
                  type="number" 
                  fullWidth 
                  value={formData.price_afternoon}
                  onChange={(e) => setFormData({ ...formData, price_afternoon: e.target.value })}
                  helperText="12:00 - 17:00"
                />
                <TextField 
                  label="Giá Tối" 
                  type="number" 
                  fullWidth 
                  value={formData.price_evening}
                  onChange={(e) => setFormData({ ...formData, price_evening: e.target.value })}
                  helperText="17:00 - 23:00"
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit">Hủy</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={createMutation.isPending || updateMutation.isPending}
              startIcon={(createMutation.isPending || updateMutation.isPending) && <CircularProgress size={16} />}
              sx={{ borderRadius: 1, px: 4 }}
            >
              {selectedCourt ? 'Lưu thay đổi' : 'Tạo ngay'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default OwnerCourts;
