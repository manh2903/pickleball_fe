import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Box, InputAdornment, IconButton, Typography, Divider, Icon } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Phone, Business, CheckCircleOutline } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { authApi } from '@/api/authApi';
import AuthLayout from '@/layouts/AuthLayout';

const ownerSchema = z.object({
  name: z.string().min(2, 'Họ và tên là bắt buộc'),
  business_name: z.string().min(5, 'Tên doanh nghiệp/hộ kinh doanh ít nhất 5 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type OwnerForm = z.infer<typeof ownerSchema>;

const RegisterOwnerPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { register, handleSubmit, formState: { errors } } = useForm<OwnerForm>({
    resolver: zodResolver(ownerSchema),
  });

  const onSubmit = async (data: OwnerForm) => {
    setLoading(true);
    try {
      const response: any = await authApi.registerOwner(data);
      if (response.success) {
        setSubmitted(true);
        enqueueSnackbar('Gửi thông tin thành công!', { variant: 'success' });
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Đăng ký thất bại', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout 
        title="Yêu cầu đã được gửi" 
        subtitle="Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ."
      >
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="body1" paragraph>
            Chào mừng bạn đến với mạng lưới chủ sân Pickleball. Hồ sơ của bạn hiện đang ở trạng thái <b>Đang chờ duyệt</b>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Thông báo duyệt sẽ được gửi qua email của bạn ngay khi hoàn tất.
          </Typography>
          <Button variant="contained" fullWidth size="large" onClick={() => navigate('/login')}>
            Quay lại đăng nhập
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Đăng ký Chủ sân" 
      subtitle="Đưa sân của bạn lên bản đồ và bắt đầu nhận booking ngay hôm nay."
      bottomText="Đã có tài khoản chủ sân?"
      bottomLink="/login"
      bottomLinkText="Đăng nhập"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
        <TextField
          {...register('business_name')}
          label="Tên Sân/Doanh nghiệp"
          placeholder="Pickleball Central Park"
          error={!!errors.business_name}
          helperText={errors.business_name?.message}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Business color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          {...register('name')}
          label="Họ và Tên chủ sở hữu"
          placeholder="Nguyễn Văn B"
          error={!!errors.name}
          helperText={errors.name?.message}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          {...register('email')}
          label="Email liên hệ"
          placeholder="owner@example.com"
          error={!!errors.email}
          helperText={errors.email?.message}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          {...register('phone')}
          label="Số điện thoại"
          placeholder="09xx xxx xxx"
          error={!!errors.phone}
          helperText={errors.phone?.message}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          {...register('password')}
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          error={!!errors.password}
          helperText={errors.password?.message}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, fontSize: '1.1rem', bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
          >
            {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu hợp tác'}
          </Button>
        </Box>
        
        <Typography variant="caption" align="center" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
          Bằng việc gửi yêu cầu, bạn đồng ý với các quy định về đối tác của chúng tôi.
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default RegisterOwnerPage;
