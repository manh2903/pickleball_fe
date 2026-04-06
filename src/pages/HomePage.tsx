import { Box, Container, Typography, Button, Grid, Card, Stack, Divider, useTheme, Fade } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  PlayCircleFilled, Search, DateRange, 
  LocationOn, Star, VerifiedUser, 
  TrendingUp, Devices
} from '@mui/icons-material';

const HomePage = () => {
  const theme = useTheme();

  const features = [
    { 
      title: 'Tìm sân dễ dàng', 
      desc: 'Hệ thống bản đồ trực quan giúp bạn tìm thấy sân Pickleball gần nhất chỉ trong vài giây.',
      icon: <LocationOn sx={{ fontSize: 40 }} />,
      color: '#3B82F6'
    },
    { 
      title: 'Đặt lịch 24/7', 
      desc: 'Quy trình đặt sân hoàn toàn tự động, thanh toán linh hoạt qua VNPay hoặc tiền mặt.',
      icon: <DateRange sx={{ fontSize: 40 }} />,
      color: '#10B981'
    },
    { 
      title: 'Quản lý chuyên nghiệp', 
      desc: 'Dành cho chủ sân hệ thống quản lý lịch, nhân viên và doanh thu toàn diện.',
      icon: <VerifiedUser sx={{ fontSize: 40 }} />,
      color: '#F59E0B'
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative', 
        pt: { xs: 8, md: 20 }, 
        pb: { xs: 10, md: 25 },
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      }}>
        {/* Abstract Background Shapes */}
        <Box sx={{ 
          position: 'absolute', top: '-10%', right: '-5%', 
          width: '600px', height: '600px', 
          background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(80px)', zIndex: 0
        }} />
        <Box sx={{ 
          position: 'absolute', bottom: '10%', left: '-10%', 
          width: '500px', height: '500px', 
          background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(80px)', zIndex: 0
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Fade in timeout={1000}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                    <Box sx={{ px: 2, py: 0.5, bgcolor: 'primary.main', color: 'white', borderRadius: 10, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                      New Version 2.0
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      #1 Pickleball Platform in Vietnam
                    </Typography>
                  </Stack>

                  <Typography variant="h1" sx={{ 
                    fontSize: { xs: '3rem', md: '5rem' }, 
                    fontWeight: 950, 
                    lineHeight: 1,
                    mb: 3,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: '#0F172A',
                    letterSpacing: '-0.04em'
                  }}>
                    Đam mê rực cháy <br />
                    <Box component="span" sx={{ 
                      background: 'linear-gradient(90deg, #22C55E 0%, #10B981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>Đặt sân dễ dàng</Box>
                  </Typography>

                  <Typography variant="h5" sx={{ 
                    color: 'text.secondary', 
                    mb: 6, 
                    lineHeight: 1.6, 
                    maxWidth: 600,
                    fontWeight: 400
                  }}>
                    Khám phá hàng nghìn sân Pickleball chất lượng cao, kết nối cộng đồng người chơi và nâng tầm trải nghiệm thể thao của bạn cùng Pickleball Hub.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button 
                      component={Link} 
                      to="/marketplace" 
                      variant="contained" 
                      size="large"
                      startIcon={<Search />}
                      sx={{ 
                        px: 6, py: 2.2, borderRadius: 2, fontSize: '1.1rem', fontWeight: 800,
                        boxShadow: '0 20px 25px -5px rgba(34, 197, 94, 0.4)',
                        textTransform: 'none'
                      }}
                    >
                      Khám phá ngay
                    </Button>
                    <Button 
                      component={Link} 
                      to="/register-owner" 
                      variant="outlined" 
                      size="large"
                      sx={{ 
                        px: 6, py: 2.2, borderRadius: 2, fontSize: '1.1rem', fontWeight: 800,
                        borderWidth: 2, '&:hover': { borderWidth: 2 },
                        textTransform: 'none',
                        color: '#0F172A',
                        borderColor: '#E2E8F0'
                      }}
                    >
                      Dành cho chủ sân
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={4} sx={{ mt: 8 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 900 }}>500+</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Sân đấu</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 900 }}>10k+</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Người chơi</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 900 }}>4.9/5</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Đánh giá</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ position: 'relative' }}>
                <Box 
                  component="img" 
                  src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop"
                  sx={{ 
                    width: '100%', 
                    borderRadius: 8, 
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)',
                    transform: 'rotate(-2deg) scale(1.05)',
                    transition: 'all 0.5s',
                    '&:hover': { transform: 'rotate(0deg) scale(1.1)' }
                  }}
                />
                <Card sx={{ 
                  position: 'absolute', bottom: -40, left: -40, 
                  p: 3, borderRadius: 4, boxShadow: 10,
                  display: 'flex', alignItems: 'center', gap: 2,
                  bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)'
                }}>
                  <PlayCircleFilled color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>Video hướng dẫn</Typography>
                    <Typography variant="caption" color="text.secondary">Xem cách đặt sân trong 30s</Typography>
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 15 }}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography variant="caption" color="primary" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
            Tại sao chọn chúng tôi?
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, mt: 2, letterSpacing: '-0.02em' }}>
            Nền tảng Pickleball Toàn diện nhất
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{ 
                p: 5, height: '100%', borderRadius: 6, border: '1px solid #F1F5F9',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.1)' }
              }}>
                <Box sx={{ 
                  width: 80, height: 80, borderRadius: 3, bgcolor: f.color + '15', color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4
                }}>
                  {f.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>{f.title}</Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>{f.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#0F172A', color: 'white', py: 15 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>
            Sẵn sàng để bắt đầu trận đấu của bạn?
          </Typography>
          <Typography sx={{ opacity: 0.7, mb: 6, fontSize: '1.2rem' }}>
            Tham gia cùng hàng nghìn người chơi khác và trải nghiệm cách đặt sân hiện đại nhất.
          </Typography>
          <Button 
            component={Link} 
            to="/marketplace" 
            variant="contained" 
            size="large"
            sx={{ 
              px: 8, py: 2.5, borderRadius: 2, fontSize: '1.2rem', fontWeight: 900,
              bgcolor: 'white', color: '#0F172A', '&:hover': { bgcolor: '#F1F5F9' }
            }}
          >
            ĐẶT LỊCH NGAY
          </Button>
          
          <Grid container spacing={4} sx={{ mt: 10 }}>
            <Grid item xs={6} md={3}>
              <Stack alignItems="center" spacing={1}>
                <TrendingUp />
                <Typography variant="caption">Tăng trưởng nhanh</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={3}>
              <Stack alignItems="center" spacing={1}>
                <Devices />
                <Typography variant="caption">Đa nền tảng</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={3}>
              <Stack alignItems="center" spacing={1}>
                <Star />
                <Typography variant="caption">Dịch vụ 5 sao</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={3}>
              <Stack alignItems="center" spacing={1}>
                <PlayCircleFilled />
                <Typography variant="caption">Dễ sử dụng</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
