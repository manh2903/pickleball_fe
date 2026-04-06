import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Card, Typography, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stack, CircularProgress,
  Tooltip, Alert, Badge as MuiBadge
} from '@mui/material';
import { 
  PersonAdd, Email, Phone, 
  Lock, History
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { ownerApi } from '@/api/ownerApi';

const OwnerStaffs = () => {
  const { venueId }: any = useOutletContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const { data: staffsRes, isLoading } = useQuery({
    queryKey: ['owner-staffs', venueId],
    queryFn: () => ownerApi.getStaffs(venueId),
    enabled: !!venueId
  });

  const staffs = staffsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => ownerApi.createStaff(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-staffs', venueId] });
      setOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
      enqueueSnackbar('Tạo tài khoản nhân viên thành công!', { variant: 'success' });
    },
    onError: (err: any) => {
      enqueueSnackbar(err.message || 'Lỗi khi tạo tài khoản', { variant: 'error' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (!venueId) return <Alert severity="info">Vui lòng chọn cơ sở để quản lý nhân viên.</Alert>;

  return (
    <Box>
      <Card sx={{ p: 4, borderRadius: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Quản lý Nhân viên / Lễ tân 🧑‍💼</Typography>
            <Typography variant="body2" color="text.secondary">Tại đây bạn có thể tạo tài khoản cho nhân viên trực thuộc cơ sở này.</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<PersonAdd />} 
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 1 }}
          >
            Thêm nhân viên
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Họ và tên</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Thông tin liên hệ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngày gia nhập</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffs.map((staff: any) => (
                  <TableRow key={staff.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <MuiBadge badgeContent="" color="success" variant="dot">
                          <Box sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                            {staff.name.charAt(0)}
                          </Box>
                        </MuiBadge>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{staff.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Email sx={{ fontSize: 14, mr: 1, color: 'text.disabled' }} /> {staff.email}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ fontSize: 14, mr: 1, color: 'text.disabled' }} /> {staff.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(staff.created_at).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={staff.status === 'active' ? 'Đang làm việc' : 'Ngừng kích hoạt'} 
                        color={staff.status === 'active' ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Lịch sử thao tác">
                        <IconButton size="small">
                          <History fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {staffs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      Cơ sở này chưa có nhân viên nào. Hãy nhấn "Thêm nhân viên" để tạo tài khoản.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>Tạo tài khoản nhân viên</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField 
                fullWidth 
                label="Họ và tên" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField 
                fullWidth 
                label="Email" 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextField 
                fullWidth 
                label="Số điện thoại" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <TextField 
                fullWidth 
                label="Mật khẩu khởi tạo" 
                type="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                InputProps={{
                  startAdornment: <Lock sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />
                }}
              />
              <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                Mật khẩu này sẽ được sử dụng để nhân viên đăng nhập lần đầu. Nhân viên chỉ có quyền Check-in và xem lịch sân.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpen(false)} color="inherit">Hủy</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={createMutation.isPending}
              startIcon={createMutation.isPending && <CircularProgress size={16} />}
              sx={{ borderRadius: 1, px: 4 }}
            >
              Cấp tài khoản
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default OwnerStaffs;
