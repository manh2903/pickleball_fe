import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, Container, Typography, Card, Grid, TextField, Button, 
  Stack, MenuItem, CircularProgress
} from '@mui/material';
import { 
  AddBusiness, ArrowBack, CloudUpload
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { ownerApi } from '@/api/ownerApi';

const OwnerVenueAdd = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Hà Nội',
    district: '',
    description: '',
    phone: '',
    open_time: '05:00',
    close_time: '23:00',
    default_price_morning: '',
    default_price_afternoon: '',
    default_price_evening: '',
    default_price_weekend_surcharge: '10',
    cancel_policy: 'Hủy trước 24h hoàn tiền 100%. Hủy trước 12h hoàn tiền 50%.',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ownerApi.createVenue(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['owner-venues'] });
      localStorage.setItem('activeVenueId', res.data.id.toString());
      enqueueSnackbar('Đăng ký cơ sở thành công! Vui lòng chờ admin duyệt.', { variant: 'success' });
      navigate('/owner/dashboard');
    },
    onError: (err: any) => {
      enqueueSnackbar(err.message || 'Lỗi khi đăng ký', { variant: 'error' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      default_price_morning: Number(formData.default_price_morning),
      default_price_afternoon: Number(formData.default_price_afternoon),
      default_price_evening: Number(formData.default_price_evening),
      default_price_weekend_surcharge: Number(formData.default_price_weekend_surcharge),
    };
    createMutation.mutate(payload);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button 
        startIcon={<ArrowBack />} 
        component={Link} 
        to="/owner/dashboard"
        sx={{ mb: 4, fontWeight: 700 }}
      >
        Quay lại Dashboard
      </Button>

      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <AddBusiness sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: 'Times New Roman', mb: 1 }}>
          Đăng ký Cơ sở mới 🏢
        </Typography>
        <Typography color="text.secondary">Mở rộng quy mô kinh doanh của bạn trên hệ thống Pickleball Hub.</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* General Info */}
          <Grid item xs={12}>
            <Card sx={{ p: 4, borderRadius: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Thông tin chung</Typography>
              <Stack spacing={3}>
                <TextField 
                  label="Tên địa điểm / Cơ sở" 
                  required 
                  fullWidth 
                  placeholder="VD: Pickleball Hub - Cơ sở Cầu Giấy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <TextField 
                  label="Địa chỉ chi tiết" 
                  required 
                  fullWidth 
                  placeholder="Số nhà, ngõ, tên đường..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <Stack direction="row" spacing={2}>
                  <TextField 
                    select 
                    label="Tỉnh/Thành phố" 
                    fullWidth 
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    <MenuItem value="Hà Nội">Hà Nội</MenuItem>
                    <MenuItem value="Hồ Chí Minh">Hồ Chí Minh</MenuItem>
                    <MenuItem value="Đà Nẵng">Đà Nẵng</MenuItem>
                  </TextField>
                  <TextField 
                    label="Quận/Huyện" 
                    required 
                    fullWidth 
                    placeholder="VD: Cầu Giấy"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </Stack>
                <TextField 
                  label="Mô tả cơ sở" 
                  multiline 
                  rows={3} 
                  fullWidth 
                  placeholder="Giới thiệu về cơ sở, tiện ích đặc bật..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Stack>
            </Card>
          </Grid>

          {/* Pricing & Policy */}
          <Grid item xs={12}>
            <Card sx={{ p: 4, borderRadius: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Bảng giá mặc định & Chính sách</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label="Giá Sáng (6h-11h)" 
                    type="number" 
                    required 
                    fullWidth 
                    value={formData.default_price_morning}
                    onChange={(e) => setFormData({ ...formData, default_price_morning: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label="Giá Chiều (11h-17h)" 
                    type="number" 
                    required 
                    fullWidth 
                    value={formData.default_price_afternoon}
                    onChange={(e) => setFormData({ ...formData, default_price_afternoon: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    label="Giá Tối (17h-22h)" 
                    type="number" 
                    required 
                    fullWidth 
                    value={formData.default_price_evening}
                    onChange={(e) => setFormData({ ...formData, default_price_evening: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Thời gian mở cửa" 
                    type="time" 
                    fullWidth 
                    value={formData.open_time}
                    onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Thời gian đóng cửa" 
                    type="time" 
                    fullWidth 
                    value={formData.close_time}
                    onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label="Chính sách hoàn tiền / Hủy lịch" 
                    multiline 
                    rows={2} 
                    fullWidth 
                    value={formData.cancel_policy}
                    onChange={(e) => setFormData({ ...formData, cancel_policy: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Submit */}
          <Grid item xs={12}>
            <Box sx={{ p: 4, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sau khi đăng ký, cơ sở sẽ ở trạng thái <b>Chờ duyệt</b>. Admin sẽ kiểm tra và xác nhận trong vòng 24h làm việc.
              </Typography>
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={createMutation.isPending}
                startIcon={createMutation.isPending ? <CircularProgress size={20} /> : <CloudUpload />}
                sx={{ px: 8, py: 2, borderRadius: 1, fontWeight: 800, fontSize: '1.1rem' }}
              >
                Gửi yêu cầu đăng ký 🚀
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default OwnerVenueAdd;
