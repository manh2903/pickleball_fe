import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Box, InputAdornment, IconButton, Typography, Checkbox, FormControlLabel, Grid } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Phone } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { authApi } from '@/api/authApi';
import AuthLayout from '@/layouts/AuthLayout';

const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'Bạn phải đồng ý với Điều khoản sử dụng' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeToTerms: true
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const response: any = await authApi.register(data);
      if (response.success) {
        enqueueSnackbar('Đăng ký thành công! Vui lòng đăng nhập.', { variant: 'success' });
        navigate('/login');
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Đăng ký thất bại', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Tham gia ngay" 
      subtitle="Đăng ký tài khoản để khám phá và đặt sân pickleball cực dễ dàng."
      bottomText="Đã có tài khoản?"
      bottomLink="/login"
      bottomLinkText="Đăng nhập ngay"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
        <TextField
          {...register('name')}
          label="Họ và Tên"
          placeholder="Nguyễn Văn A"
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

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
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
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              {...register('confirmPassword')}
              label="Xác nhận"
              type={showPassword ? 'text' : 'password'}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <FormControlLabel
          control={<Checkbox {...register('agreeToTerms')} />}
          label={
            <Typography variant="body2" color={errors.agreeToTerms ? 'error' : 'textSecondary'}>
              Tôi đồng ý với Điều khoản và Chính sách của Marketplace.
            </Typography>
          }
          sx={{ mt: 2 }}
        />
        {errors.agreeToTerms && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: -1 }}>
            {errors.agreeToTerms.message}
          </Typography>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, fontSize: '1.1rem' }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </Button>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default RegisterPage;
