import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Card, Typography, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stack, MenuItem, CircularProgress,
  Tooltip, Avatar, InputAdornment
} from '@mui/material';
import { 
  CheckCircle, Cancel, Percent, 
  Visibility, Search, Business
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminApi } from '@/api/adminApi';

const AdminVenues = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [commissionRate, setCommissionRate] = useState<number>(0);

  const { data: venuesRes, isLoading } = useQuery({
    queryKey: ['admin-venues', statusFilter, search],
    queryFn: () => adminApi.getVenues({ status: statusFilter, search })
  });

  const venues = venuesRes?.data?.venues || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => adminApi.updateVenueStatus(id, status),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      enqueueSnackbar(res.data?.message || 'Cập nhật trạng thái thành công', { variant: 'success' });
    }
  });

  const updateCommissionMutation = useMutation({
    mutationFn: ({ id, rate }: { id: number, rate: number }) => adminApi.setCommission(id, rate),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      setCommissionOpen(false);
      enqueueSnackbar(res.data?.message || 'Cập nhật hoa hồng thành công', { variant: 'success' });
    }
  });

  const handleOpenCommission = (venue: any) => {
    setSelectedVenue(venue);
    setCommissionRate(venue.commission_rate || 10);
    setCommissionOpen(true);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active': return <Chip label="Đang hoạt động" color="success" size="small" />;
      case 'pending_review': return <Chip label="Chờ duyệt" color="warning" size="small" />;
      case 'suspended': return <Chip label="Đình chỉ" color="error" size="small" />;
      default: return <Chip label="Không hoạt động" color="default" size="small" />;
    }
  };

  return (
    <Box>
      <Card sx={{ p: 4, borderRadius: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Phê duyệt Địa điểm & Đối tác 🏢</Typography>
            <Typography variant="body2" color="text.secondary">Duyệt hồ sơ cơ sở mới và quản lý tỷ lệ kinh doanh.</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <TextField 
              size="small" 
              placeholder="Tìm tên sân, địa chỉ..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ color: 'text.disabled', mr: 1 }} /> }}
            />
            <TextField 
              select 
              size="small" 
              label="Trạng thái" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="pending_review">Chờ duyệt</MenuItem>
              <MenuItem value="suspended">Đã đình chỉ</MenuItem>
            </TextField>
          </Stack>
        </Box>

        {isLoading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Thông tin Địa điểm</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Chủ sở hữu</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Kinh doanh</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {venues.map((venue: any) => (
                  <TableRow key={venue.id} hover>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{venue.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {venue.address}, {venue.district}, {venue.city}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Phone: {venue.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{venue.owner?.name?.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{venue.owner?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{venue.owner?.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<Percent sx={{ fontSize: 14 }} />} 
                        label={`${venue.commission_rate || 0}%`} 
                        variant="outlined" 
                        onClick={() => handleOpenCommission(venue)}
                        sx={{ fontWeight: 800, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(venue.status)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {venue.status === 'pending_review' && (
                          <Tooltip title="Duyệt hoạt động">
                            <IconButton 
                              color="success" 
                              onClick={() => updateStatusMutation.mutate({ id: venue.id, status: 'active' })}
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        {venue.status === 'active' && (
                          <Tooltip title="Đình chỉ tạm thời">
                            <IconButton 
                              color="error" 
                              onClick={() => updateStatusMutation.mutate({ id: venue.id, status: 'suspended' })}
                              disabled={updateStatusMutation.isPending}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        )}
                        {venue.status === 'suspended' && (
                          <Tooltip title="Mở khóa">
                            <IconButton 
                              color="success" 
                              onClick={() => updateStatusMutation.mutate({ id: venue.id, status: 'active' })}
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {venues.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <Business sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">Không tìm thấy yêu cầu hoặc địa điểm nào.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Commission Dialog */}
      <Dialog 
        open={commissionOpen} 
        onClose={() => setCommissionOpen(false)}
        PaperProps={{ sx: { borderRadius: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Thiết lập tỷ lệ hoa hồng</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Áp dụng cho cơ sở: <b>{selectedVenue?.name}</b>. Tỷ lệ này sẽ được trừ trực tiếp từ mỗi đơn hàng thành công.
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Phần trăm hoa hồng"
            value={commissionRate}
            onChange={(e) => setCommissionRate(Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCommissionOpen(false)} color="inherit">Hủy</Button>
          <Button 
            variant="contained" 
            onClick={() => updateCommissionMutation.mutate({ id: selectedVenue.id, rate: commissionRate })}
            disabled={updateCommissionMutation.isPending}
            sx={{ borderRadius: 1, px: 4 }}
          >
            Lưu thiết lập
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminVenues;
