import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, 
  Grid, Stack, Divider, Checkbox, FormControlLabel,
  FormGroup, CircularProgress, Alert, ImageList,
  ImageListItem, IconButton, Paper, Tab, Tabs,
  InputAdornment, Autocomplete
} from '@mui/material';
import { 
  Save, PhotoCamera, Delete, 
  Storefront, LocationOn, Phone, 
  Verified, Percent, Info
} from '@mui/icons-material';
import { ownerApi } from '@/api/ownerApi';
import { locationApi } from '@/api/locationApi';
import { AMENITIES_LIST } from '@/constants/amenities';
import { useSnackbar } from 'notistack';
import { getImageUrl } from '@/utils/imageUtils';

const OwnerSettings = () => {
  const { venueId }: any = useOutletContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: '',
    address: '',
    province_id: '',
    ward_id: '',
    phone: '',
    description: '',
    default_price_morning: 0,
    default_price_afternoon: 0,
    default_price_evening: 0,
    default_price_weekend_surcharge: 0,
    amenities: [],
    images: [],
    open_time: '06:00',
    close_time: '22:00'
  });

  const { data, isLoading: isVenueLoading, error } = useQuery({
    queryKey: ['owner-venue-detail', venueId],
    queryFn: () => ownerApi.getVenue(venueId),
    enabled: !!venueId
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        ...data.data,
        amenities: Array.isArray(data.data.amenities) ? data.data.amenities : [],
        images: Array.isArray(data.data.images) ? data.data.images : [],
        province_id: data.data.province_id || '',
        ward_id: data.data.ward_id || '',
        open_time: data.data.open_time?.slice(0, 5) || '06:00',
        close_time: data.data.close_time?.slice(0, 5) || '22:00'
      });
    }
  }, [data]);

  // Locations Query
  const { data: provinceRes, isLoading: isProvincesLoading } = useQuery({
    queryKey: ['provinces'],
    queryFn: () => locationApi.getProvinces(),
  });

  
  const provinces = provinceRes?.data || [];
  console.log("provinces", provinces)

  const { data: wardRes, isLoading: isWardsLoading } = useQuery({
    queryKey: ['wards', formData.province_id],
    queryFn: () => locationApi.getWards(formData.province_id),
    enabled: !!formData.province_id,
  });
  const wards = wardRes?.data || [];

  const handleProvinceChange = (province_id: string) => {
    setFormData((prev: any) => ({ ...prev, province_id, ward_id: '' }));
  };

  const updateMutation = useMutation({
    mutationFn: (payload: any) => ownerApi.updateVenue(venueId, payload),
    onSuccess: () => {
      enqueueSnackbar('Cập nhật thông tin thành công!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['owner-venue-detail', venueId] });
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi cập nhật', { variant: 'error' })
  });

  const handleAmenityChange = (amenity: string) => {
    const current = Array.isArray(formData.amenities) ? formData.amenities : [];
    const newAmenities = current.includes(amenity)
      ? current.filter((a: string) => a !== amenity)
      : [...current, amenity];
    setFormData((prev: any) => ({ ...prev, amenities: newAmenities }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res: any = await ownerApi.uploadVenueImage(venueId, file);
      const imageUrl = res.data.url;
      
      setFormData((prev: any) => ({
        ...prev,
        images: [...(prev.images || []), imageUrl]
      }));
      enqueueSnackbar('Tải ảnh lên thành công!', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Lỗi tải ảnh', { variant: 'error' });
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = formData.images[index];
    try {
      await ownerApi.deleteVenueImage(venueId, imageUrl);
      setFormData((prev: any) => ({
        ...prev,
        images: prev.images.filter((_: any, i: number) => i !== index)
      }));
      enqueueSnackbar('Xóa ảnh thành công!', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Lỗi khi xóa ảnh', { variant: 'error' });
    }
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isVenueLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Lỗi tải dữ liệu cấu hình.</Alert>;

  return (
    <Box sx={{ mx: 'auto' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 3, display: 'flex' }}>
           <Storefront sx={{ color: 'white', fontSize: '2rem' }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Times New Roman' }}>Cấu hình Cơ sở 🏢</Typography>
          <Typography variant="body2" color="text.secondary">Quản lý nội dung hiển thị và tiện ích của cụm sân.</Typography>
        </Box>
      </Stack>

      <Paper sx={{ mb: 4, borderRadius: 4, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Tabs 
          value={tab} 
          onChange={(_, val) => setTab(val)}
          sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', px: 2 }}
        >
          <Tab label="Cơ bản" sx={{ fontWeight: 800, py: 2.5 }} />
          <Tab label="Tiện ích" sx={{ fontWeight: 800, py: 2.5 }} />
          <Tab label="Hình ảnh" sx={{ fontWeight: 800, py: 2.5 }} />
          <Tab label="Kinh doanh" sx={{ fontWeight: 800, py: 2.5 }} />
        </Tabs>

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          {tab === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <TextField 
                  fullWidth label="Tên cơ sở" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Verified color="primary" sx={{ fontSize: 20 }} /></InputAdornment>, sx: { borderRadius: 3, fontWeight: 700 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                  fullWidth label="Điện thoại hotline" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 20 }} /></InputAdornment>, sx: { borderRadius: 3, fontWeight: 700 } }}
                />
              </Grid>

              {/* LOCATIONS UPDATED TO AUTOCOMPLETE */}
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
                        startAdornment: (
                          <>
                            <InputAdornment position="start"><LocationOn sx={{ fontSize: 20 }} /></InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        sx: { borderRadius: 3, fontWeight: 700 }
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
                  onChange={(_, newValue) => setFormData({...formData, ward_id: newValue?.ma || ''})}
                  loading={isWardsLoading}
                  disabled={!formData.province_id}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Phường/Xã" 
                      required
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: 3, fontWeight: 700 },
                        endAdornment: (
                          <>
                            {isWardsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                  fullWidth label="Địa chỉ cụ thể" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn sx={{ fontSize: 20 }} /></InputAdornment>, sx: { borderRadius: 3, fontWeight: 500 } }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField 
                  fullWidth label="Giờ mở cửa" 
                  type="time"
                  value={formData.open_time}
                  onChange={(e) => setFormData({...formData, open_time: e.target.value})}
                  InputProps={{ sx: { borderRadius: 3, fontWeight: 700 } }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField 
                  fullWidth label="Giờ đóng cửa" 
                  type="time"
                  value={formData.close_time}
                  onChange={(e) => setFormData({...formData, close_time: e.target.value})}
                  InputProps={{ sx: { borderRadius: 3, fontWeight: 700 } }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField 
                  fullWidth multiline rows={4} label="Mô tả cơ sở" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  InputProps={{ sx: { borderRadius: 4 } }}
                  helperText="Giới thiệu về sân đấu, quy định và các thông tin cần thiết."
                />
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Danh sách tiện ích</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Chọn dịch vụ đi kèm có sẵn tại sân.</Typography>
              <FormGroup sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
                {AMENITIES_LIST.map((item) => (
                  <Paper key={item} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel 
                      control={
                        <Checkbox 
                          checked={formData.amenities?.includes(item)}
                          onChange={() => handleAmenityChange(item)}
                        />
                      } 
                      label={<Typography variant="body2" sx={{ fontWeight: 700 }}>{item}</Typography>} 
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Paper>
                ))}
              </FormGroup>
            </Box>
          )}

          {tab === 2 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Bộ sưu tập ảnh</Typography>
                  <Typography variant="caption" color="text.secondary">Sử dụng ảnh sắc nét giúp thu hút khách hàng.</Typography>
                </Box>
                <input
                  type="file"
                  id="venue-image-upload"
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label htmlFor="venue-image-upload">
                  <Button 
                    variant="outlined" 
                    component="span"
                    startIcon={isUploading ? <CircularProgress size={20} /> : <PhotoCamera />} 
                    disabled={isUploading}
                    sx={{ borderRadius: 2, px: 3, py: 1 }}
                  >
                    {isUploading ? 'Đang tải...' : 'Tải lên ảnh 📸'}
                  </Button>
                </label>
              </Stack>
              
              <ImageList sx={{ width: '100%', height: 'auto', borderRadius: 2 }} cols={3} gap={20}>
                {formData.images?.map((img: string, i: number) => (
                  <ImageListItem key={i} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden', position: 'relative', bgcolor: '#F8FAFC' }}>
                    <img 
                      src={getImageUrl(img)} 
                      alt={`Venue ${i}`} 
                      loading="lazy" 
                      style={{ aspectRatio: '16/9', objectFit: 'cover' }} 
                    />
                    <IconButton 
                      onClick={() => handleRemoveImage(i)}
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,59,48,0.9)', color: 'white', '&:hover': { bgcolor: '#FF3B30' } }} 
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </ImageListItem>
                ))}
                {(!formData.images || formData.images.length === 0) && (
                   <Box sx={{ py: 12, textAlign: 'center', gridColumn: 'span 3', bgcolor: '#F8FAFC', borderRadius: 3, border: '2px dashed #E2E8F0' }}>
                      <Info sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>Chưa có hình ảnh nào được tải lên.</Typography>
                   </Box>
                )}
              </ImageList>
            </Box>
          )}

          {tab === 3 && (
            <Box>
               <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                     <Info color="primary" />
                     <Typography variant="body2" sx={{ fontWeight: 800, color: '#0369A1' }}>
                       Hoa hồng hệ thống: <b>{data?.data?.commission_rate || 10}%</b> trên mỗi đơn đặt thành công.
                     </Typography>
                  </Stack>
               </Paper>
               
               <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Giá mặc định (VNĐ/giờ)</Typography>
               <Grid container spacing={3}>
                  <Grid item xs={12} sm={3}>
                    <TextField 
                      fullWidth label="Giá Sáng" 
                      type="number"
                      value={formData.default_price_morning}
                      onChange={(e) => setFormData({...formData, default_price_morning: e.target.value})}
                      InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField 
                      fullWidth label="Giá Chiều" 
                      type="number"
                      value={formData.default_price_afternoon}
                      onChange={(e) => setFormData({...formData, default_price_afternoon: e.target.value})}
                      InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField 
                      fullWidth label="Giá Tối" 
                      type="number"
                      value={formData.default_price_evening}
                      onChange={(e) => setFormData({...formData, default_price_evening: e.target.value})}
                      InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: 3 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField 
                      fullWidth 
                      label="Phụ phí Cuối tuần" 
                      type="number"
                      value={formData.default_price_weekend_surcharge}
                      onChange={(e) => setFormData({...formData, default_price_weekend_surcharge: e.target.value})}
                      InputProps={{ 
                         endAdornment: <InputAdornment position="end">%</InputAdornment>, 
                         sx: { borderRadius: 3 },
                         startAdornment: <InputAdornment position="start"><Percent fontSize="small" /></InputAdornment>
                      }}
                      helperText="Cộng % vào giá gốc"
                    />
                  </Grid>
               </Grid>
            </Box>
          )}
        </Box>

        <Divider sx={{ opacity: 0.5 }} />
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'flex-end', bgcolor: '#F8FAFC' }}>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<Save />}
            onClick={handleSave}
            disabled={updateMutation.isPending}
            sx={{ px: 10, py: 1.8, borderRadius: 3, fontWeight: 900, boxShadow: '0 10px 15px -3px rgba(34,197,94,0.3)' }}
          >
            LƯU THAY ĐỔI 💾
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OwnerSettings;
