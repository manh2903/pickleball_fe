import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Box, Typography, Grid, Card, Button, 
  CircularProgress, Stack, Chip, Divider,
  Alert, Paper
} from '@mui/material';
import { 
  CheckCircle, 
  Verified, Storefront, SportsTennis, 
  History, AccessTime
} from '@mui/icons-material';
import { subscriptionApi } from '@/api/subscriptionApi';
import { useSnackbar } from 'notistack';

const OwnerSubscription = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { data: plansRes, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionApi.getPlans
  });

  const { data: mySubRes, isLoading: subLoading, refetch: refetchSub } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionApi.getMySubscription
  });

  const purchaseMutation = useMutation({
    mutationFn: (planId: number) => subscriptionApi.purchasePlan(planId),
    onSuccess: (res: any) => {
      enqueueSnackbar(res.message, { variant: 'info' });
      // In real scenario, redirect to res.paymentUrl
    },
    onError: (err: any) => {
      enqueueSnackbar(err.message || 'Lỗi khi thanh toán', { variant: 'error' });
    }
  });

  const plans = plansRes?.data || [];
  const currentSub = mySubRes?.data;

  if (plansLoading || subLoading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress size={60} /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 950, fontFamily: 'Times New Roman', mb: 1, letterSpacing: -1 }}>
          Gói Dịch Vụ 💎
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Nâng cấp hệ thống để mở rộng quy mô kinh doanh và tận hưởng các tính năng chuyên nghiệp.
        </Typography>
      </Box>

      {/* Current Subscription Info */}
      <Paper elevation={0} sx={{ p: 4, mb: 6, borderRadius: 4, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Verified color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Tình trạng gói hiện tại</Typography>
            </Stack>
            
            {currentSub ? (
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>GÓI ĐANG DÙNG</Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 900 }}>{currentSub.plan.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>NGÀY HẾT HẠN</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {new Date(currentSub.end_date).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
                <Box>
                  <Chip 
                    label="Đang hoạt động" 
                    color="success" 
                    size="small" 
                    sx={{ fontWeight: 800, px: 2 }} 
                  />
                </Box>
              </Stack>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 2, fontWeight: 700 }}>
                Bạn chưa kích hoạt gói dịch vụ nào. Hãy chọn một gói bên dưới để bắt đầu.
              </Alert>
            )}
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
             <Button variant="outlined" startIcon={<History />} sx={{ borderRadius: 3, fontWeight: 700 }}>
                Lịch sử thanh toán
             </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, textAlign: 'center' }}>
        Chọn gói phù hợp với nhu cầu của bạn
      </Typography>

      <Grid container spacing={4}>
        {plans.map((plan: any) => {
          const isHighlight = plan.name.includes('Premium') || plan.name.includes('Chuyên');
          const isCurrent = currentSub?.plan_id === plan.id;

          return (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card sx={{ 
                p: 1, height: '100%', borderRadius: 5, 
                border: isHighlight ? '2px solid' : '1px solid',
                borderColor: isHighlight ? 'primary.main' : 'divider',
                position: 'relative',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-8px)' },
                boxShadow: isHighlight ? '0 20px 40px rgba(34,197,94,0.15)' : 'none'
              }}>
                {isHighlight && (
                  <Chip 
                    label="KHUYÊN DÙNG" 
                    color="primary" 
                    sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 900, borderRadius: 2 }} 
                  />
                )}
                
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>{plan.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ height: 40, mb: 3 }}>
                    {plan.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography variant="h3" sx={{ fontWeight: 950, color: 'primary.main' }}>
                      {new Intl.NumberFormat('vi-VN').format(plan.price)}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 1, fontWeight: 700 }}>
                      đ / {plan.duration_months} tháng
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  <Stack spacing={2} sx={{ mb: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Storefront sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Tối đa <strong>{plan.max_venues}</strong> cơ sở địa điểm
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <SportsTennis sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Tối đa <strong>{plan.max_courts_per_venue}</strong> sân / cơ sở
                      </Typography>
                    </Stack>
                    
                    {Object.entries(plan.features || {}).map(([key, val]: any) => (
                      <Stack direction="row" spacing={2} alignItems="center" key={key}>
                        {val ? <CheckCircle color="success" sx={{ fontSize: 20 }} /> : <CheckCircle color="disabled" sx={{ fontSize: 20, opacity: 0.3 }} />}
                        <Typography variant="body2" sx={{ fontWeight: 600, color: val ? 'text.primary' : 'text.disabled' }}>
                          {key === 'analytics' ? 'Báo cáo & Phân tích chuyên sâu' : 
                           key === 'staff_management' ? 'Quản lý phân quyền nhân viên' : 
                           key === 'custom_coupons' ? 'Tạo mã giảm giá riêng' : key}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Button 
                    fullWidth 
                    variant={isHighlight ? "contained" : "outlined"}
                    size="large"
                    disabled={isCurrent || purchaseMutation.isPending}
                    onClick={() => purchaseMutation.mutate(plan.id)}
                    sx={{ py: 1.5, borderRadius: 3, fontWeight: 900 }}
                  >
                    {isCurrent ? 'GÓI HIỆN TẠI' : 'NÂNG CẤP NGAY'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 8, p: 4, bgcolor: '#FEFCE8', borderRadius: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
        <Box sx={{ p: 2, bgcolor: '#FEF9C3', borderRadius: 3 }}>
           <AccessTime sx={{ color: '#A16207', fontSize: 32 }} />
        </Box>
        <Box>
           <Typography variant="h6" sx={{ fontWeight: 800, color: '#854D0E' }}>Chính sách tự động cộng dồn</Typography>
           <Typography variant="body2" sx={{ color: '#A16207', fontWeight: 500 }}>
             Nếu bạn nâng cấp khi gói cũ còn hạn, chúng tôi sẽ tự động quy đổi và cộng dồn thời gian sử dụng vào gói mới của bạn.
           </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default OwnerSubscription;
