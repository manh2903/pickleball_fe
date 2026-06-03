import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Card, Typography, 
  Stack,
  CircularProgress, Paper, Grid,
  Chip, TextField, Button, InputAdornment, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, Switch, Tooltip, Alert
} from '@mui/material';
import { Save, Edit, Close, Delete, Add } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { adminApi } from '@/api/adminApi';
import { subscriptionApi } from '@/api/subscriptionApi';
import { useSnackbar } from 'notistack';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  
  // States for Editing Option
  const [editOption, setEditOption] = useState<any>(null);
  const [optionForm, setOptionForm] = useState<any>(null);

  // States for Adding Option
  const [openAddOption, setOpenAddOption] = useState(false);
  const [addOptionForm, setAddOptionForm] = useState<any>(null);

  // 1. Fetch Subscription Plans
  const { data: plansRes, isLoading: plansLoading } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: () => subscriptionApi.adminGetPlans()
  });

  // 2. Fetch Platform Settings
  const { data: settingsRes, isLoading: settingsLoading } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: () => adminApi.getSettings()
  });

  const settings = settingsRes?.data || [];
  const plans = plansRes || [];

  useEffect(() => {
    if (settings.length > 0) {
      const vals: Record<string, string> = {};
      settings.forEach((s: any) => { vals[s.key] = s.value; });
      setFormValues(prev => ({ ...prev, ...vals }));
    }
  }, [settings]);

  // Update System Setting
  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string, value: string }) => 
      adminApi.updateSetting(key, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] });
      enqueueSnackbar('Đã lưu cấu hình vận hành.', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Lỗi cập nhật cấu hình.', { variant: 'error' })
  });

  // Update Subscription Option
  const updateOptionMutation = useMutation({
    mutationFn: (data: any) => subscriptionApi.adminUpdateOption(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      enqueueSnackbar('Đã cập nhật chi tiết gói dịch vụ.', { variant: 'success' });
      setEditOption(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Lỗi cập nhật gói dịch vụ.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  });

  // Create Subscription Option
  const createOptionMutation = useMutation({
    mutationFn: (data: any) => subscriptionApi.adminCreateOption(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      enqueueSnackbar('Đã tạo kỳ hạn gói mới.', { variant: 'success' });
      setOpenAddOption(false);
      setAddOptionForm(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Lỗi tạo kỳ hạn gói.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  });

  // Delete Subscription Option
  const deleteOptionMutation = useMutation({
    mutationFn: (id: number | string) => subscriptionApi.adminDeleteOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      enqueueSnackbar('Đã xóa kỳ hạn gói.', { variant: 'success' });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Lỗi xóa kỳ hạn gói.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  });

  const handleToggleOption = (plan: any, opt: any) => {
    if (plan.name === 'Gói Miễn Phí' && opt.is_active) {
      enqueueSnackbar('Không thể tắt tùy chọn của Gói Miễn Phí.', { variant: 'warning' });
      return;
    }
    if (opt.is_active && opt.activeUserCount > 0) {
      enqueueSnackbar('Không thể tắt kỳ hạn này vì đang có người dùng sử dụng.', { variant: 'warning' });
      return;
    }
    updateOptionMutation.mutate({ ...opt, is_active: !opt.is_active });
  };

  const handleDeleteOption = (plan: any, opt: any) => {
    if (plan.name === 'Gói Miễn Phí') {
      enqueueSnackbar('Không thể xóa tùy chọn của Gói Miễn Phí.', { variant: 'warning' });
      return;
    }
    if (opt.activeUserCount > 0) {
      enqueueSnackbar('Không thể xóa kỳ hạn này vì đang có người dùng sử dụng.', { variant: 'warning' });
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa kỳ hạn ${opt.duration_months} tháng của gói này không?`)) {
      deleteOptionMutation.mutate(opt.id);
    }
  };

  const handleOpenAddOption = (plan: any) => {
    setAddOptionForm({
      plan_id: plan.id,
      planName: plan.name,
      duration_months: 1,
      price: 0,
      max_venues: 1,
      max_courts_per_venue: 3,
      features: {
        analytics: false,
        staff_management: false,
        custom_coupons: false,
      },
      is_active: true
    });
    setOpenAddOption(true);
  };

  const handleOpenEditOption = (plan: any, opt: any) => {
    setEditOption({ ...opt, planName: plan.name });
    setOptionForm({
        ...opt,
        features: opt.features || {}
    });
  };

  const handleFeatureToggle = (key: string) => {
    setOptionForm((prev: any) => ({
        ...prev,
        features: {
            ...prev.features,
            [key]: !prev.features[key]
        }
    }));
  };

  if (plansLoading || settingsLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Times New Roman' }}>
        Cấu hình Hệ thống 🛠️
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Quản lý các thông số vận hành và hạn mức gói thành viên toàn hệ thống.
      </Typography>

      <Grid container spacing={4}>
        {/* Vận hành */}
        <Grid item xs={12} lg={4}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Times New Roman' }}>
             Cài đặt Vận hành
          </Typography>
          <Stack spacing={2}>
            {settings.map((s: any) => (
              <Card key={s.id} variant="outlined" sx={{ p: 2, borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  {s.label || s.key}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <TextField 
                        size="small" fullWidth
                        value={formValues[s.key] || ''}
                        onChange={(e) => setFormValues(prev => ({ ...prev, [s.key]: e.target.value }))}
                        InputProps={{
                            endAdornment: s.type === 'number' && <InputAdornment position="end"><Typography sx={{ fontSize: 10, fontWeight: 800 }}>GIỜ</Typography></InputAdornment>,
                            sx: { borderRadius: 1, fontSize: '0.85rem' }
                        }}
                    />
                    <Button 
                        variant="contained" size="small"
                        onClick={() => updateSettingMutation.mutate({ key: s.key, value: formValues[s.key] })}
                        sx={{ minWidth: 40, bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' }, boxShadow: 'none' }}
                    >
                        <Save fontSize="small" />
                    </Button>
                </Box>
              </Card>
            ))}
          </Stack>
        </Grid>

        {/* Gói dịch vụ */}
        <Grid item xs={12} lg={8}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Times New Roman' }}>
            Quản trị Gói dịch vụ (Hạn mức & Tính năng)
          </Typography>
          <Grid container spacing={2}>
            {plans.map((plan: any) => (
              <Grid item xs={12} md={6} key={plan.id}>
                <Card variant="outlined" sx={{ borderRadius: 1.5, border: '1px solid #E2E8F0', height: '100%' }}>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>{plan.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{plan.description}</Typography>
                    </Box>
                    {plan.name !== 'Gói Miễn Phí' && (
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<Add />}
                        onClick={() => handleOpenAddOption(plan)}
                        sx={{ borderRadius: 1.5, fontSize: '0.75rem', py: 0.5, px: 1.5 }}
                      >
                        Thêm kỳ hạn
                      </Button>
                    )}
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Stack spacing={1}>
                      {plan.options?.map((opt: any) => (
                        <Paper 
                          key={opt.id} 
                          sx={{ 
                            p: 1.5, 
                            bgcolor: opt.is_active ? '#fff' : '#F8FAFC', 
                            border: '1px solid #F1F5F9', 
                            boxShadow: 'none', 
                            opacity: opt.is_active ? 1 : 0.7,
                            '&:hover': { bgcolor: '#FDF2F2' } 
                          }}
                        >
                           <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" sx={{ fontWeight: 800 }}>Kỳ hạn: {opt.duration_months} tháng</Typography>
                                  {!opt.is_active && <Chip label="Ẩn" color="default" size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 800 }} />}
                                  {opt.activeUserCount > 0 && (
                                    <Chip 
                                      label={`${opt.activeUserCount} user`} 
                                      color="error" 
                                      variant="outlined" 
                                      size="small" 
                                      sx={{ height: 16, fontSize: '0.55rem', fontWeight: 800 }} 
                                    />
                                  )}
                                </Stack>
                                <Typography variant="body2" sx={{ fontWeight: 900, color: '#DC2626', mt: 0.5 }}>
                                    {new Intl.NumberFormat('vi-VN').format(opt.price)}đ
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                    <Chip label={`${opt.max_venues} Venue`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }} />
                                    <Chip label={`${opt.max_courts_per_venue} Court`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }} />
                                </Stack>
                              </Box>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Tooltip title={opt.is_active ? "Tắt kỳ hạn" : "Bật kỳ hạn"}>
                                  <Switch 
                                    size="small" 
                                    checked={!!opt.is_active} 
                                    onChange={() => handleToggleOption(plan, opt)} 
                                    color="success"
                                    disabled={plan.name === 'Gói Miễn Phí' && opt.is_active}
                                  />
                                </Tooltip>
                                <IconButton size="small" onClick={() => handleOpenEditOption(plan, opt)} sx={{ color: '#BCBCBC', '&:hover': { color: '#DC2626' } }}>
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDeleteOption(plan, opt)} 
                                  sx={{ color: '#BCBCBC', '&:hover': { color: '#DC2626' } }}
                                  disabled={opt.activeUserCount > 0 || plan.name === 'Gói Miễn Phí'}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Stack>
                           </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Edit Option Dialog */}
      <Dialog open={!!editOption} onClose={() => setEditOption(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ px: 3, pt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>CHỈNH SỬA GÓI</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Times New Roman' }}>{editOption?.planName} ({editOption?.duration_months}T)</Typography>
            </Box>
            <IconButton onClick={() => setEditOption(null)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 3 }}>
            {editOption?.activeUserCount > 0 && (
                <Alert severity="warning" sx={{ mb: 2, fontWeight: 700 }}>
                    Kỳ hạn này đang có {editOption.activeUserCount} người dùng đang sử dụng. Không thể chỉnh sửa thông tin.
                </Alert>
            )}
            <Stack spacing={3} sx={{ py: 1 }}>
                <TextField 
                    label="Giá gói (VND)" fullWidth type="number"
                    value={optionForm?.price || ''}
                    onChange={(e) => setOptionForm((p:any) => ({ ...p, price: e.target.value }))}
                    disabled={editOption?.activeUserCount > 0}
                />
                <Stack direction="row" spacing={2}>
                    <TextField 
                        label="Hạn mức Cơ sở" fullWidth type="number"
                        value={optionForm?.max_venues || ''}
                        onChange={(e) => setOptionForm((p:any) => ({ ...p, max_venues: e.target.value }))}
                        disabled={editOption?.activeUserCount > 0}
                    />
                    <TextField 
                        label="Sân / Cơ sở" fullWidth type="number"
                        value={optionForm?.max_courts_per_venue || ''}
                        onChange={(e) => setOptionForm((p:any) => ({ ...p, max_courts_per_venue: e.target.value }))}
                        disabled={editOption?.activeUserCount > 0}
                    />
                </Stack>
                
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary' }}>TÍNH NĂNG MỞ KHÓA</Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <FormControlLabel control={<Checkbox size="small" checked={!!optionForm?.features?.analytics} onChange={() => handleFeatureToggle('analytics')} disabled={editOption?.activeUserCount > 0} />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Báo cáo</Typography>} />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel control={<Checkbox size="small" checked={!!optionForm?.features?.staff_management} onChange={() => handleFeatureToggle('staff_management')} disabled={editOption?.activeUserCount > 0} />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Nhân viên</Typography>} />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel control={<Checkbox size="small" checked={!!optionForm?.features?.custom_coupons} onChange={() => handleFeatureToggle('custom_coupons')} disabled={editOption?.activeUserCount > 0} />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Mã KM</Typography>} />
                        </Grid>
                    </Grid>
                </Box>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC' }}>
            <Button onClick={() => setEditOption(null)} sx={{ fontWeight: 700 }}>Hủy</Button>
            <Button 
                variant="contained" 
                onClick={() => updateOptionMutation.mutate(optionForm)}
                disabled={updateOptionMutation.isPending || editOption?.activeUserCount > 0}
                sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' }, fontWeight: 800, px: 3, borderRadius: 1.5 }}
            >
                Lưu thay đổi
            </Button>
        </DialogActions>
      </Dialog>

      {/* Add Option Dialog */}
      <Dialog open={openAddOption} onClose={() => setOpenAddOption(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ px: 3, pt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>THÊM KỲ HẠN MỚI</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Times New Roman' }}>Gói {addOptionForm?.planName}</Typography>
            </Box>
            <IconButton onClick={() => setOpenAddOption(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 3 }}>
            <Stack spacing={3} sx={{ py: 1 }}>
                <TextField 
                    label="Kỳ hạn (tháng)" fullWidth type="number"
                    value={addOptionForm?.duration_months || ''}
                    onChange={(e) => setAddOptionForm((p:any) => ({ ...p, duration_months: parseInt(e.target.value) || 0 }))}
                />
                <TextField 
                    label="Giá gói (VND)" fullWidth type="number"
                    value={addOptionForm?.price || ''}
                    onChange={(e) => setAddOptionForm((p:any) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                />
                <Stack direction="row" spacing={2}>
                    <TextField 
                        label="Hạn mức Cơ sở" fullWidth type="number"
                        value={addOptionForm?.max_venues || ''}
                        onChange={(e) => setAddOptionForm((p:any) => ({ ...p, max_venues: parseInt(e.target.value) || 0 }))}
                    />
                    <TextField 
                        label="Sân / Cơ sở" fullWidth type="number"
                        value={addOptionForm?.max_courts_per_venue || ''}
                        onChange={(e) => setAddOptionForm((p:any) => ({ ...p, max_courts_per_venue: parseInt(e.target.value) || 0 }))}
                    />
                </Stack>
                
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary' }}>TÍNH NĂNG MỞ KHÓA</Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <FormControlLabel control={<Checkbox size="small" checked={!!addOptionForm?.features?.analytics} onChange={() => setAddOptionForm((p: any) => ({ ...p, features: { ...p.features, analytics: !p.features.analytics } }))} />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Báo cáo</Typography>} />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel control={<Checkbox size="small" checked={!!addOptionForm?.features?.staff_management} onChange={() => setAddOptionForm((p: any) => ({ ...p, features: { ...p.features, staff_management: !p.features.staff_management } }))} />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Nhân viên</Typography>} />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel control={<Checkbox size="small" checked={!!addOptionForm?.features?.custom_coupons} onChange={() => setAddOptionForm((p: any) => ({ ...p, features: { ...p.features, custom_coupons: !p.features.custom_coupons } }))} />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Mã KM</Typography>} />
                        </Grid>
                    </Grid>
                </Box>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC' }}>
            <Button onClick={() => setOpenAddOption(false)} sx={{ fontWeight: 700 }}>Hủy</Button>
            <Button 
                variant="contained" 
                onClick={() => createOptionMutation.mutate(addOptionForm)}
                disabled={createOptionMutation.isPending}
                sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' }, fontWeight: 800, px: 3, borderRadius: 1.5 }}
            >
                Tạo mới
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSettings;
