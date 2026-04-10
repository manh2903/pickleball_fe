import { Box, Container, Grid, Typography, Link as MuiLink, Stack, IconButton, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, LinkedIn, Twitter, LocationOn, Phone, Email } from '@mui/icons-material';

const exploreLinks = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Tìm kiếm sân', path: '/marketplace' },
  { label: 'Bản đồ khu vực', path: '#' },
  { label: 'Về chúng tôi', path: '#' },
];

const supportLinks = [
  { label: 'Quy định đặt sân', path: '#' },
  { label: 'Chính sách hoàn tiền', path: '#' },
  { label: 'Dành cho quản trị', path: '#' },
  { label: 'Liên hệ quảng cáo', path: '#' },
];

const Footer = () => {
  return (
    <Box component="footer" sx={{ 
      bgcolor: '#F8FAFC', 
      color: '#475569', 
      pt: 10, 
      pb: 4,
      borderTop: '1px solid #E2E8F0'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          {/* Brand Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ mr: 1.5 }}>🏓</Box> Pickleball Court Marketplace
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 4, maxWidth: 320 }}>
              Nền tảng đặt sân Pickleball hàng đầu Việt Nam. Chúng tôi kết nối người chơi với những sân đấu chất lượng nhất, mang lại trải nghiệm thể thao chuyên nghiệp và tiện lợi.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {[Facebook, Instagram, Twitter, LinkedIn].map((Icon, i) => (
                <IconButton key={i} size="small" sx={{ 
                  color: '#64748B', 
                  border: '1px solid #E2E8F0',
                  bgcolor: '#fff',
                  transition: 'all 0.3s',
                  '&:hover': { color: '#16A34A', borderColor: '#16A34A', transform: 'translateY(-3px)', boxShadow: '0 4px 12px rgba(22,163,74,0.15)' }
                }}>
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2.5}>
            <Typography sx={{ color: '#0F172A', fontWeight: 700, mb: 3, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 1 }}>
              Khám phá
            </Typography>
            <Stack spacing={2}>
              {exploreLinks.map((link) => (
                <MuiLink key={link.label} component={Link} to={link.path} sx={{ 
                  color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', 
                  transition: '0.2s', '&:hover': { color: '#16A34A', pl: 0.5 } 
                }}>
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* Support */}
          <Grid item xs={6} md={2.5}>
            <Typography sx={{ color: '#0F172A', fontWeight: 700, mb: 3, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 1 }}>
              Hỗ trợ
            </Typography>
            <Stack spacing={2}>
              {supportLinks.map((link) => (
                <MuiLink key={link.label} component={Link} to={link.path} sx={{ 
                  color: 'inherit', textDecoration: 'none', fontSize: '0.9rem', 
                  transition: '0.2s', '&:hover': { color: '#16A34A', pl: 0.5 } 
                }}>
                  {link.label}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography sx={{ color: '#0F172A', fontWeight: 700, mb: 3, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 1 }}>
              Liên hệ
            </Typography>
            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <LocationOn sx={{ color: '#16A34A', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#334155' }}>
                  227 Nguyễn Văn Cừ, Quận 5,<br />TP. Hồ Chí Minh, Việt Nam
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Phone sx={{ color: '#16A34A', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#334155' }}>+84 (0) 123 456 789</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Email sx={{ color: '#16A34A', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#334155' }}>support@pickleballhub.vn</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 8, mb: 4, borderColor: '#E2E8F0' }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            © 2024 Pickleball Court Marketplace. Tất cả quyền được bảo lưu.
          </Typography>
          <Stack direction="row" spacing={3}>
            {['Điều khoản', 'Bảo mật', 'Cookies'].map((item) => (
              <MuiLink key={item} href="#" sx={{ color: '#94A3B8', fontSize: '0.75rem', textDecoration: 'none', '&:hover': { color: '#16A34A' } }}>
                {item}
              </MuiLink>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
