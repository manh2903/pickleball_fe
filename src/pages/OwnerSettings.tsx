import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Card, Typography, TextField, Button, 
  Grid, Stack, Divider, Checkbox, FormControlLabel,
  FormGroup, CircularProgress, Alert, ImageList,
  ImageListItem, IconButton, Paper, Tab, Tabs,
  InputAdornment
} from '@mui/material';
import { 
  Save, PhotoCamera, Delete, 
  Storefront, LocationOn, Phone, 
  Description, Info, Verified,
  Percent
} from '@mui/icons-material';
import { ownerApi } from '@/api/ownerApi';
import { useSnackbar } from 'notistack';

const OwnerSettings = () => {
  const { venueId }: any = useOutletContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['owner-venue-detail', venueId],
    queryFn: () => ownerApi.getVenue(venueId), // Assuming this exists or using parent data
    enabled: !!venueId
  });

  const [formData, setFormData] = useState<any>({
    name: '',
    address: '',
    city: '',
    district: '',
    phone: '',
    description: '',
    default_price_morning: 0,
    default_price_afternoon: 0,
    default_price_evening: 0,
    default_price_weekend_surcharge: 0,
    amenities: [],
    images: []
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        ...data.data,
        amenities: data.data.amenities || []
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => ownerApi.updateVenue(venueId, payload),
    onSuccess: () => {
      enqueueSnackbar('Cập nhật thông tin cơ sở thành công!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['owner-venue-detail', venueId] });
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi cập nhật', { variant: 'error' })
  });

  const handleAmenityChange = (amenity: string) => {
    setFormData((prev: any) => {
      const newAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a: string) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Lỗi tải dữ liệu cấu hình.</Alert>;

  const AMENITIES_LIST = ['Gửi xe', 'Wifi', 'Căng tin', 'Điều hòa', 'Mái che', 'Phòng tắm', 'VIP'];

  return (
    <Box sx={{  mx: 'auto' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
        <Storefront color="primary" sx={{ fontSize: '2.5rem' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Times New Roman' }}>Cấu hình Cơ sở 🏢</Typography>
          <Typography variant="body2" color="text.secondary">Quản lý nội dung hiển thị và tiện ích của cụm sân.</Typography>
        </Box>
      </Stack>

      <Paper sx={{ mb: 4, borderRadius: 1.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Tabs 
          value={tab} 
          onChange={(_, val) => setTab(val)}
          sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}
        >
          <Tab label="Thông tin cơ bản" sx={{ fontWeight: 800, py: 2 }} />
          <Tab label="Tiện ích & Dịch vụ" sx={{ fontWeight: 800, py: 2 }} />
          <Tab label="Hình ảnh (Gallery)" sx={{ fontWeight: 800, py: 2 }} />
          <Tab label="Kinh doanh" sx={{ fontWeight: 800, py: 2 }} />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth label="Tên cơ sở" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Verified color="primary" /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth label="Điện thoại hotline" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth label="Địa chỉ cụ thể" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth label="Quận/Huyện" 
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth label="Thành phố" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth multiline rows={4} label="Mô tả cơ sở" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  helperText="Giới thiệu về sân đấu, quy định và các thông tin cần thiết cho khách hàng."
                />
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Danh sách tiện ích</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Chọn các dịch vụ đi kèm có sẵn tại sân để khách hàng dễ dàng tìm kiếm.</Typography>
              <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                {AMENITIES_LIST.map((item) => (
                  <FormControlLabel 
                    key={item}
                    control={
                      <Checkbox 
                        checked={formData.amenities.includes(item)}
                        onChange={() => handleAmenityChange(item)}
                        color="primary"
                      />
                    } 
                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>{item}</Typography>} 
                  />
                ))}
              </FormGroup>
            </Box>
          )}

          {tab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Bộ sưu tập ảnh khách hàng thấy</Typography>
                  <Typography variant="caption" color="text.secondary">Ảnh sắc nét sẽ giúp thu hút người chơi nhiều hơn.</Typography>
                </Box>
                <Button variant="outlined" startIcon={<PhotoCamera />} sx={{ borderRadius: 1, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
                  Tải lên ảnh 📸
                </Button>
              </Box>
              
              <ImageList sx={{ width: '100%', height: 'auto', borderRadius: 1 }} cols={3} gap={16}>
                {formData.images?.map((img: string, i: number) => (
                  <ImageListItem key={i} sx={{ border: '1px solid #E2E8F0', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
                    <img src={img} alt={`Venue ${i}`} loading="lazy" />
                    <IconButton sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,0,0,0.7)', color: 'white', '&:hover': { bgcolor: 'red' } }} size="small">
                      <Delete fontSize="small" />
                    </IconButton>
                  </ImageListItem>
                ))}
                {(!formData.images || formData.images.length === 0) && (
                   <Box sx={{ py: 10, textAlign: 'center', gridColumn: 'span 3', bgcolor: '#F8FAFC', borderRadius: 1, border: '1px dashed #CBD5E1' }}>
                      <Description color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">Chưa có hình ảnh nào được tải lên.</Typography>
                   </Box>
                )}
              </ImageList>
            </Box>
          )}

          {tab === 3 && (
            <Box>
               <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                     💡 Tỷ lệ hoa hồng (Commission) hiện tại của bạn là <b>{data?.data?.commission_rate || 10}%</b> trên mỗi đơn đặt sân thành công.
                  </Typography>
               </Alert>
               
               <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Bảng giá mặc định & Phụ phí</Typography>
               <Grid container spacing={3}>
                  <Grid item xs={12} sm={3}>
                    <TextField 
                      fullWidth 
                      label="Giá Sáng (6h-11h)" 
                      type="number"
                      value={formData.default_price_morning}
                      onChange={(e) => setFormData({...formData, default_price_morning: e.target.value})}
                      InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField 
                      fullWidth 
                      label="Giá Chiều (11h-17h)" 
                      type="number"
                      value={formData.default_price_afternoon}
                      onChange={(e) => setFormData({...formData, default_price_afternoon: e.target.value})}
                      InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField 
                      fullWidth 
                      label="Giá Tối (17h-22h)" 
                      type="number"
                      value={formData.default_price_evening}
                      onChange={(e) => setFormData({...formData, default_price_evening: e.target.value})}
                      InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField 
                      fullWidth 
                      label="Phụ thu Cuối tuần" 
                      type="number"
                      value={formData.default_price_weekend_surcharge}
                      onChange={(e) => setFormData({...formData, default_price_weekend_surcharge: e.target.value})}
                      InputProps={{ 
                         endAdornment: <InputAdornment position="end">%</InputAdornment>, 
                         sx: { borderRadius: 3 },
                         startAdornment: <InputAdornment position="start"><Percent color="primary" /></InputAdornment>
                      }}
                      helperText="Cộng thêm % vào giá gốc"
                    />
                  </Grid>
               </Grid>

               <Divider sx={{ my: 4, opacity: 0.5 }} />
               <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  * Lưu ý: Giá mặc định sẽ được áp dụng cho tất cả các sân bên trong cơ sở này. Bạn có thể override (ghi đè) giá riêng cho từng sân tại trang Quản lý sân.
               </Typography>
            </Box>
          )}
        </Box>

        <Divider />
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'flex-end', bgcolor: '#F8FAFC' }}>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<Save />}
            onClick={handleSave}
            disabled={updateMutation.isPending}
            sx={{ px: 8, borderRadius: 1.5, fontWeight: 900, boxShadow: '0 4px 6px -1px rgba(34,197,94,0.3)' }}
          >
            Lưu thay đổi 💾
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OwnerSettings;
