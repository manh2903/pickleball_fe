import { useQuery } from '@tanstack/react-query';
import { 
  Box, Card, Typography, 
  Stack, Divider, 
  CircularProgress, Alert, Paper, Grid,
  Chip
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Verified, Storefront, SportsTennis
} from '@mui/icons-material';
import { adminApi } from '@/api/adminApi';
import { subscriptionApi } from '@/api/subscriptionApi';

const AdminSettings = () => {
  const { data: plansRes, isLoading: plansLoading } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: () => subscriptionApi.getPlans()
  });

  const plans = plansRes?.data || [];

  if (plansLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 950, mb: 1, letterSpacing: -1 }}>
        Cấu hình Hệ thống 🛠️
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
        Quản lý các thông số vận hành và gói dịch vụ của nền tảng.
      </Typography>

      <Alert severity="success" sx={{ mb: 4, borderRadius: 3, py: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Mô hình Subscription đã được kích hoạt</Typography>
        <Typography variant="body2">
          Nền tảng hiện đang hoạt động theo mô hình Gói thành viên. Các cài đặt về Phí hoa hồng cũ đã bị vô hiệu hóa để đảm bảo quyền lợi cho chủ sân.
        </Typography>
      </Alert>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Các gói dịch vụ hiện có</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Danh sách các gói mà chủ sân có thể đăng ký mua để mở rộng hạn mức.
            </Typography>

            <Stack spacing={3}>
              {plans.map((plan: any) => (
                <Paper key={plan.id} variant="outlined" sx={{ p: 3, borderRadius: 3, border: '1px solid #F1F5F9' }}>
                   <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                         <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{plan.name}</Typography>
                         <Typography variant="body2" color="text.secondary">{plan.description}</Typography>
                         <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                            <Chip 
                                size="small" 
                                icon={<Storefront sx={{ fontSize: '1rem !important' }}/>} 
                                label={`${plan.max_venues} Venues`} 
                                sx={{ fontWeight: 700 }}
                            />
                            <Chip 
                                size="small" 
                                icon={<SportsTennis sx={{ fontSize: '1rem !important' }}/>} 
                                label={`${plan.max_courts_per_venue} Courts/Venue`} 
                                sx={{ fontWeight: 700 }}
                            />
                         </Stack>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                         <Typography variant="h6" color="primary" sx={{ fontWeight: 900 }}>
                            {new Intl.NumberFormat('vi-VN').format(plan.price)}đ
                         </Typography>
                         <Typography variant="caption" color="text.secondary">/ {plan.duration_months} tháng</Typography>
                      </Box>
                   </Stack>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
           <Stack spacing={3}>
              <Card sx={{ p: 3, borderRadius: 4, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                 <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Verified color="primary" /> Trạng thái vận hành
                 </Typography>
                 <Divider sx={{ mb: 2 }} />
                 <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                       <Typography variant="body2">Thu phí %</Typography>
                       <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>Đã tắt</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                       <Typography variant="body2">Mô hình Gói</Typography>
                       <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>Hoạt động</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                       <Typography variant="body2">Cổng VNPay</Typography>
                       <Typography variant="body2" sx={{ fontWeight: 700 }}>Sẵn sàng</Typography>
                    </Box>
                 </Stack>
              </Card>

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#FEFCE8', border: '1px dashed #EAB308' }}>
                 <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#854D0E', mb: 1 }}>
                    🚀 CMS Admin (Planned)
                 </Typography>
                 <Typography variant="caption" sx={{ color: '#A16207' }}>
                    Sắp ra mắt giao diện chỉnh sửa Gói dịch vụ trực tiếp cho Admin.
                 </Typography>
              </Paper>
           </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSettings;
