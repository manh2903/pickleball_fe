import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, TextField, Button, 
  Stack, MenuItem, CircularProgress, InputAdornment, 
  Paper, Autocomplete
} from '@mui/material';
import { 
  Phone, LocationOn, AccessTime, Payments, Policy,
  Verified, Info, CloudUpload
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { ownerApi } from '@/api/ownerApi';
import { locationApi } from '@/api/locationApi';
import { systemApi } from '@/api/systemApi';
import { AMENITIES_LIST } from '@/constants/amenities';

const OwnerVenueAdd = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState<any>({
    name: '',
    address: '',
    province_id: '',
    ward_id: '',
    description: '',
    phone: '',
    open_time: '05:00',
    close_time: '23:00',
    default_price_morning: '',
    default_price_afternoon: '',
    default_price_evening: '',
    default_price_weekend_surcharge: '10',
    cancel_policy: 'Hủy trước 24h hoàn tiền 100%. Hủy trước 12h hoàn tiền 50%.',
    amenities: [],
  });

  // Fetch provinces
  const { data: provinceRes, isLoading: isProvincesLoading } = useQuery({
    queryKey: ['provinces'],
    queryFn: () => locationApi.getProvinces(),
  });
  const provinces = provinceRes?.data || [];

  // Fetch wards based on selected province
  const { data: wardRes, isLoading: isWardsLoading } = useQuery({
    queryKey: ['wards', formData.province_id],
    queryFn: () => locationApi.getWards(formData.province_id),
    enabled: !!formData.province_id,
  });
  const wards = wardRes?.data || [];

  // Fetch system settings for commission info
  const { data: settingsRes } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => systemApi.getSettings(),
  });
  const settings = settingsRes?.data || {};
  const currentCommission = settings.default_commission_rate || '10';

  const handleProvinceChange = (province_id: string) => {
    setFormData({ 
      ...formData, 
      province_id, 
      ward_id: '', 
    });
  };

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
    if (!formData.province_id || !formData.ward_id) {
       enqueueSnackbar('Vui lòng chọn Tỉnh/Thành phố và Phường/Xã', { variant: 'warning' });
       return;
    }
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
                  placeholder="VD: Pickleball Court Marketplace - Cơ sở Cầu Giấy"
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

              {/* LOCATION SELECTION - AUTOCOMPLETE */}
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={provinces}
                  getOptionLabel={(option: any) => option.ten_tinh || ''}
                  value={provinces.find((p: any) => p.ma_tinh === formData.province_id) || null}
                  onChange={(_, newValue) => handleProvinceChange(newValue?.ma_tinh || '')}
                  loading={isProvincesLoading}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Tỉnh/Thành phố" 
                      required
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: 3 },
                        endAdornment: (
                          <>
                            {isProvincesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={wards}
                  getOptionLabel={(option: any) => option.ten || ''}
                  value={wards.find((w: any) => w.ma === formData.ward_id) || null}
                  onChange={(_, newValue) => setFormData({ ...formData, ward_id: newValue?.ma || '' })}
                  loading={isWardsLoading}
                  disabled={!formData.province_id}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Phường/Xã" 
                      required
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: 3 },
                        endAdornment: (
                          <>
                            {isWardsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      helperText={!formData.province_id ? "Chọn Tỉnh/Thành phố trước" : ""}
                    />
                  )}
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

          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #F1F5F9' }}>
             <Stack direction="row" spacing={1.5} alignItems="center" mb={4}>
                <Box sx={{ p: 1, bgcolor: '#ECFDF5', borderRadius: 2 }}>
                   <Payments sx={{ color: '#10B981' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Bảng giá & Chính sách</Typography>
             </Stack>

             <Grid container spacing={4}>
                <Grid item xs={12}>
                   <Box sx={{ p: 2, bgcolor: '#EFF6FF', borderRadius: 3, border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center' }}>
                      <Payments sx={{ color: 'primary.main', mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.dark' }}>
                          Phí dịch vụ nền tảng (Commission)
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'primary.main' }}>
                          Hệ thống sẽ tự động áp dụng mức phí sàn mặc định (hiện tại là <Box component="span" sx={{ fontWeight: 900, color: 'red' }}>{currentCommission}%</Box>) cho mỗi giao dịch thành công. Bạn có thể xem chi tiết trong phần Ví tiền sau khi được duyệt.
                        </Typography>
                      </Box>
                   </Box>
                </Grid>
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

          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #F1F5F9' }}>
             <Stack direction="row" spacing={1.5} alignItems="center" mb={4}>
                <Box sx={{ p: 1, bgcolor: '#FEF3C7', borderRadius: 2 }}>
                   <Info sx={{ color: '#D97706' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Tiện ích mở rộng</Typography>
             </Stack>
             <Grid container spacing={2}>
                {AMENITIES_LIST.map((item) => (
                  <Grid item xs={6} sm={4} md={3} key={item}>
                    <Box 
                      onClick={() => {
                        const current = formData.amenities || [];
                        const newAmenities = current.includes(item)
                          ? current.filter((a: string) => a !== item)
                          : [...current, item];
                        setFormData({ ...formData, amenities: newAmenities });
                      }}
                      sx={{ 
                        p: 2, borderRadius: 3, cursor: 'pointer', border: '2px solid',
                        borderColor: (formData.amenities || []).includes(item) ? 'primary.main' : '#F1F5F9',
                        bgcolor: (formData.amenities || []).includes(item) ? 'rgba(34,197,94,0.05)' : 'white',
                        transition: '0.2s',
                        textAlign: 'center',
                        fontWeight: (formData.amenities || []).includes(item) ? 800 : 500,
                        '&:hover': { borderColor: 'primary.light' }
                      }}
                    >
                      {item}
                    </Box>
                  </Grid>
                ))}
             </Grid>
          </Paper>

          <Box sx={{ p: 6, bgcolor: '#F8FAFC', borderRadius: 4, border: '1px dashed #CBD5E1', textAlign: 'center' }}>
             <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontWeight: 600 }}>
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
