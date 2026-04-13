import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Box, InputAdornment, IconButton, Divider } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';
import AuthLayout from '@/layouts/AuthLayout';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response: any = await authApi.login(data);
      if (response.success) {
        setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
        enqueueSnackbar('Đăng nhập thành công!', { variant: 'success' });
        navigate('/');
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Đăng nhập thất bại', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Chào mừng quay lại" 
      subtitle="Đăng nhập để đặt sân và tham gia cộng đồng Pickleball."
      bottomText="Chưa có tài khoản?"
      bottomLink="/register"
      bottomLinkText="Đăng ký ngay"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
        <TextField
          {...formRegister('email')}
          label="Email"
          placeholder="your@email.com"
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
          {...formRegister('password')}
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
            sx={{ py: 1.5, fontSize: '1.1rem' }}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>hoặc</Divider>

        <Button
          fullWidth
          variant="outlined"
          size="medium"
          color="secondary"
          onClick={() => navigate('/register-owner')}
          sx={{ borderStyle: 'dashed' }}
        >
          Bạn là chủ sân? Đăng ký tại đây
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;
