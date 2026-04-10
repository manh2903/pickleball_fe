import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Box, InputAdornment, IconButton, Typography, Stack } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Phone, CheckCircleOutline, RocketLaunch } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { authApi } from '@/api/authApi';
import AuthLayout from '@/layouts/AuthLayout';

const ownerSchema = z.object({
  name: z.string().min(2, 'Họ và tên là bắt buộc'),
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
        enqueueSnackbar('Đăng ký tài khoản thành công!', { variant: 'success' });
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
        title="Tài khoản đã sẵn sàng!" 
        subtitle="Chào mừng bạn gia nhập mạng lưới đối tác của chúng tôi."
      >
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
             <CheckCircleOutline sx={{ fontSize: 90, color: 'success.main' }} />
             <RocketLaunch sx={{ position: 'absolute', bottom: 0, right: 0, fontSize: 30, color: 'primary.main', bgcolor: 'white', borderRadius: '50%' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
            Chúc mừng! Tài khoản của bạn đã được kích hoạt.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            Bạn có thể đăng nhập ngay bây giờ để bắt đầu đăng ký cơ sở và quản lý lịch đặt sân của mình.
          </Typography>
          <Stack spacing={2}>
            <Button 
                variant="contained" 
                fullWidth 
                size="large" 
                onClick={() => navigate('/login')}
                sx={{ py: 1.8, borderRadius: 2, fontWeight: 900, boxShadow: '0 10px 15px -3px rgba(34,197,94,0.3)' }}
            >
                ĐĂNG NHẬP NGAY 🚀
            </Button>
          </Stack>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Trở thành Chủ sân" 
      subtitle="Đăng ký tài khoản đối tác để bắt đầu kinh doanh ngay hôm nay."
      bottomText="Đã có tài khoản đối tác?"
      bottomLink="/login"
      bottomLinkText="Đăng nhập"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
        <TextField
          {...register('name')}
          label="Họ và Tên chủ sở hữu"
          placeholder="VD: Nguyễn Văn An"
          error={!!errors.name}
          helperText={errors.name?.message}
          margin="normal"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
        />

        <TextField
          {...register('email')}
          label="Email đăng ký"
          placeholder="owner@example.com"
          error={!!errors.email}
          helperText={errors.email?.message}
          margin="normal"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
        />

        <TextField
          {...register('phone')}
          label="Số điện thoại"
          placeholder="09xx xxx xxx"
          error={!!errors.phone}
          helperText={errors.phone?.message}
          margin="normal"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
        />

        <TextField
          {...register('password')}
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          error={!!errors.password}
          helperText={errors.password?.message}
          margin="normal"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ mt: 4 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
                py: 2, borderRadius: 3, fontWeight: 900, fontSize: '1.1rem',
                boxShadow: '0 10px 15px -3px rgba(34,197,94,0.3)',
                bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } 
            }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'ĐĂNG KÝ TÀI KHOẢN 🚀'}
          </Button>
        </Box>
        
        <Typography variant="caption" align="center" display="block" sx={{ mt: 3, color: 'text.secondary', fontWeight: 500 }}>
          Bằng việc đăng ký, bạn đồng ý với các Điều khoản và Chính sách của đối tác Pickleball Court Marketplace.
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default RegisterOwnerPage;
