import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <Container sx={{ py: 15, textAlign: 'center' }}>
    <Box sx={{ fontSize: '6rem', fontWeight: 900, color: 'primary.light', mb: 2 }}>404</Box>
    <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Trang không tồn tại 🛰️</Typography>
    <Typography color="text.secondary" sx={{ mb: 6, maxWidth: 500, mx: 'auto' }}>
      Có vẻ như bạn đã đi lạc vào một sân đấu không có trong lịch trình của chúng tôi. 
      Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
    </Typography>
    <Button 
      component={Link} 
      to="/" 
      variant="contained" 
      size="large"
      sx={{ px: 6, py: 1.5, borderRadius: 2, fontWeight: 900 }}
    >
      Về trang chủ
    </Button>
  </Container>
);

export default NotFound;
