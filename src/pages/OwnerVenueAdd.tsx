import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, Container, Typography, Card, Grid, TextField, Button, 
  Stack, MenuItem, CircularProgress, InputAdornment, Divider,
  Paper, Avatar
} from '@mui/material';
import { 
  AddBusiness, ArrowBack, CloudUpload, Phone,
  LocationOn, AccessTime, Payments, Policy,
  Verified, Info
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
    <Box sx={{ py: 4 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          {/* General Information Section */}
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #F1F5F9' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={4}>
               <Box sx={{ p: 1, bgcolor: '#EEF2FF', borderRadius: 2 }}>
                  <Info color="primary" />
               </Box>
               <Typography variant="h6" sx={{ fontWeight: 900 }}>Thông tin Cơ sở</Typography>
            </Stack>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField 
                  label="Tên địa điểm / Cơ sở" 
                  required 
                  fullWidth 
                  placeholder="VD: Pickleball Hub - Cơ sở Cầu Giấy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  InputProps={{ 
                     startAdornment: <InputAdornment position="start"><Verified color="primary" /></InputAdornment>,
                     sx: { borderRadius: 3 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                  label="Số điện thoại liên hệ" 
                  required 
                  fullWidth 
                  placeholder="Hotline riêng của cơ sở"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  InputProps={{ 
                     startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment>,
                     sx: { borderRadius: 3 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                  select 
                  label="Tỉnh/Thành phố" 
                  fullWidth 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  InputProps={{ sx: { borderRadius: 3 } }}
                >
                  <MenuItem value="Hà Nội">Hà Nội</MenuItem>
                  <MenuItem value="Hồ Chí Minh">Hồ Chí Minh</MenuItem>
                  <MenuItem value="Đà Nẵng">Đà Nẵng</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                  label="Quận/Huyện" 
                  required 
                  fullWidth 
                  placeholder="VD: Cầu Giấy"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  InputProps={{ sx: { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                  label="Địa chỉ chi tiết" 
                  required 
                  fullWidth 
                  placeholder="Số nhà, ngõ, tên đường..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  InputProps={{ 
                     startAdornment: <InputAdornment position="start"><LocationOn color="action" /></InputAdornment>,
                     sx: { borderRadius: 3 }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  label="Mô tả cơ sở" 
                  multiline 
                  rows={4} 
                  fullWidth 
                  placeholder="Giới thiệu về cơ sở, tiện ích nổi bật..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  InputProps={{ sx: { borderRadius: 4 } }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Pricing & Policy Section */}
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #F1F5F9' }}>
             <Stack direction="row" spacing={1.5} alignItems="center" mb={4}>
                <Box sx={{ p: 1, bgcolor: '#ECFDF5', borderRadius: 2 }}>
                   <Payments sx={{ color: '#10B981' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Bảng giá & Chính sách</Typography>
             </Stack>

             <Grid container spacing={4}>
                {/* Prices */}
                <Grid item xs={12} sm={3}>
                  <TextField 
                    label="Giá Sáng (6h-11h)" 
                    type="number" 
                    required 
                    fullWidth 
                    value={formData.default_price_morning}
                    onChange={(e) => setFormData({ ...formData, default_price_morning: e.target.value })}
                    InputProps={{ 
                       endAdornment: <InputAdornment position="end">đ</InputAdornment>,
                       sx: { borderRadius: 3 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField 
                    label="Giá Chiều (11h-17h)" 
                    type="number" 
                    required 
                    fullWidth 
                    value={formData.default_price_afternoon}
                    onChange={(e) => setFormData({ ...formData, default_price_afternoon: e.target.value })}
                    InputProps={{ 
                       endAdornment: <InputAdornment position="end">đ</InputAdornment>,
                       sx: { borderRadius: 3 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField 
                    label="Giá Tối (17h-22h)" 
                    type="number" 
                    required 
                    fullWidth 
                    value={formData.default_price_evening}
                    onChange={(e) => setFormData({ ...formData, default_price_evening: e.target.value })}
                    InputProps={{ 
                       endAdornment: <InputAdornment position="end">đ</InputAdornment>,
                       sx: { borderRadius: 3 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField 
                    label="Phụ thu Cuối tuần" 
                    type="number" 
                    required 
                    fullWidth 
                    value={formData.default_price_weekend_surcharge}
                    onChange={(e) => setFormData({ ...formData, default_price_weekend_surcharge: e.target.value })}
                    InputProps={{ 
                       endAdornment: <InputAdornment position="end">%</InputAdornment>,
                       sx: { borderRadius: 3 }
                    }}
                    helperText="Tự động cộng thêm % vào giá gốc"
                  />
                </Grid>

                {/* Times */}
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Mở cửa" 
                    type="time" 
                    fullWidth 
                    value={formData.open_time}
                    onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
                    InputProps={{ 
                       startAdornment: <InputAdornment position="start"><AccessTime /></InputAdornment>,
                       sx: { borderRadius: 3 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Đóng cửa" 
                    type="time" 
                    fullWidth 
                    value={formData.close_time}
                    onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
                    InputProps={{ 
                       startAdornment: <InputAdornment position="start"><AccessTime /></InputAdornment>,
                       sx: { borderRadius: 3 }
                    }}
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
                    InputProps={{ 
                       startAdornment: <InputAdornment position="start"><Policy color="action" /></InputAdornment>,
                       sx: { borderRadius: 3 }
                    }}
                  />
                </Grid>
             </Grid>
          </Paper>

          {/* Submission Section */}
          <Box sx={{ p: 6, bgcolor: '#F8FAFC', borderRadius: 4, border: '1px dashed #CBD5E1', textAlign: 'center' }}>
             <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 600 }}>
               📝 Bằng việc gửi yêu cầu này, bạn xác nhận thông tin cơ sở là chính xác và tuân thủ các quy định vận hành của hệ thống.
             </Typography>
             <Button 
               type="submit" 
               variant="contained" 
               size="large" 
               disabled={createMutation.isPending}
               startIcon={createMutation.isPending ? <CircularProgress size={20} /> : <CloudUpload />}
               sx={{ 
                  px: 10, py: 2.5, borderRadius: 4, fontWeight: 900, 
                  fontSize: '1.1rem',
                  boxShadow: '0 20px 25px -5px rgba(34,197,94,0.3)',
                  '&:hover': { boxShadow: 'none' }
               }}
             >
               GỬI ĐĂNG KÝ CƠ SỞ 🚀
             </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default OwnerVenueAdd;
