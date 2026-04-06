import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, Card, Typography, TextField, Button, 
  Stack, Divider, InputAdornment, 
  CircularProgress, Alert, Paper
} from '@mui/material';
import { Save, Percent, Settings as SettingsIcon } from '@mui/icons-material';
import { adminApi } from '@/api/adminApi';
import { useSnackbar } from 'notistack';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings()
  });

  const settings = data?.data || [];
  const defaultCommission = settings.find((s: any) => s.key === 'default_commission_rate');

  const [commissionValue, setCommissionValue] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize value from API data
  if (!isLoading && defaultCommission && !isInitialized) {
    setCommissionValue(defaultCommission.value);
    setIsInitialized(true);
  }

  const mutation = useMutation({
    mutationFn: (val: string) => adminApi.updateSetting('default_commission_rate', { 
      value: val, 
      description: 'Phí hoa hồng mặc định thu từ mỗi lượt đặt sân (áp dụng cho các sân chưa cấu hình riêng)' 
    }),
    onSuccess: () => {
      enqueueSnackbar('Đã lưu cài đặt phí hoa hồng!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (err: any) => enqueueSnackbar(err.message || 'Lỗi khi lưu', { variant: 'error' })
  });

  if (isLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SettingsIcon color="primary" /> Cấu hình Hệ thống
      </Typography>

      <Card sx={{ p: 4, borderRadius: 1.5, border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Phí Hoa Hồng Nền Tảng</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Đây là phí mặc định thu từ mỗi giao dịch đặt sân thành công. Bạn có thể ghi đè phí này cho từng sân cụ thể trong phần Quản lý Địa điểm.
        </Typography>

        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Tỉ lệ hoa hồng (%)</Typography>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <TextField 
                type="number"
                size="small"
                value={commissionValue}
                onChange={(e) => setCommissionValue(e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><Percent sx={{ fontSize: '1rem' }} /></InputAdornment>,
                }}
                sx={{ width: 200 }}
              />
              <Button 
                variant="contained" 
                startIcon={<Save />}
                loading={mutation.isPending}
                onClick={() => mutation.mutate(commissionValue)}
                sx={{ 
                  fontWeight: 700, 
                  px: 4,
                  borderRadius: 1,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)' }
                }}
              >
                Lưu thay đổi
              </Button>
            </Stack>
          </Box>

          <Divider />

          <Alert severity="info" sx={{ borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              💡 Lưu ý: Thay đổi này sẽ chỉ áp dụng cho các đơn đặt sân được tạo MỚI sau thời điểm này. Các đơn hàng cũ vẫn giữ nguyên tỷ lệ hoa hồng lúc đặt.
            </Typography>
          </Alert>
        </Stack>
      </Card>

      <Paper variant="outlined" sx={{ mt: 4, p: 3, bgcolor: '#F8FAFC', borderStyle: 'dashed' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
           🛠️ Các cài đặt khác (Sắp ra mắt)
        </Typography>
        <Typography variant="caption" color="text.secondary">
           Bao gồm: Cấu hình VNPAY, Thời gian hủy sân tối thiểu, Điểm thưởng Loyalty...
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminSettings;
